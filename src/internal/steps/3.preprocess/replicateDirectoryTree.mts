import path from "node:path"
import {type ScandirEntry, mkdirp} from "@aniojs/node-fs"

export async function replicateDirectoryTree(
	projectRoot: string,
	map: Map<string, ScandirEntry>
) {
	for (const [_, entry] of map.entries()) {
		if (entry.type !== "regularDir") continue

		await mkdirp(
			path.join(projectRoot, "build", entry.relative_path)
		)

		await mkdirp(
			path.join(projectRoot, "objects", entry.relative_path)
		)
	}
}
