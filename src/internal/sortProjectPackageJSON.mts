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

function indent(str: string): string {
	return str.split("\n").map((line, index) => {
		if (index === 0) return line

		return `  ${line}`
	}).join("\n")
}

export async function sortProjectPackageJSON(
	projectRoot: string, packageJSON: NodePackageJSON
) {
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
