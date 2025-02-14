import type {API} from "#~src/API.d.mts"

type R<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>

export type Message = R<
	R<
		R<
			API["enkore"]
		>["init"]
	>["compile"]
>["messages"][0]
