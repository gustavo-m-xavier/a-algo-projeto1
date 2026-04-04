import { Page } from "puppeteer";
import { SelectedElement } from "./types/SelectedElement";

export async function selectElement(page: Page): Promise<SelectedElement> {
  return new Promise(async (resolve) => {
    await page.exposeFunction("elementSelected", (data: SelectedElement) => {
      resolve(data);
    });

    await page.evaluate(() => {
      function getSelector(el: HTMLElement): string {
        if (el.id) return `#${el.id}`;

        return el.tagName.toLowerCase();
      }

      alert("Clique no elemento que deseja monitorar!");

      document.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          const el = event.target as HTMLElement;

          const data = {
            selector: getSelector(el),
            text: el.innerText || "",
          };

          (window as any).elementSelected(data);
        },
        { once: true },
      );
    });
  });
}
