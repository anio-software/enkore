import type {
	EnkoreRealmIntegrationAPI,
	EnkoreSessionAPI,
	EnkoreConfig,
	RawType,
	EnkoreNodeAPIOptions
} from "@enkore/spec"

import type {_EmitEventType} from "@aniojs/event-emitter"
import type {Step} from "./Step.d.mts"
import type {InternalSessionState} from "./InternalSessionState.d.mts"

export type InternalSession = {
	state: InternalSessionState

	onStepStarted: (step: Step) => Promise<undefined>
	onStepFinished: (step: Step) => Promise<undefined>

	debugPrint: (message: string) => undefined

	options: Required<RawType<EnkoreNodeAPIOptions>>
	projectRoot: string
	projectConfig: EnkoreConfig
	realmIntegrationAPI: EnkoreRealmIntegrationAPI
	publicAPI: EnkoreSessionAPI
}
