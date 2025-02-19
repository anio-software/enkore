import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {PreInit} from "../Steps.d.mts"
import {defineStep} from "../defineStep.mts"
import clean from "../1.clean/index.mts"

async function executeStep(
	session: InternalSession
) : Promise<PreInit> {
	session.state.finalized = true

	const data = await session.realmIntegrationAPI.initialize(session.publicAPI)

	const productNames = data.products.map(product => {
		return product.name
	})

	session.state.productNames = productNames

	return {
		productNames,

		clean: async function() {
			return await clean.runStep(session)
		}
	}
}

export default defineStep("preInit", executeStep)
