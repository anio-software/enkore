import type {TestProducts} from "#~src/Steps.ts"
import publishProducts from "../9.publishProducts/index.ts"
import {defineStepChecked} from "../defineStepChecked.ts"

const executeStep: TestProducts = async function(session, productNames) {
	if (productNames !== false) {
		const productNamesToTest = productNames ?? session.state.productNames

		for (const productName of productNamesToTest) {
			await session.targetIntegrationAPI.testProduct(
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
