import { Request, RequestHandler, Response } from "express";
import { isValidUrl } from "../utils/urlValidator";
import puppeteer from "puppeteer";
import { selectElementAsync } from "../services/element-selection";
import { monitorElementAsync } from "../services/monitor";

/**
 * Define os handlers de operações para os endpoints da API.
 */
export const operations: Record<string, RequestHandler> = {
	/**
	 * Executa o monitoramento de um elemento em uma página Web até que ocorra uma mudança em seu conteúdo.
	 * @param req A requisição HTTP contendo a URL da página a ser monitorada no corpo da requisição.
	 * @param res A resposta HTTP.
	 * @returns Uma resposta JSON indicando o sucesso do monitoramento e os valores antigo e novo do elemento monitorado.
	 */
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