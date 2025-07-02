import type {InternalSession} from "./InternalSession.ts"
import type {NodeAPIEmitMessage} from "./NodeAPIEmitMessage.ts"

export function getEmitFileMessage(
	session: InternalSession,
	relativeFilePath: string
): NodeAPIEmitMessage {
	function augment(message: string): string {
		const lines: string[] = message.split("\n")
		const start = `File '${relativeFilePath}': `
		const filler = " ".repeat(start.length)
		let ret = ``

		for (let i = 0; i < lines.length; ++i) {
			const line = lines[i]
			const hasNextLine = lines.length > (i + 1)

			ret += `${i === 0 ? start : filler}${line}`

			if (hasNextLine) ret += "\n"
		}

		return ret
	}

	return (
		severity,
		arg1,
		arg2?
	) => {
		const {events} = session

		if (arguments.length === 2) {
			events._emitEvent("message", {severity, id: undefined, message: augment(arg1 as string)})
		} else {
			events._emitEvent("message", {severity, id: arg1     , message: augment(arg2 as string)})
		}
	}
}
