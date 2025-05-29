import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {
	EnkoreProjectFile,
	EnkoreVirtualProjectFile
} from "@anio-software/enkore-private.spec"
import {isFunction} from "@anio-software/pkg.is"
import path from "node:path"
import {readFileString} from "@aniojs/node-fs"

export async function lintFiles(
	session: InternalSession,
	files: EnkoreProjectFile[] | EnkoreVirtualProjectFile[]
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

		const lintMessages = await lint(session.publicAPI, file, code)

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
