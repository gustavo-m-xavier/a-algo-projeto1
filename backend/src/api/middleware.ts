import { NextFunction, Request, RequestHandler, Response } from "express";
import { middleware } from "express-openapi-validator";
import { OpenAPIObject, OperationObject, PathItemObject, PathsObject } from "openapi3-ts/oas30";

/**
 * Configura um middleware para validação de requisições com base em uma especificação OpenAPI, associando as operações definidas na especificação aos manipuladores de rota correspondentes.
 * @param apiSpec A especificação OpenAPI que define os endpoints, métodos e esquemas de validação para as requisições.
 * @param operations O conjunto de manipuladores de rota que correspondem às operações definidas na especificação.
 * @param _securityHandlers 
 * @param _options 
 * @returns Um middleware configurado para validar as requisições de acordo com a especificação OpenAPI e direcionar as requisições para os manipuladores de rota apropriados.
 */
export function schemaParsingMiddleware(apiSpec: any) {
	return middleware({
		apiSpec,
		validateRequests: { removeAdditional: 'all' },
		validateResponses: false
	});
}

/**
 * Configura um middleware para tratamento de erros não tratados em tempo de execução.
 * @param err O erro capturado durante a execução do middleware ou das rotas.
 * @param _req 
 * @param res A resposta a ser enviada ao cliente, contendo o status e a mensagem de erro apropriada.
 * @param _next 
 */
export function runtimeErrorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
	console.error(err)

	res.status(err.status || 500).json({
		message: err.status ? err.message : 'internal server error',
		errors: err.status ? err.errors : undefined
	});
}