import type {API} from "#~src/API.d.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"

type R<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>

type Step<T> = T extends {
	messages: NodeAPIMessage[]
} ? Omit<T, "messages"> : never

export type PreInit = Step<R<R<API["enkore"]>["project"]["preInit"]>>
export type Clean = Step<R<PreInit["clean"]>>
export type Autogenerate = Step<R<Clean["autogenerate"]>>
export type Preprocess = Step<R<Autogenerate["preprocess"]>>
export type Init = Step<R<Preprocess["init"]>>
export type Lint = Step<R<Init["lint"]>>
export type Compile = Step<R<Lint["compile"]>>
export type BuildProducts = Step<R<Compile["buildProducts"]>>
