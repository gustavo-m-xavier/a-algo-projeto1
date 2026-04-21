import { Page, Browser } from "puppeteer";
import { submitTrackingAsync } from "./tracking-submitter";

/**
 * Realiza o monitoramento de um elemento específico em uma página, verificando periodicamente seu valor e enviando uma notificação quando houver uma mudança.
 * @param browser A instância do navegador Puppeteer.
 * @param page A instância da página onde o elemento está localizado.
 * @param selector O seletor CSS do elemento a ser monitorado.
 * @param initialValue O valor inicial capturado na primeira verificação do elemento, usado como referência para detectar mudanças subsequentes.
 * @returns Uma Promise que resolve com o novo valor do elemento quando uma mudança for detectada.
 */
export async function monitorElementAsync(
	browser: Browser,
	page: Page,
	selector: string,
	initialValue: string,
) {
	let oldValue = initialValue;

	console.log("Iniciando monitoramento do elemento...");
	console.log("Valor Inicial", oldValue);

	while (true) {
		try {
			const newValue = await page.$eval(
				selector,
				(el) => (el as HTMLElement).innerText || "",
			);

			console.log("Checando...");

			if (newValue !== oldValue) {
				console.log("Mudança detectada!");
				console.log("Antigo:", oldValue);
				console.log("Novo:", newValue);

				await submitTrackingAsync(browser, oldValue, newValue);

				return newValue;
			}
		} catch (err) {
			console.log("Elemento não encontrado. Verifique o seletor:", selector);
		}

		await new Promise((r) => setTimeout(r, 3000));
	}
}
