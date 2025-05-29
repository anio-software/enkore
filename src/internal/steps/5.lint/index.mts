import type {Lint} from "#~synthetic/user/Steps.d.mts"
import compile from "../6.compile/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"
import {runHook} from "#~src/internal/session/runHook.mts"
import {lintFiles} from "./lintFiles.mts"

const executeStep: Lint = async function (session) {
	await runHook(session, "preLint")

	await lintFiles(session, session.state.allProjectFiles!)
	await lintFiles(session, session.state._virtualProjectFiles)

	return {
		compile: async function() {
			return await compile.runStep(session)
		}
	}
}

export default defineStepChecked("lint", executeStep)
