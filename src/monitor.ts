import { Page } from "puppeteer";

export async function monitorElement(
  page: Page,
  selector: string,
  initialValue: string,
) {
  let oldValue = initialValue;

  console.log("Iniciando monitoramento do elemento...");
  console.log("Valor Inicial", oldValue);

  setInterval(async () => {
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

        oldValue = newValue;
      }
    } catch (err) {
      console.log("Elemento não encontrado. Verifique o seletor:", selector);
    }
  }, 3000);
}
