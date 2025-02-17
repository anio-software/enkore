import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Compile} from "../Steps.d.mts"
import {createObjectFiles} from "./createObjectFiles.mts"
import buildProducts from "../6.buildProducts/index.mts"
import {defineStep} from "../defineStep.mts"

async function executeStep(
	session: InternalSession
) : Promise<Compile> {
	await createObjectFiles(session)

	return {
		buildProducts: async function(productNames: string[]|null) {
			return await buildProducts.runStep(session, productNames)
		},
		messages: session.getAggregatedMessages()
	}
}

export default defineStep("compile", executeStep)
