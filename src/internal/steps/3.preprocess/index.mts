import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Preprocess} from "../Steps.d.mts"
import {replicateDirectoryTree} from "./replicateDirectoryTree.mts"
import {preprocessFiles} from "./preprocessFiles.mts"
import lint from "../4.lint/index.mts"
import {defineStep} from "../defineStep.mts"

async function executeStep(
	session: InternalSession
) : Promise<Preprocess> {
	await replicateDirectoryTree(session)

	await preprocessFiles(session)

	return {
		lint: async function() {
			return await lint.runStep(session)
		},
		messages: session.getAggregatedMessages()
	}
}

export default defineStep("preprocess", executeStep)
