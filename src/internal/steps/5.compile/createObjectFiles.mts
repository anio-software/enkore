import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {writeAtomicFile} from "@aniojs/node-fs"
import fs from "node:fs/promises"
import path from "node:path"

export async function createObjectFiles(
	session: InternalSession
) {
	for (const entry of session.projectDirectoryEntries!) {
		if (entry.type !== "regularFile") continue
		if (entry.name.startsWith(".")) continue

		const contents = (await fs.readFile(
			path.join(
				session.projectRoot, ".build", entry.relative_path
			)
		)).toString()

		const ret = await session.realmIntegrationAPI.generateObjectFile(
			session.publicAPI, entry.relative_path, contents
		)

		if (ret === "ignore") {
			session.publicAPI.emitMessage({
				severity: "warn",
				id: undefined,
				message: `Ignoring unsupported file '${entry.name}'`
			})

			continue
		} else if (ret === "copy") {
			await writeAtomicFile(
				path.join(
					session.projectRoot,
					".objects",
					entry.relative_path
				),
				contents
			)

			continue
		}

		const objectFiles = Array.isArray(ret) ? ret : [ret]

		for (const objectFile of objectFiles) {
			let destinationPath : string = ""

			if ("name" in objectFile) {
				destinationPath = path.join(
					path.dirname(entry.relative_path),
					objectFile.name
				)
			} else {
				destinationPath = path.normalize(objectFile.path)
			}

			await writeAtomicFile(
				path.join(session.projectRoot, ".objects", destinationPath),
				objectFile.contents
			)
		}
	}
}
