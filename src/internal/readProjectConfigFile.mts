import type {EnkoreConfig} from "@enkore/spec"
import path from "node:path"

export async function readProjectConfigFile(
	projectRoot: string
) : Promise<EnkoreConfig> {
	return (
		//
		// Appending '#' as a temporary workaround for issue #17114
		//
		await import(
			path.join(projectRoot, "enkore.config.mts#")
		)
	).default as EnkoreConfig
}
