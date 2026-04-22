import EventEmitter from "events";

export const logEmitter = new EventEmitter();

export function emitLog(message: string) {
	console.log(message);
	logEmitter.emit("log", message);
}
