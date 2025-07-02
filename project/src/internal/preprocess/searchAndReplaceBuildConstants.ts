import type {InternalSession} from "../InternalSession.ts"

export function searchAndReplaceBuildConstants(
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
