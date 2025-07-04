import type {Clean} from "#~synthetic/user/Steps.d.mts"
import {removeObsoleteAutogeneratedFiles} from "./removeObsoleteAutogeneratedFiles.mts"
import {remove, mkdirp} from "@aniojs/node-fs"
import path from "node:path"
import autogenerate from "../2.autogenerate/index.mts"
import {defineStepChecked} from "../defineStepChecked.mts"

const executeStep: Clean = async function(session) {
	await removeObsoleteAutogeneratedFiles(session)

	await remove(path.join(session.projectRoot, "build"))
	await mkdirp(path.join(session.projectRoot, "build"))

	await remove(path.join(session.projectRoot, "objects"))
	await mkdirp(path.join(session.projectRoot, "objects"))

	if (session.options.isCIEnvironment) {
		await remove(path.join(session.projectRoot, "products"))
	}
	await mkdirp(path.join(session.projectRoot, "products"))

	return {
		autogenerate: async function() {
			return await autogenerate.runStep(session)
		}
	}
}

export default defineStepChecked("clean", executeStep)
