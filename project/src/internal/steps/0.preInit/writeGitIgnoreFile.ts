import type {InternalSession} from "#~src/internal/InternalSession.ts"
import {isFileSync, writeAtomicFile, readFileString} from "@anio-software/pkg.node-fs"
import {getGitIgnoredFiles} from "#~src/internal/getGitIgnoredFiles.ts"
import {gitIgnoreMarkerUUID} from "@anio-software/enkore-private.spec/uuid"
import path from "node:path"

async function getAutoSection(
	session: InternalSession
) {
	const getTargetGitIgnoredFiles = session.targetIntegrationAPI.getGitIgnoredFiles
	let gitIgnoreFiles = [
		...getGitIgnoredFiles()
	]

	if (typeof getTargetGitIgnoredFiles === "function") {
		gitIgnoreFiles = [
			...gitIgnoreFiles,
			...await getTargetGitIgnoredFiles(session.publicAPI)
		]
	}

	gitIgnoreFiles.sort((a, b) => {
		return a.localeCompare(b, "en")
	})

	let section = ``

	section += `# Section managed by enkore ; DO NOT ADD ENTRIES AFTER THIS LINE! (${gitIgnoreMarkerUUID})\n`
	section += gitIgnoreFiles.join("\n")

	return section
}

export async function writeGitIgnoreFile(
	session: InternalSession
) {
	const autoSection = await getAutoSection(session)
	const gitIgnorePath = path.join(session.projectRoot, ".gitignore")

	if (!isFileSync(gitIgnorePath)) {
		session.emitMessage("info", "created .gitignore")

		await writeAtomicFile(gitIgnorePath, `# This file is partially managed by enkore
# Add your own entries below this comment:



${autoSection}\n`)

		return
	}

	const currentGitIgnore = await readFileString(gitIgnorePath)
	const lines = currentGitIgnore.split("\n")
	let offset = -1

	for (let i = 0; i < lines.length; ++i) {
		if (lines[i].includes(gitIgnoreMarkerUUID)) {
			offset = i

			break
		}
	}

	if (offset === -1) {
		session.emitMessage("warning", "unable to find managed section inside .gitignore")

		return
	}

	let newGitIgnore = lines.slice(0, offset).join("\n")
	newGitIgnore += `\n${autoSection}\n`

	await writeAtomicFile(gitIgnorePath, newGitIgnore)
}
