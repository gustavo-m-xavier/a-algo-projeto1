import { createDocument } from 'zod-openapi';
import { monitorPaths } from './paths';
import { errorSchema, errorResponses, OpenApi } from '@apexjs-org/openapi';
import { trackingRequest, trackingResponse } from './schema';

/**
 * Gera a especificação OpenAPI para a API de monitoramento utilizando os schemas e paths definidos.
 * Isto evita a inclusão de defaults que causem icompatibilidades com a validação de requisições, como a inclusão de campos com valores incorretos,
 * ou a falta de tradução adequada entre esquemas Zod e OpenAPI.
 */
const generated = createDocument({
	openapi: '3.1.1',
	info: { title: 'Monitor', version: '1.0.1' },
	components: {
		schemas: {
			trackingRequest: trackingRequest,
			trackingResponse: trackingResponse,
		}
	},
	paths: monitorPaths
});

/**
 * Representa a especificação OpenAPI gerada para a API de monitoramento.
 */
export const openApi: OpenApi = {
	openapi: '3.1.1',
	info: generated.info,
	paths: generated.paths ?? ({} as any),
	components: {
		schemas: { Error: errorSchema(), ...generated.components?.schemas },
		responses: errorResponses()
	}
};
