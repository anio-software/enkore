import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {BuildProducts} from "../Steps.d.mts"

export async function buildProducts(
	session: InternalSession,
	productNames: string[]|null
) : Promise<BuildProducts> {
	session.setCurrentStep("buildProducts")

	const productNamesToBuild = productNames === null ? session.state.productNames : productNames

	for (const productName of productNamesToBuild) {
		session.debugPrint(`stage:buildProducts building '${productName}'`)

		await session.realmIntegrationAPI.generateProduct(
			session.publicAPI, productName
		)
	}

	return {
		messages: session.getAggregatedMessages()
	}
}
