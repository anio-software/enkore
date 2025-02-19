import type {InternalSession} from "#~src/internal/InternalSession.d.mts"

export async function debugPrint(
	session: InternalSession,
	message: string
) {
	if (!session.enableDebugPrint) return

	process.stderr.write(`session debug: ${message}\n`)
}
