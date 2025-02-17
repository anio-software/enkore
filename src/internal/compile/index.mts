/*
import type {InternalSession} from "../InternalSession.d.mts"
import type {Product} from "../Product.d.mts"
import type {Message} from "../Message.d.mts"
import {writeAtomicFile} from "@aniojs/node-fs"
import fs from "node:fs/promises"
import path from "node:path"

export async function compile(
	session: InternalSession
) : Promise<{
	messages: Message[]
	products: Product[]
}> {
	for (const entry of session.projectDirectoryEntries!) {
		if (entry.type !== "regularFile") continue
		if (entry.name.startsWith(".")) continue

		const contents = (await fs.readFile(
			path.join(
				session.projectRoot, ".build", entry.relative_path
			)
		)).toString()

		const ret = await session.realmIntegrationAPI.generateObjectFile(
			session.publicAPI, entry.relative_path, contents
		)

		if (ret === "ignore") {
			session.emitEvent("warning", {
				id: undefined,
				message: `Ignoring unsupported file '${entry.name}'`
			})

			continue
		} else if (ret === "copy") {
			await writeAtomicFile(
				path.join(
					session.projectRoot,
					".objects",
					entry.relative_path
				),
				contents
			)

			continue
		}

		const objectFiles = Array.isArray(ret) ? ret : [ret]

		for (const objectFile of objectFiles) {
			let destinationPath : string = ""

			if ("name" in objectFile) {
				destinationPath = path.join(
					path.dirname(entry.relative_path),
					objectFile.name
				)
			} else {
				destinationPath = path.normalize(objectFile.path)
			}

			await writeAtomicFile(
				path.join(session.projectRoot, ".objects", destinationPath),
				objectFile.contents
			)
		}
	}

	const products : Product[] = []

	for (const productName of session.productNames) {
		products.push({
			name: productName,
			async build() {
				// todo: create tmp dir in dist/
				await session.realmIntegrationAPI.generateProduct(session.publicAPI, productName)

				return {
					messages: []
				}
			}
		})
	}

	return {
		messages: [],
		products
	}
}
*/
