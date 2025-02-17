import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Init} from "../Steps.d.mts"
import {clean} from "../1.clean/index.mts"

export async function init(
	session: InternalSession
) : Promise<Init> {
	session.setCurrentStep("init")

	session.finalized = true

	const data = await session.realmIntegrationAPI.initialize(session.publicAPI)

	const productNames = data.products.map(product => {
		return product.name
	})

	session.productNames = productNames

	return {
		productNames,

		clean: async function() {
			return await clean(session)
		}
	}
}
