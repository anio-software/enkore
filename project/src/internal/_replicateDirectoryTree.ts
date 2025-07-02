import path from "node:path"
import {type ScandirEntry, mkdirp} from "@anio-software/pkg.node-fs"

export async function _replicateDirectoryTree(
	projectRoot: string,
	map: Map<string, ScandirEntry>
) {
	for (const [_, entry] of map.entries()) {
		if (entry.type !== "file:regular") continue

		const dirName = path.dirname(entry.relativePath)

		await mkdirp(path.join(projectRoot, "build", dirName))
		await mkdirp(path.join(projectRoot, "objects", dirName))
	}
}
