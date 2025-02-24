import {
	type RawType,
	type EnkoreConfig_V0_Rev0,
	createEntity
} from "@enkore/spec"

export function defineConfig(
	config: RawType<EnkoreConfig_V0_Rev0>
) {
	return createEntity("EnkoreConfig", 0, 0, config)
}
