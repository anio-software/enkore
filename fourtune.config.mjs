import {buildRunAllStepsFile} from "./buildRunAllStepsFile.mjs"

export default {
	realm: {
		name: "js",
		type: "package"
	},

	autogenerate: {
		"src/runAllSteps.mts": function() {
			return buildRunAllStepsFile()
		}
	}
}
