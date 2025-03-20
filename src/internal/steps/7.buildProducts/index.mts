import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {BuildProducts} from "../Steps.d.mts"
import {defineStep} from "../defineStep.mts"

async function executeStep(
	session: InternalSession,
	productNames: string[]|null
) : Promise<BuildProducts> {
	const productNamesToBuild = productNames ?? session.state.productNames

	for (const productName of productNamesToBuild) {
		session.emitMessage(
			"debug",
			`stage:buildProducts building '${productName}'`
		)

		await session.realmIntegrationAPI.generateProduct(
			session.publicAPI, productName
		)
	}

	return {}
}

export default defineStep("buildProducts", executeStep)
