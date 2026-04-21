import { Page } from "puppeteer";
import { SelectedElement } from "../types/SelectedElement";
import path from "path";

/**
 * Seleciona um elemento na página e retorna suas informações.
 * @param page a instância da página do Puppeteer onde o elemento será selecionado.
 * @returns uma Promise que resolve com um objeto contendo o seletor CSS completo e o texto do elemento selecionado.
 */
export async function selectElementAsync(page: Page): Promise<SelectedElement> {
	return new Promise(async (resolve) => {
		// expõe callback para o browser
		await page.exposeFunction("elementSelected", (data: SelectedElement) => {
			resolve(data);
		});

		// injeta o script no MAIN WORLD
		const overlayPath = path.resolve(__dirname, "../browser/overlay.js");

		await page.addScriptTag({ path: overlayPath });

		// espera o script carregar
		await page.waitForFunction(() => (window as any).__overlayLoaded === true);
	});
}