import z from "zod";

export const monitorRequestBody = z.object({
	url: z.url().nonempty("A url é obrigatória"),
})

export const monitorResponseBody = z.object({
	message: z.string(),
	data: z.object({
		oldValue: z.string(),
		newValue: z.string(),
	}),
})