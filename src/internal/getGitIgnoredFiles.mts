export function getGitIgnoredFiles() : string[] {
	return [
		"/node_modules/",
		".DS_Store",
		"/.enkore/",
		"/build/",
		"/objects/",
		"/products/"
	]
}
