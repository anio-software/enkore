import {spawnSync} from "node:child_process"
import path from "node:path"
import fs from "node:fs"

export function getFilesTrackedByGit(projectRoot: string): Map<string, {}> {
	const child = spawnSync("git", ["ls-files"], {
		stdio: "pipe"
	})

	if (child.status !== 0) {
		return new Map()
	}

	const ret: Map<string, {}> = new Map()

	for (const entry of child.stdout.toString().split("\n")) {
		const filePath = entry.trim()

		if (!filePath.length) continue

		const absolutePath = path.join(projectRoot, filePath)
		// make sure every file listed actually exists ...
		const stats = fs.lstatSync(absolutePath)

		if (!stats.isFile()) {
			throw new Error(`'${filePath}' is not a file!`)
		}

		ret.set(filePath, {})
	}

	return ret
}
