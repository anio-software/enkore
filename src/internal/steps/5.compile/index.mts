import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Compile} from "../Steps.d.mts"
import {buildProducts} from "../6.buildProducts/index.mts"

export async function compile(
	session: InternalSession
) : Promise<Compile> {
	return {
		buildProducts: async function() {
			return await buildProducts(session)
		},
		messages: []
	}
}
