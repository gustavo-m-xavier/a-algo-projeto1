import { Browser } from "puppeteer";

export async function sendToSite(
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

  await page.evaluate(() => alert("Dados enviados com sucesso!"));
}
