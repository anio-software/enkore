import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Lint} from "../Steps.d.mts"
import {compile} from "../5.compile/index.mts"

export async function lint(
	session: InternalSession
) : Promise<Lint> {
	session.debugPrint(`stage:lint`)

	return {
		compile: async function() {
			return await compile(session)
		},
		messages: []
	}
}
