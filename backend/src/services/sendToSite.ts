import { Browser } from "puppeteer";

/**
 * Envia informações coletadas para um site específico.
 * @param browser Uma instância do navegador Puppeteer para abrir uma nova página e enviar os dados.
 * @param oldValue O valor antigo que foi monitorado e que será enviado para o site.
 * @param newValue O valor atualizado que foi monitorado e que será enviado para o site.
 * @returns Uma Promise que resolve quando os dados forem enviados com sucesso para o site.
 */
export async function sendToSiteAsync(
	browser: Browser,
	oldValue: string,
	newValue: string,
) {
	const page = await browser.newPage();

	await page.goto("https://httpbin.org/forms/post");

	await page.type('input[name="custname"]', "Bot de Monitoramento");

	await page.type(
		'textarea[name="comments"]',
		`Valor Antigo: ${oldValue} | Valor Atualizado: ${newValue}`,
	);

	const button = (await page.$$("button"))[0];

	if (button) {
		await button.click();
	}
}
