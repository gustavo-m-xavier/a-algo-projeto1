import z from "zod";

/**
 * Representa a estrutura de uma requisição de rastreamento de página.
 */
export const trackingRequest = z.object({
	url: z.url().nonempty("A url é obrigatória"),
	username: z.string().min(3, "O nome deve ter ao menos 3 caracteres"),
}).meta({ id: 'trackingRequest' })

/**
 * Representa a estrutura de uma resposta de rastreamento de página.
 */
export const trackingResponse = z.object({
	message: z.string(),
	data: z.object({
		oldValue: z.string(),
		newValue: z.string(),
		date: z.string(),
		url: z.url()
	}),
}).meta({ id: 'trackingResponse' })