import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import {isFunction} from "@anio-software/pkg.is"

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

type Preprocess = NonNullable<
	InternalSession["targetIntegrationAPI"]["preprocess"]
>

export async function preprocessFiles(
	session: InternalSession
) {
	const preprocess: Preprocess = async (publicSession, file, code) => {
		code = searchAndReplaceBuildConstants(session, code)

		if (isFunction(session.targetIntegrationAPI.preprocess)) {
			return await session.targetIntegrationAPI.preprocess(
				publicSession, file, code
			)
		}

		return code
	}
}
