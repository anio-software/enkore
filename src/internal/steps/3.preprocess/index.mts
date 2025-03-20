import type {Preprocess} from "#~synthetic/user/Steps.d.mts"
import {replicateDirectoryTree} from "./replicateDirectoryTree.mts"
import {preprocessFiles} from "./preprocessFiles.mts"
import init from "../4.init/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"

const executeStep: Preprocess = async function(session) {
	await replicateDirectoryTree(session)

	await preprocessFiles(session)

	return {
		init: async function() {
			return await init.runStep(session)
		}
	}
}

export default defineStepChecked("preprocess", executeStep)
