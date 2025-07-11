#!/usr/bin/env node
import {
	createEntity,
	type RawType,
	type EnkoreNodeAPIOptions
} from "@anio-software/enkore-private.spec"
import type {NodeAPIMessage} from "@anio-software/enkore-private.spec/primitives"
import {enkore} from "#~src/public/enkore.ts"

const args = process.argv.slice(2)

let isCIEnvironment = false
let force = false
let onlyInitializeProject = false
let allowTypeErrorsInEnkoreConfigFile = false
let buildMode: "development" | "production" = "development"
let _partialBuild = false
let _forceBuild = false
let projectRoot : string|null = null
let runTests = false
let runPublish = false

for (const arg of args) {
	if (arg === "-force") {
		force = true
	} else if (arg === "-ci") {
		isCIEnvironment = true
	} else if (arg === "-init") {
		onlyInitializeProject = true
	} else if(arg === "-debugPartialBuild") {
		_partialBuild = true
	} else if (arg === "-debugForceBuild") {
		_forceBuild = true
	} else if (arg === "-test") {
		runTests = true
	} else if (arg === "-publish") {
		runPublish = true
	} else if (arg === "-allowTypeErrorsInEnkoreConfigFile") {
		allowTypeErrorsInEnkoreConfigFile = true
	} else if (arg === "-prod") {
		buildMode = "production"
	} else {
		projectRoot = arg
	}
}

if (projectRoot === null) {
	throw new Error(`project root must be specified.`)
}

function defineOptions(options: RawType<EnkoreNodeAPIOptions>) {
	return createEntity("EnkoreNodeAPIOptions", 0, 0, options)
}

if (runPublish) {
	buildMode = "production"
}

const {project} = await enkore(
	projectRoot, defineOptions({
		stdIOLogs: true,
		force,
		onlyInitializeProject,
		isCIEnvironment,
		allowTypeErrorsInEnkoreConfigFile,
		buildMode,
		_partialBuild,
		_forceBuild
	})
)

function hasError(messages: NodeAPIMessage[]) {
	for (const message of messages) {
		if (message.severity === "error") {
			return true
		}
	}
}

if (runTests && runPublish) {
	const {messages} = await project.buildAndPublish()

	if (hasError(messages)) {
		process.exit(1)
	}
} else if (runTests) {
	const {messages} = await project.buildAndTest()

	if (hasError(messages)) {
		process.exit(1)
	}
} else {
	const {messages} = await project.build()

	if (hasError(messages)) {
		process.exit(1)
	}
}

//for (const message of messages) {
//	process.stderr.write(
//		`${message.step}: ${message.severity}: ${message.message}\n`
//	)
//}

export const index = 1
