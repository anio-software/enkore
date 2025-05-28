import type {InternalSession} from "#~src/internal/InternalSession.d.mts"

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

export async function preprocessFiles(
	session: InternalSession
) {
	const {preprocess} = session.targetIntegrationAPI


}
