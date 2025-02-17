import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Lint} from "../Steps.d.mts"
import compile from "../5.compile/index.mts"
import {defineStep} from "../defineStep.mts"

async function executeStep(
	session: InternalSession
) : Promise<Lint> {
	return {
		compile: async function() {
			return await compile.runStep(session)
		}
	}
}

export default defineStep("lint", executeStep)
