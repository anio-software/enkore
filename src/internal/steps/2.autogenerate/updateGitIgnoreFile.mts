import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {writeAtomicFile} from "@aniojs/node-fs"
import path from "node:path"

export async function updateGitIgnoreFile(
	session: InternalSession
) {
	let gitIgnoreSource = ``

	gitIgnoreSource += `# This file is automatically managed by enkore\n`
	gitIgnoreSource += `# DO NOT ADD ENTRIES HERE, THEY WILL BE REMOVED\n`

	for (const [key] of session.state.filesToAutogenerate.entries()) {
		gitIgnoreSource += `/${key}\n`
	}

	await writeAtomicFile(
		path.join(session.projectRoot, "project", ".gitignore"),
		gitIgnoreSource
	)
}
