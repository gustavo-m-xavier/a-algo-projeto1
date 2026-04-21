import { errorResponseRefs, jsonBody, jsonResponse, Paths, schemaRef, searchParameters } from "@apexjs-org/openapi";

const paths: Paths = {}

paths['/monitor'] = {
	post: {
		operationId: 'monitorPage',
		summary: 'Monitora uma página web para mudanças em um elemento selecionado',
		requestBody: jsonBody(schemaRef('monitorSchema')),
		responses: {
			...errorResponseRefs(),
			'200': jsonResponse(schemaRef('monitorResponseSchema')),
		}
	}
}

export const monitorPaths = paths;