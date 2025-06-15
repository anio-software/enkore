import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {
	type EnkoreProjectFile,
	type EnkoreBuildFile
} from "@anio-software/enkore-private.spec"
import {getEmitFileMessage} from "#~src/internal/getEmitFileMessage.mts"
import {writeAtomicFile, readFileString} from "@aniojs/node-fs"
import path from "node:path"

async function createObjectFiles(
	session: InternalSession,
	files: EnkoreProjectFile[] | EnkoreBuildFile[]
) {
	for (const file of files) {
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

			const createdObjectFilesMap = session.state.createdObjectFilesByRelativeSourceFilePath

			if (!createdObjectFilesMap.has(file.relativePath)) {
				createdObjectFilesMap.set(file.relativePath, [])
			}

			createdObjectFilesMap.get(file.relativePath)!.push(destinationPath)
		}
	}
}

export async function compileFiles(session: InternalSession) {
	await createObjectFiles(session, session.state.allProjectFiles!)
	await createObjectFiles(session, session.state.allBuildFiles)
}
