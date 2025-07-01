import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {
	EnkoreProjectFile,
	EnkoreBuildFile
} from "@anio-software/enkore-private.spec"
import {getEmitFileMessage} from "#~src/internal/getEmitFileMessage.mts"
import {isFunction} from "@anio-software/pkg.is"
import path from "node:path"
import {readFileString} from "@anio-software/pkg.node-fs"

export async function lintFile(
	session: InternalSession,
	file: EnkoreProjectFile | EnkoreBuildFile
) {
	const {lint} = session.targetIntegrationAPI

	if (!isFunction(lint)) {
		return
	}

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
			emitFileMessage(message.severity, message.message, message.id)
		} else {
			emitFileMessage(message.severity, message.message)
		}
	}
}
