import {
	type EnkoreBoilerplateFile,
	createEntity
} from "@enkore/spec"

import {getAsset} from "@fourtune/realm-js/v0/assets"

export function getBoilerplateFiles() : EnkoreBoilerplateFile[] {
	const files : EnkoreBoilerplateFile[] = []

	function addFile(path: string, content: string, overwrite?: boolean, executable?: boolean) {
		files.push(
			createEntity("EnkoreBoilerplateFile", 0, 0, {
				scope: "enkore",
				path,
				content,
				overwrite,
				fileIsExecutable: executable
			})
		)
	}

	addFile(".gitignore", getAsset("text://boilerplate/gitignore") as string, false)

	addFile(".editorconfig", getAsset("text://boilerplate/editorconfig") as string, true)

	addFile(".github/CODEOWNERS", getAsset("text://boilerplate/github/CODEOWNERS") as string, true)
	addFile(".github/workflows/cicd.yaml", getAsset("text://boilerplate/github/cicd_workflow.yaml") as string, true)

	addFile(".cicd/test.sh", `#!/bin/bash -euf\nprintf "No test script defined\\n"\nexit 1\n`, false, true)
	addFile(".cicd/deploy.sh", `#!/bin/bash -euf\nprintf "No deploy script defined\\n"\nexit 1\n`, false, true)

	return files
}
