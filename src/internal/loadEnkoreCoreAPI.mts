import path from "node:path"
import {createRequire} from "node:module"
import {type EnkoreCoreAPI, importAPI} from "@enkore/spec"

export async function loadEnkoreCoreAPI(
	projectRoot: string
) : Promise<EnkoreCoreAPI> {
	const require = createRequire(path.join(projectRoot, "index.js"))
	const corePackagePath = require.resolve("@enkore/core")

	return await importAPI(corePackagePath, "EnkoreCoreAPI")
}
