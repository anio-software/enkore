import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {isPreprocessableFileName, isFunction, isString} from "@anio-software/pkg.is"
import {readFileString, writeAtomicFile, copy} from "@aniojs/node-fs"
import path from "node:path"

function searchAndReplaceBuildConstants(
	session: InternalSession,
	code: string
): string {
	let newCode = code

	if (session.projectConfig.buildConstants) {
		for (const name in session.projectConfig.buildConstants) {
			const replaceWith = session.projectConfig.buildConstants[name]

			newCode = newCode.split(`%%${name}%%`).join(replaceWith)
		}
	}

	return newCode
}

type Preprocess = NonNullable<
	InternalSession["targetIntegrationAPI"]["preprocess"]
>

export async function preprocessFiles(
	session: InternalSession
) {
	const preprocess: Preprocess = async (publicSession, file, code) => {
		code = searchAndReplaceBuildConstants(session, code)

		if (isFunction(session.targetIntegrationAPI.preprocess)) {
			return await session.targetIntegrationAPI.preprocess(
				publicSession, file, code
			)
		}

		return code
	}

	for (const projectFile of session.state.allProjectFiles!) {
		const defaultDestinationFilePath = path.join(
			session.projectRoot,
			"build",
			projectFile.relativePath
		)

		//
		// don't preprocess file that aren't preprocessable, just copy them
		//
		if (!isPreprocessableFileName(projectFile.fileName)) {
			await copy(projectFile.absolutePath, defaultDestinationFilePath)

			continue
		}

		const preprocessResult = await preprocess(
			session.publicAPI,
			projectFile,
			await readFileString(projectFile.absolutePath)
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
			}
		}
	}
}
