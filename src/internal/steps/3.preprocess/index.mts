import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Preprocess} from "../Steps.d.mts"
import {lint} from "../4.lint/index.mts"

export async function preprocess(
	session: InternalSession
) : Promise<Preprocess> {
	return {
		lint: async function() {
			return await lint(session)
		},
		messages: []
	}
}
