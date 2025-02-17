import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Init} from "../Steps.d.mts"
import {clean} from "../clean/index.mts"

export async function init(
	session: InternalSession
) : Promise<Init> {
	return {
		clean: async function() {
			return await clean(session)
		},

		productNames: []
	}
}
