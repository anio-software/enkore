import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import path from "node:path"
import {mkdirp} from "@aniojs/node-fs"

export async function replicateDirectoryTree(
	session: InternalSession
) {
	const dirs = session.state.projectDirectoryEntries!.filter(e => {
		return e.type === "regularDir"
	})

	for (const dir of dirs) {
		await mkdirp(
			path.join(session.projectRoot, ".build", dir.relative_path)
		)

		await mkdirp(
			path.join(session.projectRoot, ".objects", dir.relative_path)
		)
	}
}
