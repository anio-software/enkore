import {spawnSync} from "node:child_process"

export function getFilesTrackedByGit(projectRoot: string): Map<string, {}> {
	const child = spawnSync("git", ["ls-files"], {
		stdio: "pipe",
		cwd: projectRoot
	})

	if (child.status !== 0) {
		return new Map()
	}

	const ret: Map<string, {}> = new Map()

	for (const entry of child.stdout.toString().split("\n")) {
		const filePath = entry.trim()

		if (!filePath.length) continue

		ret.set(filePath, {})
	}

	return ret
}
