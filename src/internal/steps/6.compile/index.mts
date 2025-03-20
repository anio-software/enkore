import type {Compile} from "#~synthetic/user/Steps.d.mts"
import {createObjectFiles} from "./createObjectFiles.mts"
import buildProducts from "../7.buildProducts/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"
import {runHook} from "#~src/internal/session/runHook.mts"

const executeStep: Compile = async function(session) {
	await runHook(session, "preCompile")
	await createObjectFiles(session)

	return {
		buildProducts: async function(productNames: string[]|null) {
			return await buildProducts.runStep(session, productNames)
		}
	}
}

export default defineStepChecked("compile", executeStep)
