import type {Init} from "#~synthetic/user/Steps.d.mts"
import lint from "../5.lint/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"
import type {NodeAPIMessage} from "@anio-software/enkore-private.spec/primitives"

async function mockReturn() : ReturnType<Init> {
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
								messages,
								async testProducts() {
									return {
										messages,
										async publishProducts() {
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
			}
		}
	}
}

const executeStep: Init = async function(session) {
	const data = await session.targetIntegrationAPI.initialize(session.publicAPI)

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

export default defineStepChecked("init", executeStep)
