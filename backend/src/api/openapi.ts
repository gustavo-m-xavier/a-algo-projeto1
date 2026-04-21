import { errorResponses, errorSchema, jsonSchemas, OpenApi, searchParameters } from "@apexjs-org/openapi";
import { monitorPaths } from "./paths";
import * as schemas from './schema'

export const openApi: OpenApi = {
	openapi: '3.1.1',
	info: {
		title: 'Monitoramento de Leilões',
		version: '1.0.1',
		description: 'API para monitorar mudanças em páginas web de leilões, corretoras etc.',
	},
	security: [],
	paths: monitorPaths,
	components: {
		schemas: {
			Error: errorSchema(),
			...jsonSchemas(schemas)
		},
		responses: errorResponses()
	}
}