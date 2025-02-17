import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Clean} from "../Steps.d.mts"
import {autogenerate} from "../autogenerate/index.mts"

export async function clean(
	session: InternalSession
) : Promise<Clean> {
	return {
		autogenerate: async function() {
			return await autogenerate(session)
		},
		messages: []
	}
}
