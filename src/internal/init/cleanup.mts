import type {InternalSession} from "../InternalSession.d.mts"
import {remove, mkdirp} from "@aniojs/node-fs"
import path from "node:path"

export async function cleanup(
	session: InternalSession
) {
	await remove(path.join(session.projectRoot, ".build"))
	await mkdirp(path.join(session.projectRoot, ".build"))

	await remove(path.join(session.projectRoot, ".objects"))
	await mkdirp(path.join(session.projectRoot, ".objects"))

	await remove(path.join(session.projectRoot, "dist"))
}
