import {enkoreSteps} from "./enkoreSteps.mjs"
import {identifierToType} from "./buildUtils.mjs"

export function buildStepsTypeFile() {
	let code = ``

	code += `import type {InternalSession} from "#~src/internal/InternalSession.d.mts"\n`
	code += `import type {API} from "#~src/API.d.mts"\n`
	code += `\n`
	code += `type R<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>\n`
	//
	// this types adds the session parameter in first place and
	// removes the "messages" property from the return type
	//
	code += `type DefineStep<T extends (...args: any[]) => any> = (\n`
	code += `	session: InternalSession,\n`
	code += `	...args: Parameters<T>\n`
	code += `) => Promise<Omit<Awaited<ReturnType<T>>, "messages">>\n`
	code += `\n`

	for (let i = 0; i < enkoreSteps.length; ++i) {
		const currentStep = enkoreSteps[i]

		code += `export type ${identifierToType(currentStep)} = `

		if (currentStep === "preInit") {
			code += `DefineStep<R<API["enkore"]>["project"]["preInit"]>`
		} else {
			const previousStep = enkoreSteps[i - 1]

			code += `DefineStep<R<${identifierToType(previousStep)}>["${currentStep}"]>`
		}

		code += `;\n`
	}

	code += `\n`
	code += `export type StepsMap = {\n`

	for (const step of enkoreSteps) {
		code += `\t"${step}": ${identifierToType(step)},\n`
	}

	code += `}\n`
	code += `\n`

	code += `export type Step = keyof StepsMap\n`

	return code
}
