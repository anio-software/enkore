import type {Init} from "#~synthetic/user/Steps.ts"
import type {NodeAPIMessage} from "@anio-software/enkore-private.spec/primitives"

export async function mockReturn() : ReturnType<Init> {
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
