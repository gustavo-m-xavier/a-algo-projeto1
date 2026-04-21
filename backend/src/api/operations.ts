import { Request, RequestHandler, Response } from "express";
import { isValidUrl } from "../utils/urlValidator";
import puppeteer from "puppeteer";
import { selectElementAsync } from "../services/selectElement";
import { monitorElementAsync } from "../services/monitor";

export const operations: Record<string, RequestHandler> = {
	monitor: async (req: Request, res: Response) => {
		const { url } = req.body;

		if (!url) {
			return res.status(400).json({ error: "A url é obrigatória" });
		}

		if (!isValidUrl(url)) {
			return res.status(400).json({ error: "A url é inválida" });
		}

		const browser = await puppeteer.launch({
			headless: false,
			defaultViewport: null,
		});

		const page = await browser.newPage();

		await page.goto(url);

		console.log("Página carregada!");
		console.log("Esperando o usuário clicar em um elemento...");

		const selected = await selectElementAsync(page);

		console.log("Elemento Selecionado...", selected);

		const newValue = await monitorElementAsync(
			browser,
			page,
			selected.selector,
			selected.textContent,
		);

		res.json({
			message: "Mudança capturada com sucesso!",
			data: {
				oldValue: selected.textContent,
				newValue: newValue,
			},
		});

		browser.close();
	}
}