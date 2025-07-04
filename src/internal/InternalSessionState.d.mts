import type {
	EnkoreAutogeneratedFile,
	EnkoreProjectFile,
	EnkoreBuildFile
} from "@anio-software/enkore-private.spec"

import type {Step} from "#~synthetic/user/Steps.d.mts"
import type {ScandirEntry} from "@aniojs/node-fs"

export type FileToAutogenerate = {
	generateAfterPreprocessing: boolean
	normalizedDestinationPath: string
	generator: EnkoreAutogeneratedFile["generator"]
	output: string|undefined
	outputHash: string|undefined
}

export type InternalSessionState = {
	// prevent addition of files
	// changes in config
	// after we initialized
	finalized: boolean

	currentStep: Step|undefined

	filesTrackedByGit: Map<string, {}>

	buildFilesCreatedByPreprocessingStageByRelativePath: Map<string, ScandirEntry>
	projectFiles: Map<string, EnkoreProjectFile>
	buildFiles: Map<string, EnkoreBuildFile>

	productNames: string[]

	hasEncounteredError: boolean

	filesToAutogenerate: Map<string, FileToAutogenerate>

	// flag to emit warning when 'createdObjectFilesByRelativeSourceFilePath'
	// is accessed before compilation has finished.
	hasFinishedCompiling: boolean
	createdObjectFilesByRelativeSourceFilePath: Map<string, string[]>

	internalTargetData: object
}
