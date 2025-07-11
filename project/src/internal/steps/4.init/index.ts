import type {Init} from "#~src/Steps.ts"
import lint from "../5.lint/index.ts"
import {defineStepChecked} from "../defineStepChecked.ts"
import {checkHashesOfAutogeneratedFiles} from "./checkHashesOfAutogeneratedFiles.ts"
import {updateProjectSourceGitIgnoreFile} from "./updateProjectSourceGitIgnoreFile.ts"
import {updateHashesOfAutogeneratedFiles} from "./updateHashesOfAutogeneratedFiles.ts"
import {mockReturn} from "./mockReturn.ts"

const executeStep: Init = async function(session) {
	//
	// check / update hashes of auto-generated files
	// we do this here because some auto-generated files can be
	// produced after the pre-processing stage
	//
	if (session.options.isCIEnvironment) {
		session.emitMessage("info", "checking hashes of auto-generated files with enkore-lock.json (ci-only)")

		session.state.lockFileData = await checkHashesOfAutogeneratedFiles(session)
	} else {
		session.emitMessage("info", "updating project/.gitignore")
		await updateProjectSourceGitIgnoreFile(session)

		session.emitMessage("info", "updating enkore-lock.json")
		session.state.lockFileData = await updateHashesOfAutogeneratedFiles(session)
	}

	// initialize target
	const data = await session.targetIntegrationAPI.initialize(session.publicAPI)

	const productNames = data.products.map(product => {
		return product.name
	})

	session.state.productNames = productNames

	if (session.options.onlyInitializeProject) {
		return mockReturn()
	}

	return {
		productNames,

		lint: async function() {
			return await lint.runStep(session)
		}
	}
}

export default defineStepChecked("init", executeStep)
