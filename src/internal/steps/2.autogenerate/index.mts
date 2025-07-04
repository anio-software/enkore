import type {Autogenerate} from "#~synthetic/user/Steps.d.mts"
import {createAutogeneratedFile} from "./createAutogeneratedFile.mts"
import preprocess from "../3.preprocess/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"

const executeStep: Autogenerate = async function(session) {
	for (const [_, file] of session.state.filesToAutogenerate.entries()) {
		// todo: refactor into function
		if (file.generateAfterPreprocessing) {
			session.emitMessage(
				`info`, `autogenerated file '${file.normalizedDestinationPath}' will be created after preprocessing.`
			)

			continue
		}

		const result = await createAutogeneratedFile(session, file)

		if (result === false) continue

		file.output = result.output
		file.outputHash = result.outputHash
	}

	return {
		preprocess: async function() {
			return await preprocess.runStep(session)
		}
	}
}

export default defineStepChecked("autogenerate", executeStep)
