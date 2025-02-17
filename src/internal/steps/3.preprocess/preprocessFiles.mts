import path from "node:path"
import {copy, writeAtomicFile} from "@aniojs/node-fs"
import fs from "node:fs/promises"
import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {EnkoreNodeAPIMessage} from "@enkore/spec"

function isPreProcessable(fileName: string) {
	const extensions = [
		".mts",
		".mjs",
		".html",
		".css",
		".styl",
		".c",
		".h",
		".txt",
		".svg",
		".vue"
	]

	for (const extension of extensions) {
		if (fileName.endsWith(extension)) {
			return true
		}
	}

	return false
}

export async function preprocessFiles(
	session: InternalSession
) : Promise<EnkoreNodeAPIMessage[]> {
	let messages: EnkoreNodeAPIMessage[] = []

	const files = session.projectDirectoryEntries!.filter(e => {
		return e.type === "regularFile"
	})

	const {preprocessSourceFile} = session.realmIntegrationAPI

	async function preProcess(filePath: string, str: string) {
		let newStr = str

		if (session.projectConfig.buildConstants) {
			for (const name in session.projectConfig.buildConstants) {
				const replaceWith = session.projectConfig.buildConstants[name]

				newStr = newStr.split(`%%${name}%%`).join(replaceWith)
			}
		}

		if (typeof preprocessSourceFile === "function") {
			const tmp = await preprocessSourceFile(
				session.publicAPI, filePath, newStr
			)

			newStr = tmp.source

			messages = [
				...messages,
				...tmp.messages
			]
		}

		return newStr
	}

	for (const file of files) {
		const destFilePath = path.join(
			session.projectRoot,
			".build",
			file.relative_path
		)

		if (!isPreProcessable(file.name)) {
			await copy(file.absolute_path, destFilePath)

			continue
		}

		const sourceCode = (await fs.readFile(
			file.absolute_path
		)).toString()

		await writeAtomicFile(
			destFilePath,
			await preProcess(file.relative_path, sourceCode)
		)
	}

	return messages
}
