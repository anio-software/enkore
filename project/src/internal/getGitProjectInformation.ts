import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import {spawnSync} from "node:child_process"

type GitProjectInformation = EnkoreSessionAPI["git"]

function executeGitCommand(
	projectRoot: string,
	args: string[]
): string|false {
	const child = spawnSync("git", args, {
		cwd: projectRoot,
		stdio: "pipe"
	})

	if (child.status !== 0) {
		return false
	}

	const stdout = child.stdout.toString().trim()

	if (!stdout.length) {
		return false
	}

	return stdout
}

export function getGitProjectInformation(
	projectRoot: string
): GitProjectInformation {
	const commitHash = executeGitCommand(projectRoot, [
		"rev-parse", "HEAD"
	])

	if (!commitHash) return null

	const tags: Set<string> = new Set()
	const gitTags = executeGitCommand(projectRoot, [
		"tag", "--points-at", "HEAD"
	])

	if (gitTags) {
		for (const line of gitTags.split("\n")) {
			tags.add(line.trim())
		}
	}

	return {
		commitHash,
		commitHashShort: commitHash.slice(0, 5) + commitHash.slice(-5),
		tags: [...tags]
	}
}
