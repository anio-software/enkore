import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {EnkoreTargetIntegrationAPI} from "@enkore/spec"

export async function runHook(
	session: InternalSession,
	hookName: keyof EnkoreTargetIntegrationAPI["hook"]
) {
	const hook = session.realmIntegrationAPI.hook[hookName]

	if (typeof hook !== "function") return

	await hook(session.publicAPI)
}
