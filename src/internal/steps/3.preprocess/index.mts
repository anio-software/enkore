import type {Preprocess} from "#~synthetic/user/Steps.d.mts"
import {_replicateDirectoryTree} from "#~src/internal/_replicateDirectoryTree.mts"
import {preprocessFile} from "./preprocessFile.mts"
import init from "../4.init/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"
import path from "node:path"
import {scandir, scandirExt} from "@aniojs/node-fs"

const executeStep: Preprocess = async function(session) {
	const entries = await scandir(
		path.join(session.projectRoot, "project")
	)

	for (const entry of entries) {
		session.state.projectFilesAndDirectoriesOnDiskByRelativePath.set(
			entry.relative_path, entry
		)
	}

	await _replicateDirectoryTree(
		session.projectRoot,
		session.state.projectFilesAndDirectoriesOnDiskByRelativePath
	)

	// we don't care about the entries because
	// the build/ folder doesn't contain any files yet
	const {createScandirEntryFromPath} = await scandirExt(
		path.join(session.projectRoot, "build")
	)

	for (const projectFile of session.state.allProjectFiles!) {
		const buildFiles = await preprocessFile(session, projectFile)

		for (const [_, buildFile] of buildFiles.entries()) {
			session.state.buildFilesCreatedByPreprocessingStageByRelativePath.set(
				buildFile.relativePath,
				createScandirEntryFromPath(
					buildFile.absolutePath
				)
			)

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
