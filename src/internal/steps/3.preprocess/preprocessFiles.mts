import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {preprocessFile} from "#~src/internal/preprocess/preprocessFile.mts"

export async function preprocessFiles(
	session: InternalSession
) {
	for (const projectFile of session.state.allProjectFiles!) {
		const buildFiles = await preprocessFile(session, projectFile)

		for (const [_, buildFile] of buildFiles.entries()) {
			session.state.allBuildFiles.push(buildFile)
		}
	}
}
