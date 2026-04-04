import puppeteer from "puppeteer";
import { selectElement } from "./services/selectElement";
import { monitorElement } from "./services/monitor";

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto("https://br.investing.com/crypto/bitcoin");

  console.log("Página carregada!");
  console.log("Esperando o usuário clicar em um elemento...");

  const selected = await selectElement(page);

  console.log("Elemento Selecionado...", selected);

  await monitorElement(browser, page, selected.selector, selected.text);
}

main();
