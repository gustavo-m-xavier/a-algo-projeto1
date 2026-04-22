import express from "express";
import cors from "cors";
import { runtimeErrorMiddleware, schemaParsingMiddleware } from "./api/middleware";
import { openApi } from "./api/openapi";
import { operations } from "./api/operations";
import { logEmitter } from "./services/log-emitter";

/**
 * Configura o ciclo de vida básico da aplicação, desde a exposição de endpoints até a configuração de middlewares e tratamento de erros.
 */
const runAppAsync = async () => {
	try {
		const app = express()

		app.use(express.json())
		app.use(cors())

		console.log("Importing API Specification:")
		console.dir(openApi, { depth: null })

		app.get('/docs', (_req, res) => {
			res.json(openApi);
		})

		app.get('/logs', (req, res) => {
			res.setHeader('Content-Type', 'text/event-stream');
			res.setHeader('Cache-Control', 'no-cache');
			res.setHeader('Connection', 'keep-alive');
			res.flushHeaders();

			const listener = (message: string) => {
				res.write(`data: ${JSON.stringify({ message })}\n\n`);
			};

			logEmitter.on('log', listener);

			req.on('close', () => {
				logEmitter.off('log', listener);
			});
		})

		app.use(schemaParsingMiddleware(openApi))

		app.post('/monitor', operations.trackPage)

		app.use(runtimeErrorMiddleware)

		app.listen(
			3000,
			() => console.log("Server running on port 3000\nAccess API docs at http://localhost:3000/docs")
		);
	}
	catch (err) {
		console.error(err);
	}
}

runAppAsync()