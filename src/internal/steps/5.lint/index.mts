import type {Lint} from "#~synthetic/user/Steps.d.mts"
import compile from "../6.compile/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"
import {runHook} from "#~src/internal/session/runHook.mts"
import path from "node:path"
import {readFileString} from "@aniojs/node-fs"

const executeStep: Lint = async function (session) {
	await runHook(session, "preLint")

	const {lint} = session.targetIntegrationAPI

	if (typeof lint === "function") {
		for (const projectFile of session.state.allProjectFiles!) {
			const code = await readFileString(
				path.join(
					session.projectRoot, "build", projectFile.relativePath
				)
			)

			const lintMessages = await lint(
				session.publicAPI, projectFile, code
			)

			// this is unclean, should i return
			// those instead?
			for (const message of lintMessages) {
				if (message.id) {
					session.emitMessage(message.severity, message.message, message.id)
				} else {
					session.emitMessage(message.severity, message.message)
				}
			}
		}
	}

	return {
		compile: async function() {
			return await compile.runStep(session)
		}
	}
}

export default defineStepChecked("lint", executeStep)
