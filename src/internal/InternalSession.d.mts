import type {
	EnkoreRealmIntegrationAPI,
	EnkoreSessionAPI,
	EnkoreConfig,
	RawType,
	EnkoreNodeAPIOptions
} from "@enkore/spec"

import type {NodeAPIMessage} from "@enkore/spec/primitives"
import type {Step} from "./Step.d.mts"
import type {_EmitEventType} from "@aniojs/event-emitter"

import type {InternalSessionState} from "./InternalSessionState.d.mts"

export type InternalSession = {
	state: InternalSessionState

	setCurrentStep: (step: Step) => undefined
	getAggregatedMessages: () => NodeAPIMessage[]

	debugPrint: (message: string) => undefined

	options: Required<RawType<EnkoreNodeAPIOptions>>
	projectRoot: string
	projectConfig: EnkoreConfig
	realmIntegrationAPI: EnkoreRealmIntegrationAPI
	publicAPI: EnkoreSessionAPI
}
