import type {InternalSession} from "../InternalSession.ts"
import type {NodeAPIMessage} from "@anio-software/enkore-private.spec/primitives"
import {runAllSteps} from "#~synthetic/user/runAllSteps.ts"

type ExtendedNodeAPIMessage = NodeAPIMessage & {
	step: string
}

export async function build(
	session: InternalSession,
	runTests: boolean,
	runPublish: boolean
) : Promise<{
	messages: ExtendedNodeAPIMessage[]
}> {
	return await runAllSteps(session, runTests, runPublish)
}
