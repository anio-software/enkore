import {buildRunAllStepsFile} from "./buildRunAllStepsFile.mjs"
import {buildStepsTypeFile} from "./buildStepsTypeFile.mjs"

export default {
	realm: {
		name: "js",
		type: "package"
	},

	autogenerate: {
		"src/Steps.d.mts": function() {
			return buildStepsTypeFile()
		},

		"src/runAllSteps.mts": function() {
			return buildRunAllStepsFile()
		}
	}
}
