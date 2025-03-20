import type {PublishProducts} from "#~synthetic/user/Steps.d.mts"
import {defineStepChecked} from "../defineStepChecked.mts"

const executeStep: PublishProducts = async function(session, productNames) {
	if (productNames !== false) {
		const productNamesToPublish = productNames ?? session.state.productNames

		for (const productName of productNamesToPublish) {
			await session.realmIntegrationAPI.publishProduct(
				session.publicAPI, productName
			)
		}
	}

	return {}
}

export default defineStepChecked("publishProducts", executeStep)
