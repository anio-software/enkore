import type {
	EnkoreRealmIntegrationAPI,
	EnkoreSessionAPI,
	EnkoreConfig,
	RawType,
	EnkoreNodeAPIOptions
} from "@enkore/spec"

import type {Events} from "./Events.d.mts"
import type {_EmitEventType, OnType, RemoveEventListenerType} from "@aniojs/event-emitter"
import type {InternalSessionState} from "./InternalSessionState.d.mts"

export type InternalSession = {
	state: InternalSessionState
	enableDebugPrint: boolean
	emitMessage: EnkoreSessionAPI["emitMessage"]

	events: {
		emit: _EmitEventType<Events>
		on: OnType<Events>
		removeListener: RemoveEventListenerType<Events>
	}

	options: Required<RawType<EnkoreNodeAPIOptions>>
	projectRoot: string
	projectConfig: EnkoreConfig
	realmIntegrationAPI: EnkoreRealmIntegrationAPI
	publicAPI: EnkoreSessionAPI
}
