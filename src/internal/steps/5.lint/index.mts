import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Lint} from "../Steps.d.mts"
import compile from "../6.compile/index.mts"
import {defineStep} from "../defineStep.mts"
import {runHook} from "#~src/internal/session/runHook.mts"
import path from "node:path"
import {readFileString} from "@aniojs/node-fs"

async function executeStep(
	session: InternalSession
) : Promise<Lint> {
	await runHook(session, "preLint")

	const {lint} = session.realmIntegrationAPI

	if (typeof lint === "function") {
		for (const entry of session.state.projectDirectoryEntries!) {
			if (entry.type !== "regularFile") continue
			if (entry.name.startsWith(".")) continue

			const code = await readFileString(
				path.join(
					session.projectRoot, "build", entry.relative_path
				)
			)

			const lintMessages = await lint(
				session.publicAPI, entry.relative_path, code
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

export default defineStep("lint", executeStep)
