import {enkoreSteps} from "./enkoreSteps.mjs"

function buildRunStep(step) {
	const stepIndex = enkoreSteps.indexOf(step)
	const nextStep = (enkoreSteps.length > stepIndex + 1) ? enkoreSteps[stepIndex + 1] : false

	const executeStep = (() => {
		if (step === "preInit") {
			return `preInit.runStep(session)`
		} else if (step === "buildProducts") {
			return `buildProducts(null)`
		}

		return `${step}()`
	})()

	let code = ``

	if (nextStep) {
		code += `\tconst {messages: ${step}Messages, ${nextStep}} = await ${executeStep}\n`
	} else {
		code += `\tconst {messages: ${step}Messages} = await ${executeStep}\n`
	}

	code += `\n`
	code += `\tif (hasErrors(${step}Messages) && shouldStop) {\n`
	code += `\t\treturn stoppedBecauseOfError(session, "${step}", ${step}Messages)\n`
	code +=  `\t}\n\n`

	return code
}

export function buildRunAllStepsFile() {
	let code = `import type {InternalSession} from "#~src/internal/InternalSession.d.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"
import type {Step} from "#~synthetic/user/Steps.d.mts"

type ExtendedNodeAPIMessage = NodeAPIMessage & {
	step: string
}

import preInit from "#~src/internal/steps/0.preInit/index.mts"
import {hasErrors} from "#~src/internal/steps/defineStep.mts"

function stoppedBecauseOfError(
	session: InternalSession,
	step: Step,
	stepMessages: NodeAPIMessage[]
): {
	messages: ExtendedNodeAPIMessage[]
} {
	const stoppedBecauseOfErrorMessage: ExtendedNodeAPIMessage = {
		step,
		id: "stoppedBecauseOfError",
		severity: "error",
		message: "Stopped execution because of previous errors."
	}

	session.emitMessage(
		stoppedBecauseOfErrorMessage.severity,
		stoppedBecauseOfErrorMessage.id,
		stoppedBecauseOfErrorMessage.message
	)

	return {
		messages: [
			...stepMessages.map(msg => {
				return {
					...msg,
					step
				}
			}),

			//
			// While a step is running its emitted messages
			// are automatically collected. However, this won't happen here
			// for 'stoppedBecauseOfErrorMessage' because the step has already 
			// finished execution.
			//
			stoppedBecauseOfErrorMessage
		]
	}
}

export async function runAllSteps(
	session: InternalSession
): Promise<{
	messages: ExtendedNodeAPIMessage[]
}> {\n`

	code += `\tconst shouldStop = session.options._forceBuild !== true\n`

	for (const step of enkoreSteps) {
		code += buildRunStep(step)
	}

	code += `\tfunction map(step: Step, messages: NodeAPIMessage[]) {
		return messages.map(x => {
			return {...x, step}
		})
	}

	return {
		messages: [
${(() => {
	let code = ``

	for (const step of enkoreSteps) {
		code += `\t\t\t...map("${step}", ${step}Messages),\n`
	}

	return code.slice(0, -2)
})()}
		]
	}
`

	code += `}\n`

	return code
}
