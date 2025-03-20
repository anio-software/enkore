import type {TestProducts} from "#~synthetic/user/Steps.d.mts"
import publishProducts from "../9.publishProducts/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"

const executeStep: TestProducts = async function(session, productNames) {
	if (productNames !== false) {
		const productNamesToTest = productNames ?? session.state.productNames

		for (const productName of productNamesToTest) {
			await session.realmIntegrationAPI.testProduct(
				session.publicAPI, productName
			)
		}
	}

	return {
		async publishProducts(productNames) {
			return await publishProducts.runStep(session, productNames)
		}
	}
}

export default defineStepChecked("testProducts", executeStep)
