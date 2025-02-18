import type {
	EnkoreRealmIntegrationAPI,
	EnkoreSessionAPI,
	EnkoreConfig,
	RawType,
	EnkoreNodeAPIOptions
} from "@enkore/spec"

import type {Events} from "./Events.d.mts"
import type {_EmitEventType, OnType} from "@aniojs/event-emitter"
import type {Step} from "./Step.d.mts"
import type {InternalSessionState} from "./InternalSessionState.d.mts"

export type InternalSession = {
	state: InternalSessionState

	events: {
		emit: _EmitEventType<Events>
		on: OnType<Events>
	}

	onStepStarted: (step: Step) => Promise<undefined>
	onStepFinished: (step: Step) => Promise<undefined>

	debugPrint: (message: string) => undefined

	options: Required<RawType<EnkoreNodeAPIOptions>>
	projectRoot: string
	projectConfig: EnkoreConfig
	realmIntegrationAPI: EnkoreRealmIntegrationAPI
	publicAPI: EnkoreSessionAPI
}
