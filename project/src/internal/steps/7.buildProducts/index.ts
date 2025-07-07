import fs from "node:fs/promises"
import path from "node:path"
import type {InternalSession} from "#~src/internal/InternalSession.ts"
import type {BuildProducts} from "#~src/Steps.ts"
import testProducts from "../8.testProducts/index.ts"
import {defineStepChecked} from "../defineStepChecked.ts"
import {remove} from "@anio-software/pkg.node-fs"

async function buildProduct(
	session: InternalSession,
	productName: string
) {
	const savedCWD = process.cwd()
	const productTmpPath = await session.coreAPI.createTemporaryDirectory(
		session.projectRoot
	)
	const productDestPath = path.join(
		session.projectRoot, "products", productName
	)

	process.chdir(productTmpPath)

	try {
		await session.targetIntegrationAPI.generateProduct(
			session.publicAPI, productName
		)

		await remove(productDestPath, {force: true})
		await fs.rename(productTmpPath, productDestPath)
	} finally {
		process.chdir(savedCWD)
	}
}

const executeStep: BuildProducts = async function(session, productNames) {
	const productNamesToBuild = productNames ?? session.state.productNames

	for (const productName of productNamesToBuild) {
		session.emitMessage(
			"debug",
			`stage:buildProducts building '${productName}'`
		)

		await buildProduct(session, productName)
	}

	return {
		async testProducts(productNames) {
			return await testProducts.runStep(session, productNames)
		}
	}
}

export default defineStepChecked("buildProducts", executeStep)
