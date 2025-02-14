import type {API} from "#~src/API.d.mts"
import type {ExtractEventsFromCompoundType} from "@aniojs/event-emitter"

export type Events = ExtractEventsFromCompoundType<
	Awaited<ReturnType<API["enkore"]>>
>
