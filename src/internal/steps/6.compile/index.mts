import type {Compile} from "#~synthetic/user/Steps.d.mts"
import {compileFile} from "./compileFile.mts"
import buildProducts from "../7.buildProducts/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"
import {runHook} from "#~src/internal/session/runHook.mts"

const executeStep: Compile = async function(session) {
	await runHook(session, "preCompile")

	for (const file of session.state.allProjectFiles!) {
		await compileFile(session, file)
	}

	for (const file of session.state.allBuildFiles) {
		await compileFile(session, file)
	}

	session.state.hasFinishedCompiling = true

	return {
		buildProducts: async function(productNames: string[]|null) {
			return await buildProducts.runStep(session, productNames)
		}
	}
}

export default defineStepChecked("compile", executeStep)
