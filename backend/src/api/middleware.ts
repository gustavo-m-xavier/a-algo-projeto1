import { NextFunction, Request, RequestHandler, Response } from "express";
import { middleware } from "express-openapi-validator";
import { OpenAPIObject, OperationObject, PathItemObject, PathsObject } from "openapi3-ts/oas30";

export function schemaParsingMiddleware(
	apiSpec: any,
	operations: Record<string, RequestHandler>,
	_securityHandlers: any = {},
	_options: any = {}
) {
	return middleware({
		apiSpec,
		validateRequests: { removeAdditional: 'all' },
		operationHandlers: {
			basePath: '/operations',
			resolver: function (_, route, apiDoc) {
				const doc = apiDoc as OpenAPIObject | undefined;

				if (!doc || !doc.paths) return undefined;

				const paths = doc.paths as PathsObject;
				const pathKey = route.openApiRoute.substring(route.basePath.length);

				const pathItem = paths[pathKey] as PathItemObject | undefined;

				if (!pathItem) return undefined;

				const methodKey = route.method.toLowerCase() as keyof PathItemObject;

				const schema = pathItem[methodKey] as OperationObject | undefined;

				if (!schema || !schema.operationId) return undefined;

				return operations[schema.operationId as string];
			}
		}
	});
}

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
	res.status(err.status || 500).json({
		message: err.status ? err.message : 'internal server error',
		errors: err.status ? err.errors : undefined
	});
}