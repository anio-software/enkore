import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {Preprocess} from "../Steps.d.mts"
import {replicateDirectoryTree} from "./replicateDirectoryTree.mts"
import {preprocessFiles} from "./preprocessFiles.mts"
import {lint} from "../4.lint/index.mts"

export async function preprocess(
	session: InternalSession
) : Promise<Preprocess> {
	session.setCurrentStep("preprocess")

	await replicateDirectoryTree(session)

	await preprocessFiles(session)

	return {
		lint: async function() {
			return await lint(session)
		},
		messages: []
	}
}
