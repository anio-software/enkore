import type {
	NodePackageJSON,
	NodeAPIMessage
} from "@anio-software/enkore-private.spec/primitives"

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
): Promise<NodeAPIMessage[]> {
	const messages: NodeAPIMessage[] = []

	for (const [field, value] of requiredFixedFields) {
		if (!(field in packageJSON)) {
			messages.push({
				id: undefined,
				severity: "error",
				message: `"${field}" field must be present in package.json.`
			})
		} else if (packageJSON[field] !== value) {
			messages.push({
				id: undefined,
				severity: "error",
				message: `"${field}" field must have value "${value}" in package.json.`
			})
		}
	}

	for (const field of forbiddenFields) {
		if (field in packageJSON) {
			messages.push({
				id: undefined,
				severity: "warning",
				message: `"${field}" field must not be present in package.json.`
			})
		}
	}

	return messages
}
