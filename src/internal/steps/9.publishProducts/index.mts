import type {PublishProducts} from "#~synthetic/user/Steps.d.mts"
import {defineStepChecked} from "../defineStepChecked.mts"

const executeStep: PublishProducts = async function(session, productNames) {
	return {}
}

export default defineStepChecked("publishProducts", executeStep)
