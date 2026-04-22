import z from "zod";

export const monitorRequest = z.object({
	url: z.url().nonempty("A url é obrigatória"),
}).meta({ id: 'monitorRequest' })

export const monitorResponse = z.object({
	message: z.string(),
	data: z.object({
		oldValue: z.string(),
		newValue: z.string(),
		date: z.string(),
	}),
}).meta({ id: 'monitorResponse' })