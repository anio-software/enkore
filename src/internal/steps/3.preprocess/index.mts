import type {Preprocess} from "#~synthetic/user/Steps.d.mts"
import {replicateDirectoryTree} from "./replicateDirectoryTree.mts"
import {preprocessFile} from "#~src/internal/preprocess/preprocessFile.mts"
import init from "../4.init/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"

const executeStep: Preprocess = async function(session) {
	await replicateDirectoryTree(session)

	for (const projectFile of session.state.allProjectFiles!) {
		const buildFiles = await preprocessFile(session, projectFile)

		for (const [_, buildFile] of buildFiles.entries()) {
			session.state.allBuildFiles.push(buildFile)
		}
	}

	return {
		init: async function() {
			return await init.runStep(session)
		}
	}
}

export default defineStepChecked("preprocess", executeStep)
