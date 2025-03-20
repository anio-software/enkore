import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"
import type {Step} from "#~synthetic/user/Steps.d.mts"

type ExtendedNodeAPIMessage = NodeAPIMessage & {
	step: string
}

import preInit from "#~src/internal/steps/0.preInit/index.mts"
import {hasErrors} from "#~src/internal/steps/defineStepChecked.mts"

function stoppedBecauseOfError(
	session: InternalSession,
	step: Step,
	stepMessages: NodeAPIMessage[]
): {
	messages: ExtendedNodeAPIMessage[]
} {
	const stoppedBecauseOfErrorMessage: ExtendedNodeAPIMessage = {
		step,
		id: "stoppedBecauseOfError",
		severity: "error",
		message: "Stopped execution because of previous errors."
	}

	session.emitMessage(
		stoppedBecauseOfErrorMessage.severity,
		stoppedBecauseOfErrorMessage.id,
		stoppedBecauseOfErrorMessage.message
	)

	return {
		messages: [
			...stepMessages.map(msg => {
				return {
					...msg,
					step
				}
			}),

			//
			// While a step is running its emitted messages
			// are automatically collected. However, this won't happen here
			// for 'stoppedBecauseOfErrorMessage' because the step has already 
			// finished execution.
			//
			stoppedBecauseOfErrorMessage
		]
	}
}

export async function runAllSteps(
	session: InternalSession
): Promise<{
	messages: ExtendedNodeAPIMessage[]
}> {
	const shouldStop = session.options._forceBuild !== true
	const {messages: preInitMessages, clean} = await preInit.runStep(session)

	if (hasErrors(preInitMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "preInit", preInitMessages)
	}

	const {messages: cleanMessages, autogenerate} = await clean()

	if (hasErrors(cleanMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "clean", cleanMessages)
	}

	const {messages: autogenerateMessages, preprocess} = await autogenerate()

	if (hasErrors(autogenerateMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "autogenerate", autogenerateMessages)
	}

	const {messages: preprocessMessages, init} = await preprocess()

	if (hasErrors(preprocessMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "preprocess", preprocessMessages)
	}

	const {messages: initMessages, lint} = await init()

	if (hasErrors(initMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "init", initMessages)
	}

	const {messages: lintMessages, compile} = await lint()

	if (hasErrors(lintMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "lint", lintMessages)
	}

	const {messages: compileMessages, buildProducts} = await compile()

	if (hasErrors(compileMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "compile", compileMessages)
	}

	const {messages: buildProductsMessages, testProducts} = await buildProducts(null)

	if (hasErrors(buildProductsMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "buildProducts", buildProductsMessages)
	}

	const {messages: testProductsMessages, publishProducts} = await testProducts(null)

	if (hasErrors(testProductsMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "testProducts", testProductsMessages)
	}

	const {messages: publishProductsMessages} = await publishProducts(null)

	if (hasErrors(publishProductsMessages) && shouldStop) {
		return stoppedBecauseOfError(session, "publishProducts", publishProductsMessages)
	}

	function map(step: Step, messages: NodeAPIMessage[]) {
		return messages.map(x => {
			return {...x, step}
		})
	}

	return {
		messages: [
			...map("preInit", preInitMessages),
			...map("clean", cleanMessages),
			...map("autogenerate", autogenerateMessages),
			...map("preprocess", preprocessMessages),
			...map("init", initMessages),
			...map("lint", lintMessages),
			...map("compile", compileMessages),
			...map("buildProducts", buildProductsMessages),
			...map("testProducts", testProductsMessages),
			...map("publishProducts", publishProductsMessages)
		]
	}
}
