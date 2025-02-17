import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Init} from "../Steps.d.mts"
import {clean} from "../clean/index.mts"

export async function init(
	session: InternalSession
) : Promise<Init> {
	session.productNames = (
		await session.realmIntegrationAPI.initialize(session.publicAPI)
	).products.map(x => x.name)

	return {
		clean: async function() {
			return await clean(session)
		},

		productNames: session.productNames
	}
}
