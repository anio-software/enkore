import type {InternalSession} from "../InternalSession.ts"
import type {EnkoreProjectFile} from "@anio-software/enkore-private.spec"

export function replaceEnkoreConstants(
	session: InternalSession,
	{fileName}: EnkoreProjectFile,
	code: string
): string {
	let newCode = code

	if (fileName.endsWith(".ts")  ||
	    fileName.endsWith(".tsx") ||
	    fileName.endsWith(".css")) {
		const tmp = fileName.split(".")

		tmp.pop()

		newCode = newCode.split(`__FNAME__`).join(tmp.join("."))
	}

	return newCode
}
