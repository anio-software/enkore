import path from "node:path"
import {copy, writeAtomicFile} from "@aniojs/node-fs"
import fs from "node:fs/promises"
import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {fileNameIndicatesPreprocessable} from "@enkore/common"

export async function preprocessFiles(
	session: InternalSession
) {
	const files = session.state.projectDirectoryEntries!.filter(e => {
		return e.type === "regularFile"
	})

	const {preprocessSourceFile} = session.realmIntegrationAPI

	async function preprocess(filePath: string, str: string) {
		let newStr = str

		if (session.projectConfig.buildConstants) {
			for (const name in session.projectConfig.buildConstants) {
				const replaceWith = session.projectConfig.buildConstants[name]

				newStr = newStr.split(`%%${name}%%`).join(replaceWith)
			}
		}

		if (typeof preprocessSourceFile === "function") {
			newStr = await preprocessSourceFile(
				session.publicAPI, filePath, newStr
			)
		}

		return newStr
	}

	for (const file of files) {
		const destFilePath = path.join(
			session.projectRoot,
			"build",
			file.relative_path
		)

		if (!fileNameIndicatesPreprocessable(file.name)) {
			await copy(file.absolute_path, destFilePath)

			continue
		}

		const sourceCode = (await fs.readFile(
			file.absolute_path
		)).toString()

		await writeAtomicFile(
			destFilePath,
			await preprocess(file.relative_path, sourceCode)
		)
	}
}
