import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {BuildProducts} from "../Steps.d.mts"
import type {EnkoreNodeAPIMessage} from "@enkore/spec"

export async function buildProducts(
	session: InternalSession,
	productNames: string[]|null
) : Promise<BuildProducts> {
	let messages: EnkoreNodeAPIMessage[] = []

	const productNamesToBuild = productNames === null ? session.productNames : productNames

	for (const productName of productNamesToBuild) {
		console.log("building", productName)

		const {messages: buildProductMessages} = await session.realmIntegrationAPI.generateProduct(
			session.publicAPI, productName
		)

		messages = [
			...messages,
			...buildProductMessages
		]
	}

	return {
		messages
	}
}
