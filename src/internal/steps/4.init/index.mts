import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Init} from "../Steps.d.mts"
import lint from "../5.lint/index.mts"
import {defineStep} from "../defineStep.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"

function mockReturn() : Init {
	const messages : NodeAPIMessage[] = [{
		severity: "info",
		id: "stepSkipped",
		message: "This step was skipped."
	}]

	return {
		productNames: [],
		async lint() {
			return {
				messages,
				async compile() {
					return {
						messages,
						async buildProducts() {
							return {
								messages
							}
						}
					}
				}
			}
		}
	}
}

async function executeStep(
	session: InternalSession
) : Promise<Init> {
	const data = await session.realmIntegrationAPI.initialize(session.publicAPI)

	const productNames = data.products.map(product => {
		return product.name
	})

	session.state.productNames = productNames

	if (session.options.onlyInitializeProject) {
		return mockReturn()
	}

	return {
		productNames,

		lint: async function() {
			return await lint.runStep(session)
		}
	}
}

export default defineStep("init", executeStep)
