import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Compile} from "../Steps.d.mts"
import {createObjectFiles} from "./createObjectFiles.mts"
import buildProducts from "../7.buildProducts/index.mts"
import {defineStep} from "../defineStep.mts"
import {runHook} from "#~src/internal/session/runHook.mts"

async function executeStep(
	session: InternalSession
) : Promise<Compile> {
	await runHook(session, "preCompile")
	await createObjectFiles(session)

	return {
		buildProducts: async function(productNames: string[]|null) {
			return await buildProducts.runStep(session, productNames)
		}
	}
}

export default defineStep("compile", executeStep)
