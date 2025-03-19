import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Step} from "#~src/internal/Step.d.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"
import {onStepStarted} from "#~src/internal/session/onStepStarted.mts"
import {onStepFinished} from "#~src/internal/session/onStepFinished.mts"

export function hasErrors(messages: NodeAPIMessage[]) {
	for (const msg of messages) {
		if (msg.severity === "error") {
			return true
		}
	}

	return false
}

export function defineStep<
	StepFn extends (session: InternalSession, ...args: any[]) => any
>(
	stepName: Step,
	stepFn: StepFn
) {
	type StepFnReturn = Awaited<ReturnType<StepFn>>

	return {
		name: stepName,
		runStep: async function(
			...args: Parameters<StepFn>
		) : Promise<StepFnReturn & {
			messages: NodeAPIMessage[]
		}> {
			const session = args[0]
			const aggregatedMessages: NodeAPIMessage[] = []
			let eventListenerId: number|null = null

			try {
				eventListenerId = session.events.on("message", e => {
					aggregatedMessages.push(e)
				})

				if (session.state.hasEncounteredError) {
					if (session.options._forceBuild !== true) {
						throw new Error(
							`Refusing to run next step after an error occurred in the previous one.`
						)
					} else {
						session.emitMessage(
							"warning",
							"continueOnError",
							`continuing even though errors occurred earlier.`
						)
					}
				}

				session.state.currentStep = stepName

				await onStepStarted(session, stepName)

				const fnResult = await stepFn(session, ...args.slice(1))

				if (hasErrors(aggregatedMessages)) {
					session.state.hasEncounteredError = true
				}

				return {
					...fnResult,
					messages: aggregatedMessages
				}
			} finally {
				if (eventListenerId !== null) {
					session.events.removeListener(eventListenerId)
				}

				await onStepFinished(session, stepName)

				session.state.currentStep = undefined
			}
		}
	}
}
