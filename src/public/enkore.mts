import type {API} from "#~src/API.d.mts"
import type {Events} from "#~src/internal/Events.d.mts"

import {readEnkoreConfigFile} from "@enkore/common"
import {createEventEmitter} from "@aniojs/event-emitter"
import {loadEnkoreCoreAPI} from "#~src/internal/loadEnkoreCoreAPI.mts"
import {createSession} from "#~src/internal/createSession.mts"
import preInit from "#~src/internal/steps/0.preInit/index.mts"
import {build} from "#~src/internal/steps/build.mts"
import {realpath} from "node:fs/promises"

import type {EnkoreCoreTargetDependency} from "@enkore/spec"

const impl : API["enkore"] = async function(
	unresolvedProjectRoot,
	options?
) {
	const projectRoot = await realpath(unresolvedProjectRoot)
	const stdIOLogs = options?.stdIOLogs === true
	const isCIEnvironment = options?.isCIEnvironment === true
	const npmBinaryPath = options?.npmBinaryPath || "npm"
	const force = options?.force === true
	const onlyInitializeProject = options?.onlyInitializeProject === true
	const _partialBuild = options?._partialBuild === true
	const _forceBuild = options?._forceBuild === true

	// "error" event should relate to BUILD errors
	// i.e. error events are dispatched and a flag is set
	// to make enkore terminate with an error condition (it doesn't immediately terminate execution!!)
	const events = createEventEmitter<Events>(["message"])

	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const core = await loadEnkoreCoreAPI(projectRoot)

	const coreInstance = await core.initializeProject(
		projectRoot, isCIEnvironment, {
			npmBinaryPath,
			force
		}
	)

	if (stdIOLogs) {
		events.on("message", (e) => {
			if (e.severity === "debug" && !core.getDebugMode()) return

			process.stderr.write(
				`[${e.severity}] enkore: ${e.message}\n`
			)
		})
	}

	//
	// preload all target dependencies
	//
	const targetDependencyNames = await core.getInstalledTargetDependencyNames(
		projectRoot, projectConfig.target._targetIdentifier
	)

	const targetDependencies : Map<string, EnkoreCoreTargetDependency> = new Map()

	for (const dependencyName of targetDependencyNames) {
		targetDependencies.set(
			dependencyName,
			await core.loadTargetDependency(
				projectRoot,
				projectConfig.target._targetIdentifier,
				dependencyName
			)
		)
	}

	const internalSession = await createSession(
		projectRoot,
		projectConfig,
		core,
		coreInstance,
		targetDependencies,
		events,
		{
			force,
			isCIEnvironment,
			stdIOLogs,
			npmBinaryPath,
			onlyInitializeProject,
			_partialBuild,
			_forceBuild
		}
	)

	return {
		project: {
			on: events.on,
			removeEventListener: events.removeEventListener,
			preInit: async function() {
				return await preInit.runStep(internalSession)
			},

			build: async function() {
				return await build(internalSession, false, false)
			},

			buildAndTest: async function() {
				return await build(internalSession, true, false)
			},

			buildAndPublish: async function(skipTests) {
				return await build(internalSession, skipTests !== true, true)
			}
		},

		session: internalSession.publicAPI
	}
}

export const enkore = impl
