import type {API} from "#~src/API.d.mts"

type R<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>

export type Product = R<
	R<
		R<
			API["enkore"]
		>["init"]
	>["compile"]
>["products"][0]
