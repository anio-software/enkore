import type {
	Step,
	StepsMap
} from "#~synthetic/user/Steps.d.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"

export type * from "#~synthetic/user/Steps.d.mts"

type Ret<StepName extends Step> = {
	stepName: StepName,
	runStep: (
		...args: Parameters<StepsMap[StepName]>
	) => Promise<Awaited<ReturnType<StepsMap[StepName]>> & {
		messages: NodeAPIMessage[]
	}>
}

export function defineStepChecked<StepName extends Step>(
	stepName: StepName,
	executeStep: (
		...args: Parameters<StepsMap[StepName]>
	) => ReturnType<StepsMap[StepName]>
): Ret<StepName> {
	return {
		stepName,
		async runStep(...args) {
			const stepResult = await executeStep(...args)

			return {
				...stepResult,
				messages: [{
					id: "test",
					severity: "error",
					message: "hoiiiii"
				}]
			}
		}
	}
}
