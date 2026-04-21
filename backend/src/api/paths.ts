import { errorResponseRefs, jsonBody, jsonResponse, Paths, schemaRef } from "@apexjs-org/openapi";

export const monitorPaths: Paths = {
	'/monitor': {
		post: {
			operationId: 'monitorPage',
			summary: 'Monitora uma página web para mudanças em um elemento selecionado',
			requestBody: jsonBody(schemaRef('monitorRequestBody')),
			responses: {
				...errorResponseRefs(),
				'200': jsonResponse(schemaRef('monitorResponseBody')),
			}
		}
	}
}