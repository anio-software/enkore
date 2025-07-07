import type {
	EnkoreProjectFile
} from "@anio-software/enkore-private.spec"
import path from "node:path"

export function getProjectFilesGeneric(
	baseDir: string|string[]|undefined,
	entries:EnkoreProjectFile[]
): EnkoreProjectFile[] {
	if (baseDir === undefined) {
		return entries
	}

	const baseDirs = Array.isArray(baseDir) ? baseDir : [baseDir]

	const normalizedBaseDirs = baseDirs.map(baseDir => {
		let normalized = path.normalize(baseDir)

		if (normalized.startsWith("/")) {
			normalized = normalized.slice(1)
		}

		if (!normalized.endsWith("/")) {
			return `${normalized}/`
		}

		return normalized
	})

	return entries.filter(file => {
		for (const normalizedBaseDir of normalizedBaseDirs) {
			if (file.relativePath.startsWith(normalizedBaseDir)) {
				return true
			}
		}

		return false
	})
}
