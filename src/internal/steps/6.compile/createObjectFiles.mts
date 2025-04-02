import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {writeAtomicFile, readFileString} from "@aniojs/node-fs"
import path from "node:path"

export async function createObjectFiles(
	session: InternalSession
) {
	for (const projectFile of session.state.allProjectFiles!) {
		const contents = await readFileString(
			path.join(
				session.projectRoot, "build", projectFile.relativePath
			)
		)

		const ret = await session.targetIntegrationAPI.compile(
			session.publicAPI, projectFile, contents
		)

		if (ret === "ignore") {
			session.emitMessage(
				"warning", `Ignoring unsupported file '${projectFile.relativePath}'`
			)

			continue
		} else if (ret === "copy") {
			await writeAtomicFile(
				path.join(
					session.projectRoot,
					"objects",
					projectFile.relativePath
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
					path.dirname(projectFile.relativePath),
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
