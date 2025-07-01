import path from "node:path"
import type {PublishProducts} from "#~synthetic/user/Steps.ts"
import {defineStepChecked} from "../defineStepChecked.ts"

const executeStep: PublishProducts = async function(session, productNames) {
	if (productNames !== false) {
		const productNamesToPublish = productNames ?? session.state.productNames

		for (const productName of productNamesToPublish) {
			const savedCWD = process.cwd()

			try {
				process.chdir(
					path.join(session.projectRoot, "products", productName)
				)

				await session.targetIntegrationAPI.publishProduct(
					session.publicAPI, productName
				)
			} finally {
				process.chdir(savedCWD)
			}
		}
	}

	return {}
}

export default defineStepChecked("publishProducts", executeStep)
