import type {Lint} from "#~synthetic/user/Steps.ts"
import compile from "../6.compile/index.ts"
import {defineStepChecked} from "../defineStepChecked.ts"
import {runHook} from "#~src/internal/session/runHook.ts"
import {lintFile} from "./lintFile.ts"

const executeStep: Lint = async function (session) {
	await runHook(session, "preLint")

	for (const [_, file] of session.state.projectFiles.entries()) {
		await lintFile(session, file)
	}

	for (const [_, file] of session.state.buildFiles.entries()) {
		await lintFile(session, file)
	}

	return {
		compile: async function() {
			return await compile.runStep(session)
		}
	}
}

export default defineStepChecked("lint", executeStep)
