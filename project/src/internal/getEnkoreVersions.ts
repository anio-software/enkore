import type {TargetIdentifier} from "@anio-software/enkore-private.spec/primitives"
import {resolveImportSpecifierFromProjectRoot} from "@anio-software/enkore-private.spec/utils"
import {readFileJSONSync} from "@anio-software/pkg.node-fs"

function getVersionOfPackage(projectRoot: string, moduleSpecifier: string): string {
	const resolved = resolveImportSpecifierFromProjectRoot(
		projectRoot, `${moduleSpecifier}/package.json`
	)

	if (!resolved) {
		throw new Error(`Unable to resolve "${moduleSpecifier}/package.json".`)
	}

	const packageJSON = readFileJSONSync(resolved)

	return (packageJSON as any).version
}

export function getEnkoreVersions(projectRoot: string, targetIdentifier: TargetIdentifier) {
	return {
		enkore: getVersionOfPackage(projectRoot, "@anio-software/enkore"),
		core: getVersionOfPackage(projectRoot, "@anio-software/enkore.core"),
		target: getVersionOfPackage(projectRoot, `@anio-software/enkore.target-${targetIdentifier}`)
	}
}
