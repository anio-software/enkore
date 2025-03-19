import type {API} from "#~src/API.d.mts"
import type {Events} from "#~src/internal/Events.d.mts"

import {readEnkoreConfigFile} from "@enkore/common"
import {createEventEmitter} from "@aniojs/event-emitter"
import {loadEnkoreCoreAPI} from "#~src/internal/loadEnkoreCoreAPI.mts"
import {createSession} from "#~src/internal/createSession.mts"
import preInit from "#~src/internal/steps/0.preInit/index.mts"
import {build} from "#~src/internal/steps/build.mts"
import {realpath} from "node:fs/promises"

import type {EnkoreCoreRealmDependency} from "@enkore/spec"

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

	const {
		on,
		_emitEvent,
		removeEventListener
		// "error" event should relate to BUILD errors
		// i.e. error events are dispatched and a flag is set
		// to make enkore terminate with an error condition (it doesn't immediately terminate execution!!)
	} = createEventEmitter<Events>(["message"])

	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const core = await loadEnkoreCoreAPI(projectRoot)

	const realmIntegrationAPI = await core.initializeProject(
		projectRoot, isCIEnvironment, {
			npmBinaryPath,
			force
		}
	)

	if (stdIOLogs) {
		on("message", (e) => {
			if (e.severity === "debug" && !core.getDebugMode()) return

			process.stderr.write(
				`[${e.severity}] enkore: ${e.message}\n`
			)
		})
	}

	//
	// preload all realm dependencies
	//
	const realmDependencyNames = await core.getInstalledRealmDependencyNames(
		projectRoot, projectConfig.realm.name
	)

	const realmDependencies : Map<string, EnkoreCoreRealmDependency> = new Map()

	for (const dependencyName of realmDependencyNames) {
		realmDependencies.set(
			dependencyName,
			await core.loadRealmDependency(
				projectRoot,
				projectConfig.realm.name,
				dependencyName
			)
		)
	}

	const internalSession = await createSession(
		projectRoot,
		projectConfig,
		realmIntegrationAPI,
		realmDependencies,
		_emitEvent,
		on,
		removeEventListener,
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
			on,
			removeEventListener,
			preInit: async function() {
				return await preInit.runStep(internalSession)
			},

			build: async function() {
				return await build(internalSession)
			}
		},

		session: internalSession.publicAPI
	}
}

export const enkore = impl
