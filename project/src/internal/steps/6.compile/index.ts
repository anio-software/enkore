import type {Compile} from "#~src/Steps.ts"
import type {EnkoreProjectFile, EnkoreBuildFile} from "@anio-software/enkore-private.spec"
import {compileFile as compileSingleFile} from "./compileFile.ts"
import buildProducts from "../7.buildProducts/index.ts"
import {defineStepChecked} from "../defineStepChecked.ts"
import {runHook} from "#~src/internal/session/runHook.ts"

const executeStep: Compile = async function(session) {
	await runHook(session, "preCompile")

	for (const [_, file] of session.state.projectFiles.entries()) {
		await compileFile(file)
	}

	for (const [_, file] of session.state.buildFiles.entries()) {
		await compileFile(file)
	}

	session.state.hasFinishedCompiling = true

	await runHook(session, "postCompile")

	return {
		buildProducts: async function(productNames: string[]|null) {
			return await buildProducts.runStep(session, productNames)
		}
	}

	async function compileFile(
		file: EnkoreProjectFile | EnkoreBuildFile
	) {
		const key = file.relativePath
		const map = session.state.createdObjectFilesByRelativeSourceFilePath

		if (!map.has(key)) {
			map.set(key, [])
		}

		const value = map.get(key)!
		const objectFiles = await compileSingleFile(session, file)

		for (const file of objectFiles) {
			if (value.includes(file)) {
				// todo: emit warning
				continue
			}

			value.push(file)
		}
	}
}

export default defineStepChecked("compile", executeStep)
