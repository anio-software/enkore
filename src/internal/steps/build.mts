import type {InternalSession} from "../InternalSession.d.mts"
import type {NodeAPIMessage} from "@asint/enkore__spec/primitives"
import {runAllSteps} from "#~synthetic/user/runAllSteps.mts"

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
