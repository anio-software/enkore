import type {Lint} from "#~synthetic/user/Steps.d.mts"
import compile from "../6.compile/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"
import {runHook} from "#~src/internal/session/runHook.mts"
import {lintFile} from "./lintFile.mts"

const executeStep: Lint = async function (session) {
	await runHook(session, "preLint")

	for (const [_, file] of session.state.projectFiles.entries()) {
		await lintFile(session, file)
	}

	for (const file of session.state.allBuildFiles!) {
		await lintFile(session, file)
	}

	return {
		compile: async function() {
			return await compile.runStep(session)
		}
	}
}

export default defineStepChecked("lint", executeStep)
