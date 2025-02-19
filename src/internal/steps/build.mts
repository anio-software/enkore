import type {InternalSession} from "../InternalSession.d.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"

import preInit from "./0.preInit/index.mts"

export async function build(
	session: InternalSession
) : Promise<{
	messages: NodeAPIMessage[]
}> {
	const {clean} = await preInit.runStep(session)

	const {messages: cleanMessages, autogenerate} = await clean()

	const {messages: autogenerateMessages, preprocess} = await autogenerate()
	const {messages: preprocessMessages, init} = await preprocess()
	const {messages: initMessages, lint} = await init()
	const {messages: lintMessages, compile} = await lint()
	const {messages: compileMessages, buildProducts} = await compile()
	const {messages: buildProductsMessages} = await buildProducts(null)

	return {
		messages: [
			...cleanMessages,
			...autogenerateMessages,
			...preprocessMessages,
			...initMessages,
			...lintMessages,
			...compileMessages,
			...buildProductsMessages
		]
	}
}
