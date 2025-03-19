import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"
import type {Step} from "#~src/internal/Step.d.mts"

type ExtendedNodeAPIMessage = NodeAPIMessage & {
	step: string
}

import preInit from "#~src/internal/steps/0.preInit/index.mts"

export async function runAllSteps(
	session: InternalSession
): Promise<{
	messages: ExtendedNodeAPIMessage[]
}> {
	const {messages: preInitMessages, clean} = await preInit.runStep(session)
	const {messages: cleanMessages, autogenerate} = await clean()
	const {messages: autogenerateMessages, preprocess} = await autogenerate()
	const {messages: preprocessMessages, init} = await preprocess()
	const {messages: initMessages, lint} = await init()
	const {messages: lintMessages, compile} = await lint()
	const {messages: compileMessages, buildProducts} = await compile()
	const {messages: buildProductsMessages} = await buildProducts(null)

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
			...map("buildProducts", buildProductsMessages)
		]
	}
}
