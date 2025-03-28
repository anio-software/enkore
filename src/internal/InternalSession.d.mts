import type {
	EnkoreCoreAPI,
	EnkoreRealmIntegrationAPI,
	EnkoreSessionAPI,
	EnkoreConfig,
	RawType,
	EnkoreNodeAPIOptions
} from "@enkore/spec"

import type {Events} from "./Events.d.mts"
import type {EventEmitter} from "@aniojs/event-emitter"
import type {InternalSessionState} from "./InternalSessionState.d.mts"

export type InternalSession = {
	core: EnkoreCoreAPI
	state: InternalSessionState
	emitMessage: EnkoreSessionAPI["enkore"]["emitMessage"]

	events: EventEmitter<Events, true>

	options: Required<RawType<EnkoreNodeAPIOptions>>
	projectRoot: string
	projectConfig: EnkoreConfig
	realmIntegrationAPI: EnkoreRealmIntegrationAPI
	publicAPI: EnkoreSessionAPI
}
