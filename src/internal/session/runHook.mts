import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {EnkoreTargetIntegrationAPI} from "@anio-software/enkore.spec"

export async function runHook(
	session: InternalSession,
	hookName: keyof EnkoreTargetIntegrationAPI["hook"]
) {
	const hook = session.targetIntegrationAPI.hook[hookName]

	if (typeof hook !== "function") return

	await hook(session.publicAPI)
}
