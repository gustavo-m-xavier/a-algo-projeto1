import { Page, Browser } from "puppeteer";
import { submitTrackingAsync } from "./tracking-submitter";
import { emitLog } from "./log-emitter";

/**
 * Realiza o monitoramento de um elemento específico em uma página, verificando periodicamente seu valor e enviando uma notificação quando houver uma mudança.
 * @param browser A instância do navegador Puppeteer.
 * @param page A instância da página onde o elemento está localizado.
 * @param selector O seletor CSS do elemento a ser monitorado.
 * @param initialValue O valor inicial capturado na primeira verificação do elemento, usado como referência para detectar mudanças subsequentes.
 * @returns Uma Promise que resolve com o novo valor do elemento quando uma mudança for detectada.
 */
async function readValue(page: Page, selector: string, referenceLength: number): Promise<string> {
	return page.evaluate((sel, refLen) => {
		const el = document.querySelector(sel);
		if (!el) return "";

		const text = ((el as HTMLElement).innerText || "").trim();

		// Se o valor parece truncado, sobe na árvore até achar um ancestral compatível
		if (refLen > 3 && text.length < refLen * 0.6) {
			let parent = el.parentElement;
			while (parent && parent !== document.body) {
				const pt = ((parent as HTMLElement).innerText || "").trim();
				if (pt.length >= refLen * 0.6 && pt.length <= refLen * 4) {
					return pt;
				}
				parent = parent.parentElement;
			}
		}

		return text;
	}, selector, referenceLength);
}

async function readStableValue(page: Page, selector: string, referenceLength: number): Promise<string> {
	let last = "";
	let streak = 0;

	while (streak < 3) {
		await new Promise((r) => setTimeout(r, 150));

		try {
			const val = await readValue(page, selector, referenceLength);

			if (val === last) {
				streak++;
			} else {
				last = val;
				streak = 0;
			}
		} catch {
			streak = 0;
		}
	}

	return last;
}

export async function monitorElementAsync(
	browser: Browser,
	page: Page,
	selector: string,
	initialValue: string,
) {
	let oldValue = initialValue;

	emitLog("Iniciando monitoramento do elemento...");
	emitLog(`Valor Inicial: "${oldValue}"`);

	while (true) {
		try {
			const currentValue = await readValue(page, selector, oldValue.length);

			emitLog("Checando elemento...");

			if (currentValue !== oldValue) {
				emitLog("Possível mudança detectada, aguardando estabilização...");

				const stableValue = await readStableValue(page, selector, oldValue.length);

				if (stableValue !== oldValue) {
					emitLog("Mudança confirmada!");
					emitLog(`Antigo: "${oldValue}"`);
					emitLog(`Novo: "${stableValue}"`);

					await submitTrackingAsync(browser, oldValue, stableValue);

					return stableValue;
				}
			}
		} catch (err) {
			emitLog(`Elemento não encontrado. Verifique o seletor: ${selector}`);
		}

		await new Promise((r) => setTimeout(r, 3000));
	}
}
