import type {InternalSession} from "#~src/internal/InternalSession.ts"
import {
	type EnkoreProjectFile,
	type EnkoreBuildFile,
	createEntity
} from "@anio-software/enkore-private.spec"
import {searchAndReplaceBuildConstants} from "#~src/internal/preprocess/searchAndReplaceBuildConstants.ts"
import {getEmitFileMessage} from "#~src/internal/getEmitFileMessage.ts"
import {isFunction, isPreprocessableFileName, isString} from "@anio-software/pkg.is"
import {copy, readFileString, writeAtomicFile, isFileSync} from "@anio-software/pkg.node-fs"
import path from "node:path"

type Preprocess = NonNullable<
	InternalSession["targetIntegrationAPI"]["preprocess"]
>

export async function preprocessSingleFile(
	session: InternalSession, projectFile: EnkoreProjectFile
): Promise<Map<string, EnkoreBuildFile>> {
	const map: Map<string, EnkoreBuildFile> = new Map()
	const preprocess: Preprocess = async (publicSession, file, code, emitFileMessage) => {
		code = searchAndReplaceBuildConstants(session, code)

		if (isFunction(session.targetIntegrationAPI.preprocess)) {
			return await session.targetIntegrationAPI.preprocess(
				publicSession, file, code, emitFileMessage
			)
		}

		return code
	}

	const defaultDestinationFilePath = path.join(
		session.projectRoot,
		"build",
		projectFile.relativePath
	)

	//
	// don't preprocess file that aren't preprocessable, just copy them
	//
	if (!isPreprocessableFileName(projectFile.fileName)) {
		await copy({
			source: projectFile.absolutePath,
			destination: defaultDestinationFilePath
		})

		return map
	}

	const emitFileMessage = getEmitFileMessage(session, projectFile.relativePath)
	const preprocessResult = await preprocess(
		session.publicAPI,
		projectFile,
		await readFileString(projectFile.absolutePath),
		emitFileMessage
	)

	if (isString(preprocessResult)) {
		await writeAtomicFile(defaultDestinationFilePath, preprocessResult)
	} else {
		const files = Array.isArray(
			preprocessResult
		) ? preprocessResult : [preprocessResult]

		for (const file of files) {
			let destinationPath = ""

			if ("name" in file) {
				destinationPath = path.join(
					path.dirname(projectFile.relativePath),
					file.name
				)
			} else {
				destinationPath = path.normalize(file.path)
			}

			await writeAtomicFile(
				path.join(session.projectRoot, "build", destinationPath),
				file.contents
			)

			//
			// if the destinationPath doesn't exist within project/
			// we assume it resides within build/
			// (that's also why they are called EnkoreBuildFile)
			//
			if (!isFileSync(
				path.join(session.projectRoot, "project", destinationPath))
			) {
				const buildFile = createEntity("EnkoreBuildFile", 0, 0, {
					fileName: path.basename(destinationPath),
					relativePath: destinationPath,
					absolutePath: path.join(
						session.projectRoot,
						"build",
						destinationPath
					)
				})

				map.set(buildFile.relativePath, buildFile)
			}
		}
	}

	return map
}
