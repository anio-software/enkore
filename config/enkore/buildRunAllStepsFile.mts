import {enkoreSteps} from "./enkoreSteps.mts"

function buildRunStep(step) {
	const stepIndex = enkoreSteps.indexOf(step)
	const nextStep = (enkoreSteps.length > stepIndex + 1) ? enkoreSteps[stepIndex + 1] : false

	const executeStep = (() => {
		if (step === "preInit") {
			return `preInit.runStep(session)`
		} else if (step === "buildProducts") {
			return `buildProducts(null)`
		} else if (step === "testProducts") {
			return `testProducts(runTests === true ? null : false)`
		} else if (step === "publishProducts") {
			return `publishProducts(runPublish === true ? null : false)`
		}

		return `${step}()`
	})()

	let code = ``

	if (nextStep) {
		code += `\tconst {messages: ${step}Messages, ${nextStep}} = await ${executeStep}\n`
	} else {
		code += `\tconst {messages: ${step}Messages} = await ${executeStep}\n`
	}

	code += `\taggregatedMessages = [...aggregatedMessages, ...map("${step}", ${step}Messages)]\n`

	code += `\tif (hasErrors(${step}Messages) && shouldStop) {\n`
	code += `\t\treturn {messages: [...aggregatedMessages, emitStoppedBecauseOfError(session, "${step}")]};\n`
	code += `\t}\n`

	code += `\n`

	return code
}

export function buildRunAllStepsFile() {
	let code = `import type {InternalSession} from "#~src/internal/InternalSession.ts"
import type {NodeAPIMessage} from "@anio-software/enkore-private.spec/primitives"
import type {Step} from "#~src/Steps.ts"

type ExtendedNodeAPIMessage = NodeAPIMessage & {
	step: string
}

import preInit from "#~src/internal/steps/0.preInit/index.ts"
import {hasErrors} from "#~src/internal/steps/defineStepChecked.ts"

function emitStoppedBecauseOfError(
	session: InternalSession,
	step: Step
): ExtendedNodeAPIMessage {
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

	//
	// While a step is running its emitted messages
	// are automatically collected. However, this won't happen here
	// for 'stoppedBecauseOfErrorMessage' because the step has already
	// finished execution.
	//
	return stoppedBecauseOfErrorMessage
}

export async function runAllSteps(
	session: InternalSession,
	runTests: boolean,
	runPublish: boolean
): Promise<{
	messages: ExtendedNodeAPIMessage[]
}> {\n`

	code += `\tconst shouldStop = session.options._forceBuild !== true\n`
	code += `\tlet aggregatedMessages: ExtendedNodeAPIMessage[] = []\n\n`

	for (const step of enkoreSteps) {
		code += buildRunStep(step)
	}

	code += `\tfunction map(step: Step, messages: NodeAPIMessage[]) {
		return messages.map(x => {
			return {...x, step}
		})
	}

	return {
		messages: aggregatedMessages
	}
`

	code += `}\n`

	return code
}
