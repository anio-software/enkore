import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {
	type EnkoreProjectFile,
	type EnkoreBuildFile
} from "@anio-software/enkore-private.spec"
import {getEmitFileMessage} from "#~src/internal/getEmitFileMessage.mts"
import {writeAtomicFile, readFileString} from "@aniojs/node-fs"
import path from "node:path"

export async function compileFile(
	session: InternalSession,
	file: EnkoreProjectFile | EnkoreBuildFile
): Promise<string[]> {
	const contents = await readFileString(
		path.join(
			session.projectRoot, "build", file.relativePath
		)
	)

	const emitFileMessage = getEmitFileMessage(session, file.relativePath)

	const ret = await session.targetIntegrationAPI.compile(
		session.publicAPI, file, contents, emitFileMessage
	)

	if (ret === "unsupported") {
		session.emitMessage(
			"warning", `Ignoring unsupported file '${file.relativePath}'`
		)

		return []
	} else if (ret === "skip") {
		session.emitMessage(
			"info", `Skipping file '${file.relativePath}'`
		)

		return []
	} else if (ret === "copy") {
		await writeAtomicFile(
			path.join(
				session.projectRoot,
				"objects",
				file.relativePath
			),
			contents
		)

		return []
	}

	const createdObjectFiles: string[] = []
	const objectFiles = Array.isArray(ret) ? ret : [ret]

	for (const objectFile of objectFiles) {
		let destinationPath = ""

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

		createdObjectFiles.push(destinationPath)
	}

	return createdObjectFiles
}
