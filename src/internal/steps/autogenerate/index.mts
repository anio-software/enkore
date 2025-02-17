import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Autogenerate} from "../Steps.d.mts"
import {preprocess} from "../preprocess/index.mts"

export async function autogenerate(
	session: InternalSession
) : Promise<Autogenerate> {
	return {
		preprocess: async function() {
			return await preprocess(session)
		},
		messages: []
	}
}
