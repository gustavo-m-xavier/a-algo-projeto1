import express from "express";
import cors from "cors";
import { errorMiddleware, schemaParsingMiddleware } from "./api/middleware";
import { openApi } from "./api/openapi";
import { operations } from "./api/operations";

const runApp = async () => {
	try {
		const app = express()

		app.use(express.json())
		app.use(cors())

		console.log("Importing API Specification:")
		console.dir(openApi, { depth: null })

		app.use(schemaParsingMiddleware(openApi, operations))
		app.use(errorMiddleware)

		app.listen(3000, () => console.log("Server running on port 3000\nAccess API docs at http://localhost:3000/api-docs"));
	}
	catch (err) {
		console.error(err);
	}
}

runApp()