import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {writeAtomicFile, readFileString} from "@aniojs/node-fs"
import path from "node:path"

export async function compileFiles(
	session: InternalSession
) {
	for (const file of session.state.allProjectFiles!) {
		const contents = await readFileString(
			path.join(
				session.projectRoot, "build", file.relativePath
			)
		)

		const ret = await session.targetIntegrationAPI.compile(
			session.publicAPI, file, contents
		)

		if (ret === "unsupported") {
			session.emitMessage(
				"warning", `Ignoring unsupported file '${file.relativePath}'`
			)

			continue
		} else if (ret === "skip") {
			session.emitMessage(
				"info", `Skipping file '${file.relativePath}'`
			)

			continue
		} else if (ret === "copy") {
			await writeAtomicFile(
				path.join(
					session.projectRoot,
					"objects",
					file.relativePath
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
					path.dirname(file.relativePath),
					objectFile.name
				)
			} else {
				destinationPath = path.normalize(objectFile.path)
			}

			await writeAtomicFile(
				path.join(session.projectRoot, "objects", destinationPath),
				objectFile.contents
			)
		}
	}
}
