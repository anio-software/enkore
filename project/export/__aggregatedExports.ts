export const apiID = "EnkoreNodeAPI"
export const apiMajorVersion = 0
export const apiRevision = 0

export {enkore} from "#~src/public/enkore.ts"

import {
	createConfig,
	createAutogeneratedFile
} from "@anio-software/enkore-private.spec/factory"

export const defineConfig = createConfig
export const defineAutogeneratedFile = createAutogeneratedFile
