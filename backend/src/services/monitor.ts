import { Page, Browser } from "puppeteer";
import { sendToSite } from "./sendToSite";

export async function monitorElement(
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

        await sendToSite(browser, oldValue, newValue);

        oldValue = newValue;
        break;
      }
    } catch (err) {
      console.log("Elemento não encontrado. Verifique o seletor:", selector);
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
}
