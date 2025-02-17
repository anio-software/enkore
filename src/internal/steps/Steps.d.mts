import type {API} from "#~src/API.d.mts"

type R<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>

export type Init = R<R<API["enkore"]>["project"]["init"]>
export type Clean = R<Init["clean"]>
export type Autogenerate = R<Clean["autogenerate"]>
export type Preprocess = R<Autogenerate["preprocess"]>
export type Lint = R<Preprocess["lint"]>
export type Compile = R<Lint["compile"]>
export type BuildProducts = R<Compile["buildProducts"]>
