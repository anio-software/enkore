import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"
import path from "node:path"
import {writeAtomicFile} from "@aniojs/node-fs"

const packageJSONKeyOrder = [
	"private",
	"type",
	"name",
	"version",
	"description",
	"keywords",
	"author",
	"repository",
	"license",
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"files",
	"scripts"
]

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

function indent(str: string): string {
	return str.split("\n").map((line, index) => {
		if (index === 0) return line

		return `  ${line}`
	}).join("\n")
}

export async function validateAndSortProjectPackageJSON(
	projectRoot: string, packageJSON: NodePackageJSON
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

	const packageJSONOrderedKeys = [
		...packageJSONKeyOrder.filter(key => {
			return key in packageJSON
		}),
		// place remaining keys in alphabetical order
		...Object.keys(packageJSON).filter(key => {
			return !packageJSONKeyOrder.includes(key)
		}).toSorted((a, b) => {
			return a.localeCompare(b, "en")
		})
	]
	// we don't want fields with "undefined" values
	.filter(key => {
		return typeof packageJSON[key] !== "undefined"
	})

	let ret = `{\n`

	for (let i = 0; i < packageJSONOrderedKeys.length; ++i) {
		const key = packageJSONOrderedKeys[i]
		const value = packageJSON[key]
		const hasNextKey = packageJSONOrderedKeys.length > (i + 1)

		ret += `  ${JSON.stringify(key)}: ${indent(JSON.stringify(value, null, 2))}`

		ret += (hasNextKey ? `,\n` : `\n`)
	}

	ret += `}\n`

	await writeAtomicFile(
		path.join(projectRoot, "package.json"), ret
	)
}
