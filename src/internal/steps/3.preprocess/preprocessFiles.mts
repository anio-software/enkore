import path from "node:path"
import {copy, writeAtomicFile, readFileString} from "@aniojs/node-fs"
import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {fileNameIndicatesPreprocessable} from "@asint/enkore__common"
import type {EnkoreProjectFile} from "@asint/enkore__spec"

export async function preprocessFiles(
	session: InternalSession
) {
	const {preprocess} = session.targetIntegrationAPI

	async function preprocessFile(projectFile: EnkoreProjectFile, str: string) {
		let newStr = str

		if (session.projectConfig.buildConstants) {
			for (const name in session.projectConfig.buildConstants) {
				const replaceWith = session.projectConfig.buildConstants[name]

				newStr = newStr.split(`%%${name}%%`).join(replaceWith)
			}
		}

		if (typeof preprocess === "function") {
			newStr = await preprocess(
				session.publicAPI, projectFile, newStr
			)
		}

		return newStr
	}

	for (const projectFile of session.state.allProjectFiles!) {
		const destFilePath = path.join(
			session.projectRoot,
			"build",
			projectFile.relativePath
		)

		if (!fileNameIndicatesPreprocessable(projectFile.fileName)) {
			await copy(projectFile.absolutePath, destFilePath)

			continue
		}

		const sourceCode = await readFileString(projectFile.absolutePath)

		await writeAtomicFile(
			destFilePath,
			await preprocessFile(projectFile, sourceCode)
		)
	}
}
