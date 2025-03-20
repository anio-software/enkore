import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {API} from "#~src/API.d.mts"

type R<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>
type DefineStep<T extends (...args: any[]) => any> = (
	session: InternalSession,
	...args: Parameters<T>[]
) => Promise<Omit<Awaited<ReturnType<T>>, "messages">>

export type PreInit = DefineStep<R<API["enkore"]>["project"]["preInit"]>;
export type Clean = DefineStep<R<PreInit>["clean"]>;
export type Autogenerate = DefineStep<R<Clean>["autogenerate"]>;
export type Preprocess = DefineStep<R<Autogenerate>["preprocess"]>;
export type Init = DefineStep<R<Preprocess>["init"]>;
export type Lint = DefineStep<R<Init>["lint"]>;
export type Compile = DefineStep<R<Lint>["compile"]>;
export type BuildProducts = DefineStep<R<Compile>["buildProducts"]>;

export type StepsMap = {
	"preInit": PreInit,
	"clean": Clean,
	"autogenerate": Autogenerate,
	"preprocess": Preprocess,
	"init": Init,
	"lint": Lint,
	"compile": Compile,
	"buildProducts": BuildProducts,
}

export type Step = keyof StepsMap
