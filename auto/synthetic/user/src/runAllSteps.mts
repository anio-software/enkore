import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"
import type {Step} from "#~synthetic/user/Steps.d.mts"

type ExtendedNodeAPIMessage = NodeAPIMessage & {
	step: string
}

import preInit from "#~src/internal/steps/0.preInit/index.mts"
import {hasErrors} from "#~src/internal/steps/defineStepChecked.mts"

function emitStoppedBecauseOfError(
	session: InternalSession,
	step: Step
): ExtendedNodeAPIMessage {
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

	//
	// While a step is running its emitted messages
	// are automatically collected. However, this won't happen here
	// for 'stoppedBecauseOfErrorMessage' because the step has already
	// finished execution.
	//
	return stoppedBecauseOfErrorMessage
}

export async function runAllSteps(
	session: InternalSession,
	runTests: boolean,
	runPublish: boolean
): Promise<{
	messages: ExtendedNodeAPIMessage[]
}> {
	const shouldStop = session.options._forceBuild !== true
	let aggregatedMessages: ExtendedNodeAPIMessage[] = []

	const {messages: preInitMessages, clean} = await preInit.runStep(session)
	aggregatedMessages = [...aggregatedMessages, ...map("preInit", preInitMessages)]
	if (hasErrors(preInitMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "preInit")]};
	}

	const {messages: cleanMessages, autogenerate} = await clean()
	aggregatedMessages = [...aggregatedMessages, ...map("clean", cleanMessages)]
	if (hasErrors(cleanMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "clean")]};
	}

	const {messages: autogenerateMessages, preprocess} = await autogenerate()
	aggregatedMessages = [...aggregatedMessages, ...map("autogenerate", autogenerateMessages)]
	if (hasErrors(autogenerateMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "autogenerate")]};
	}

	const {messages: preprocessMessages, init} = await preprocess()
	aggregatedMessages = [...aggregatedMessages, ...map("preprocess", preprocessMessages)]
	if (hasErrors(preprocessMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "preprocess")]};
	}

	const {messages: initMessages, lint} = await init()
	aggregatedMessages = [...aggregatedMessages, ...map("init", initMessages)]
	if (hasErrors(initMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "init")]};
	}

	const {messages: lintMessages, compile} = await lint()
	aggregatedMessages = [...aggregatedMessages, ...map("lint", lintMessages)]
	if (hasErrors(lintMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "lint")]};
	}

	const {messages: compileMessages, buildProducts} = await compile()
	aggregatedMessages = [...aggregatedMessages, ...map("compile", compileMessages)]
	if (hasErrors(compileMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "compile")]};
	}

	const {messages: buildProductsMessages, testProducts} = await buildProducts(null)
	aggregatedMessages = [...aggregatedMessages, ...map("buildProducts", buildProductsMessages)]
	if (hasErrors(buildProductsMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "buildProducts")]};
	}

	const {messages: testProductsMessages, publishProducts} = await testProducts(null)
	aggregatedMessages = [...aggregatedMessages, ...map("testProducts", testProductsMessages)]
	if (hasErrors(testProductsMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "testProducts")]};
	}

	const {messages: publishProductsMessages} = await publishProducts(null)
	aggregatedMessages = [...aggregatedMessages, ...map("publishProducts", publishProductsMessages)]
	if (hasErrors(publishProductsMessages) && shouldStop) {
		return {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "publishProducts")]};
	}

	function map(step: Step, messages: NodeAPIMessage[]) {
		return messages.map(x => {
			return {...x, step}
		})
	}

	return {
		messages: aggregatedMessages
	}
}
