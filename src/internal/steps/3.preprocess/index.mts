import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Preprocess} from "../Steps.d.mts"
import {replicateDirectoryTree} from "./replicateDirectoryTree.mts"
import {preprocessFiles} from "./preprocessFiles.mts"
import init from "../4.init/index.mts"
import {defineStep} from "../defineStep.mts"

async function executeStep(
	session: InternalSession
) : Promise<Preprocess> {
	await replicateDirectoryTree(session)

	await preprocessFiles(session)

	return {
		init: async function() {
			return await init.runStep(session)
		}
	}
}

export default defineStep("preprocess", executeStep)
