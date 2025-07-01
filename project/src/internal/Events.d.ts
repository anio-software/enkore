import type {API} from "#~src/API.d.mts"
import type {ExtractEventsFromCompoundType} from "@anio-software/pkg.event-emitter"

export type Events = ExtractEventsFromCompoundType<
	Awaited<ReturnType<API["enkore"]>>["project"]
>
