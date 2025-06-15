import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {
	EnkoreProjectFile,
	EnkoreBuildFile
} from "@anio-software/enkore-private.spec"
import {getEmitFileMessage} from "#~src/internal/getEmitFileMessage.mts"
import {isFunction} from "@anio-software/pkg.is"
import path from "node:path"
import {readFileString} from "@aniojs/node-fs"

export async function lintFiles(
	session: InternalSession,
	files: EnkoreProjectFile[] | EnkoreBuildFile[]
) {
	const {lint} = session.targetIntegrationAPI

	if (!isFunction(lint)) {
		return
	}

	for (const file of files) {
		const code = await readFileString(
			path.join(
				session.projectRoot, "build", file.relativePath
			)
		)

		const emitFileMessage = getEmitFileMessage(session, file.relativePath)
		const lintMessages = await lint(session.publicAPI, file, code, emitFileMessage)

		// this is unclean, should i return
		// those instead?
		for (const message of lintMessages) {
			if (message.id) {
				session.emitMessage(message.severity, message.message, message.id)
			} else {
				session.emitMessage(message.severity, message.message)
			}
		}
	}
}
