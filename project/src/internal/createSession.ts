import {
	type EnkoreConfig,
	type EnkoreCoreAPI,
	type EnkoreNodeAPIOptions,
	type RawType,
	createAPI,
	createEntity
} from "@anio-software/enkore-private.spec"
import type {NodePackageJSON, UnknownToolchain} from "@anio-software/enkore-private.spec/primitives"

import type {Events} from "./Events.ts"
import type {EventEmitter} from "@anio-software/pkg.event-emitter"
import type {InternalSession} from "./InternalSession.ts"
import type {InternalSessionState} from "./InternalSessionState.ts"
import type {NodeAPIEmitMessage} from "./NodeAPIEmitMessage.ts"
import path from "node:path"
import {getProjectFilesGeneric} from "./getProjectFilesGeneric.ts"
import {readFileJSON} from "@anio-software/pkg.node-fs"
import {getFilesTrackedByGit} from "#~src/internal/getFilesTrackedByGit.ts"
import {getGitProjectInformation} from "#~src/internal/getGitProjectInformation.ts"
import {getEnkoreVersions} from "#~src/internal/getEnkoreVersions.ts"

export async function createSession(
	projectRoot: string,
	projectConfig: EnkoreConfig,
	coreAPI: EnkoreCoreAPI,
	coreInstance: InternalSession["coreInstance"],
	toolchain: UnknownToolchain,
	events: EventEmitter<Events, true>,
	options: Required<RawType<EnkoreNodeAPIOptions>>
) : Promise<InternalSession> {
	const projectPackageJSON = await readFileJSON(
		path.join(projectRoot, "package.json")
	) as NodePackageJSON

	async function getInitialTargetData() {
		const {getInitialInternalData} = coreInstance.targetIntegrationAPI

		if (typeof getInitialInternalData === "function") {
			return await getInitialInternalData(
				{
					project: {
						root: projectRoot,
						config: projectConfig,
						packageJSON: projectPackageJSON
					}
				}
			)
		}

		return {}
	}

	const state : InternalSessionState = {
		hasEncounteredError: false,
		currentStep: undefined,
		filesToAutogenerate: new Map(),
		finalized: false,
		productNames: [],
		internalTargetData: await getInitialTargetData(),
		createdObjectFilesByRelativeSourceFilePath: new Map(),
		buildFilesCreatedByPreprocessingStageByRelativePath: new Map(),
		projectFiles: new Map(),
		buildFiles: new Map(),
		hasFinishedCompiling: false,
		lockFileData: null,
		filesTrackedByGit: getFilesTrackedByGit(projectRoot)
	}

	const emitMessage: NodeAPIEmitMessage = function(severity, arg1, arg2?) {
		if (arguments.length === 2) {
			events._emitEvent("message", {severity, id: undefined, message: arg1 as string})
		} else {
			events._emitEvent("message", {severity, id: arg1     , message: arg2 as string})
		}
	}

	const session : Omit<
		InternalSession,
		"publicAPI"
	> & {
		publicAPI: unknown
	} = {
		coreAPI,
		coreInstance,
		emitMessage,
		projectRoot,
		projectConfig,
		targetIntegrationAPI: coreInstance.targetIntegrationAPI,
		publicAPI: null,
		options,
		state,
		events
	}

	function assertNotFinalized() {
		if (session.state.finalized) {
			throw new Error(
				`Session data has been finalized, it is not possible to modify the session data.`
			)
		}
	}

	function checkAccessUninitializedStateVariable(propertyName: keyof InternalSessionState) {
		if (session.state[propertyName] === undefined) {
			session.emitMessage(
				"warning",
				"accessUninitializedStateVariable",
				`Trying to access an uninitialized session state variable '${propertyName}'.`
			)

			return false
		}

		return true
	}

	const git = getGitProjectInformation(projectRoot)
	const enkoreVersions = getEnkoreVersions(projectRoot, projectConfig.target.name)

	session.publicAPI = createAPI(
		"EnkoreSessionAPI", 0, 0, {
			project: {
				root: projectRoot,
				config: projectConfig,
				packageJSON: projectPackageJSON
			},

			target: {
				identifier: projectConfig.target.name,

				getOptions(targetIdentifier) {
					if (projectConfig.target.name !== targetIdentifier) {
						throw new Error(
							`getOptions() targetIdentifier mismatch.`
						)
					}

					return projectConfig.target.options as any
				},

				__getCurrentlyInstalledToolchain() {
					return toolchain
				},

				__getInternalData() {
					return state.internalTargetData
				}
			},

			git,

			enkore: {
				getVersions() {
					return enkoreVersions
				},
				getLockFile() {
					if (!state.lockFileData) {
						throw new Error(
							`Called getLockFile() before lockfile was synchronized. This is an error.`
						)
					}

					return state.lockFileData
				},
				getOptions() {
					return createEntity("EnkoreNodeAPIOptions", 0, 0, session.options)
				},
				emitMessage,
				getCurrentStep() {
					return session.state.currentStep
				},
				getProjectFiles(relativeBaseDir) {
					const projectFilesAsArray = [
						...session.state.projectFiles.entries()
					].map(([_, v]) => v).filter(projectFile => {
						return projectFile.wasFiltered === false
					})

					return getProjectFilesGeneric(relativeBaseDir, projectFilesAsArray)
				},
				getAllProjectFiles(relativeBaseDir) {
					const projectFilesAsArray = [
						...session.state.projectFiles.entries()
					].map(([_, v]) => v)

					return getProjectFilesGeneric(relativeBaseDir, projectFilesAsArray)
				},
				getCreatedObjectFilesForRelativeSourcePath(srcFilePath) {
					if (!state.hasFinishedCompiling) {
						session.emitMessage(
							"warning",
							"inquiringAboutObjectFilesBeforeCompilationHasFinished",
							`Calling getCreatedObjectFilesForRelativeSourcePath before compilation has finished.`
						)
					}

					if (!state.createdObjectFilesByRelativeSourceFilePath.has(srcFilePath)) {
						return []
					}

					return state.createdObjectFilesByRelativeSourceFilePath.get(srcFilePath)!
				}
			},

			addAutogeneratedFile(file) {
				assertNotFinalized()

				const {destinationPath} = file
				const normalizedDestinationPath = path.normalize(destinationPath)

				if (normalizedDestinationPath.startsWith("/")) {
					emitMessage(
						"error",
						"",
						`autogenerated file path '${normalizedDestinationPath}' may not be absolute.`
					)

					return
				}

				if (!normalizedDestinationPath.startsWith("project/")) {
					emitMessage(
						"error",
						"",
						`autogenerated file path '${normalizedDestinationPath}' must start with 'project/'.`
					)

					return
				}

				if (session.state.filesToAutogenerate.has(normalizedDestinationPath)) {
					emitMessage(
						"warning",
						`there's already a file to be autogenerated at '${normalizedDestinationPath}'`
					)
				}

				session.state.filesToAutogenerate.set(
					normalizedDestinationPath, {
						generateAfterPreprocessing: file.generateAfterPreprocessing === true,
						normalizedDestinationPath,
						generator: file.generator,
						output: undefined,
						outputHash: undefined
					}
				)
			}
		}
	)

	return session as InternalSession
}
