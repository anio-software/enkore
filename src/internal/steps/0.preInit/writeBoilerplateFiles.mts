import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {EnkoreBoilerplateFile} from "@enkore/spec"
import {getBoilerplateFiles} from "#~src/internal/getBoilerplateFiles.mts"
import path from "node:path"
import {isFileSync, writeAtomicFile} from "@aniojs/node-fs"
import {
	enkoreBoilerplateFileMarkerUUID,
	targetBoilerplateFileMarkerUUID
} from "@enkore/spec/uuid"

async function handleBoilerplateFile(
	session: InternalSession, file: EnkoreBoilerplateFile
) {
	const fullyManagedByEnkore = file.fullyManagedByEnkore === true

	//
	// enkore embeds metadata strings within auto-generated files
	// to track their origin and evaluate their freshness status.
	// "Freshness" indicates whether a file remains valid or has become stale.
	// enkore performs automated cleanup of stale generated files
	// based on this metadata.
	// this code ensures that this metadata is included in the file's content
	// for files that are always (i.e. managed) created by enkore.
	//
	if (fullyManagedByEnkore && file.requestedBy === "enkore") {
		if (!file.content.includes(enkoreBoilerplateFileMarkerUUID)) {
			session.emitMessage(
				`error`,
				undefined, // tbd
				`file '${file.path}' is missing enkore boilerplate file marker UUID.`
			)
		}
	} else if (fullyManagedByEnkore && file.requestedBy === "target") {
		if (!file.content.includes(targetBoilerplateFileMarkerUUID)) {
			session.emitMessage(
				`error`,
				undefined, // tbd
				`file '${file.path}' is missing target boilerplate file marker UUID.`
			)
		}
	}

	const absolutePath = path.join(session.projectRoot, file.path)

	if (isFileSync(absolutePath) && !fullyManagedByEnkore) {
		session.emitMessage("info", `skip writing '${file.path}', already exists`)

		return
	}

	session.emitMessage("info", `writing '${file.path}'`)

	await writeAtomicFile(
		absolutePath, file.content, {
			createParents: true,
			mode: file.fileIsExecutable === true ? 0o777 : 0o666
		}
	)
}

export async function writeBoilerplateFiles(
	session: InternalSession
) {
	let boilerplateFiles: EnkoreBoilerplateFile[] = [
		...getBoilerplateFiles()
	]

	const getTargetBoilerplateFiles = session.targetIntegrationAPI.getBoilerplateFiles

	if (typeof getTargetBoilerplateFiles === "function") {
		boilerplateFiles = [
			...boilerplateFiles,
			...await getTargetBoilerplateFiles(session.publicAPI)
		]
	}

	for (const file of boilerplateFiles) {
		await handleBoilerplateFile(session, file)
	}
}
