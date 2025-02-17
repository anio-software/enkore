import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Step} from "#~src/internal/Step.d.mts"

type Fn = (session: InternalSession, ...args: any[]) => any

export function defineStep<T extends Fn>(stepName: Step, stepFn: T) {
	return {
		name: stepName,
		runStep: async function(
			...args: Parameters<T>
		) : Promise<Awaited<ReturnType<T>>> {
			const session = args[0]

			try {
				session.state.currentStep = stepName
				session.state.aggregatedMessages = []

				return await stepFn(session, ...args.slice(1))
			} finally {
				session.state.currentStep = undefined
			}
		}
	}
}
