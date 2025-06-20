import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"

const requiredFixedFields: ([string, any])[] = [
	["type", "module"],
	["private", true]
]

const forbiddenFields = [
	"exports",
	"main",
	"types",
	"typings"
]

export async function validateProjectPackageJSON(
	packageJSON: NodePackageJSON
) {
	// todo: maybe do not throw in here? and use emitEvent instead?
	for (const [field, value] of requiredFixedFields) {
		if (!(field in packageJSON)) {
			throw new Error(`"${field}" field must be present in package.json.`)
		}

		if (packageJSON[field] !== value) {
			throw new Error(`"${field}" field must have value "${value}" in package.json.`)
		}
	}

	for (const field of forbiddenFields) {
		if (field in packageJSON) {
			throw new Error(`"${field}" field must not be present in package.json.`)
		}
	}
}
