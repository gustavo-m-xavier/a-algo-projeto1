import { errorResponses, errorSchema, jsonSchemas, OpenApi, searchParameters } from "@apexjs-org/openapi";
import { monitorPaths } from "./paths";
import * as schemas from './schema'

/**
 * Definição da especificação OpenAPI para a API de monitoramento de leilões.
 * Utilizada pela aplicação para validar as requisições e gerar a documentação da API.
 */
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