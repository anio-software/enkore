import type {
	Step,
	StepsMap
} from "#~synthetic/user/Steps.d.mts"
import type {InternalSession} from "../InternalSession.d.mts"
import type {NodeAPIMessage} from "@anio-software/enkore-private.spec/primitives"
import {onStepStarted} from "#~src/internal/session/onStepStarted.mts"
import {onStepFinished} from "#~src/internal/session/onStepFinished.mts"
import type {EventListener} from "@anio-software/pkg.event-emitter"

export type * from "#~synthetic/user/Steps.d.mts"

type Ret<StepName extends Step> = {
	stepName: StepName,
	runStep: (
		...args: Parameters<StepsMap[StepName]>
	) => Promise<Awaited<ReturnType<StepsMap[StepName]>> & {
		messages: NodeAPIMessage[]
	}>
}

export function hasErrors(messages: NodeAPIMessage[]) {
	for (const msg of messages) {
		if (msg.severity === "error") {
			return true
		}
	}

	return false
}

function checkHasEncounteredError(session: InternalSession) {
	if (session.state.hasEncounteredError) {
		if (session.options._forceBuild !== true) {
			throw new Error(
				`Refusing to run next step after an error occurred in the previous one.`
			)
		}

		session.emitMessage(
			"warning",
			"continueOnError",
			`continuing even though errors occurred earlier.`
		)
	}
}

export function defineStepChecked<StepName extends Step>(
	stepName: StepName,
	executeStep: (
		...args: Parameters<StepsMap[StepName]>
	) => ReturnType<StepsMap[StepName]>
): Ret<StepName> {
	return {
		stepName,
		async runStep(...args) {
			const session = args[0]
			const aggregatedMessages: NodeAPIMessage[] = []
			let eventListenerId: EventListener|false = false

			try {
				eventListenerId = session.events.on("message", e => {
					aggregatedMessages.push(e)
				})

				checkHasEncounteredError(session)

				session.state.currentStep = stepName

				await onStepStarted(session, stepName)

				const fnResult = await executeStep(...args)

				if (hasErrors(aggregatedMessages)) {
					session.state.hasEncounteredError = true
				}

				return {
					...fnResult,
					messages: aggregatedMessages
				}
			} finally {
				if (eventListenerId) {
					session.events.removeEventListener(eventListenerId)
				}

				await onStepFinished(session, stepName)

				session.state.currentStep = undefined
			}
		}
	}
}
