import puppeteer from "puppeteer";
import { selectElement } from "./selectElement";

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto("https://www.b3.com.br/pt_br/para-voce");

  console.log("Página carregada!");
  console.log("Esperando o usuário clicar em um elemento...");

  const selected = await selectElement(page);

  console.log("Elemento Selecionado...", selected);
}

main();
