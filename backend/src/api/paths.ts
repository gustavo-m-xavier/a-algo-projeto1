import { errorResponseRefs, jsonBody, jsonResponse, Paths, schemaRef } from "@apexjs-org/openapi";

/**
 * Define a documentação de endpoints para a rota de monitoramento.
 */
export const monitorPaths: Paths = {
	'/monitor': {
		post: {
			operationId: 'monitorPage',
			summary: 'Monitora uma página web para mudanças em um elemento selecionado',
			requestBody: jsonBody(schemaRef('monitorRequest')),
			responses: {
				...errorResponseRefs(),
				'200': jsonResponse(schemaRef('monitorResponse')),
			}
		}
	}
}