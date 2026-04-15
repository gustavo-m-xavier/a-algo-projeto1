import puppeteer from "puppeteer";
import express from "express";
import cors from "cors";
import { selectElement } from "./services/selectElement";
import { monitorElement } from "./services/monitor";
import { isValidUrl } from "./utils/urlValidator";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/monitor", async (req, res) => {
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

  const selected = await selectElement(page);

  console.log("Elemento Selecionado...", selected);

  const newValue = await monitorElement(
    browser,
    page,
    selected.selector,
    selected.text,
  );

  res.json({
    message: "Mudança capturada com sucesso!",
    data: {
      oldValue: selected.text,
      newValue: newValue,
    },
  });

  browser.close();
});

app.listen(3000, () => {
  console.log("Servidor rodando em: http://localhost:3000");
});
