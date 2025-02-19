import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {BuildProducts} from "../Steps.d.mts"
import {defineStep} from "../defineStep.mts"
import {debugPrint} from "#~src/internal/session/debugPrint.mts"

async function executeStep(
	session: InternalSession,
	productNames: string[]|null
) : Promise<BuildProducts> {
	const productNamesToBuild = productNames === null ? session.state.productNames : productNames

	for (const productName of productNamesToBuild) {
		debugPrint(session, `stage:buildProducts building '${productName}'`)

		await session.realmIntegrationAPI.generateProduct(
			session.publicAPI, productName
		)
	}

	return {}
}

export default defineStep("buildProducts", executeStep)
