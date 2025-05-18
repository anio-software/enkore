import path from "node:path"
import {createRequire} from "node:module"
import {type EnkoreCoreAPI, importAPI} from "@anio-software/enkore.spec"

export async function loadEnkoreCoreAPI(
	projectRoot: string
) : Promise<EnkoreCoreAPI> {
	const require = createRequire(path.join(projectRoot, "index.js"))

	let corePackagePath = ""

	try {
		corePackagePath = require.resolve("@anio-software/enkore.core")
	} catch {
		try {
			corePackagePath = require.resolve("@asint/enkore__core")
		} catch {
			corePackagePath = require.resolve("@enkore/core")
		}
	}

	return await importAPI(corePackagePath, "EnkoreCoreAPI")
}
