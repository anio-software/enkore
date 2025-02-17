import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Compile} from "../Steps.d.mts"
import {createObjectFiles} from "./createObjectFiles.mts"
import {buildProducts} from "../6.buildProducts/index.mts"

export async function compile(
	session: InternalSession
) : Promise<Compile> {
	session.debugPrint(`stage:compile`)

	const messages = await createObjectFiles(session)

	return {
		buildProducts: async function(productNames: string[]|null) {
			return await buildProducts(session, productNames)
		},
		messages
	}
}
