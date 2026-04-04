import { Page } from "puppeteer";
import { SelectedElement } from "./types/SelectedElement";

export async function selectElement(page: Page): Promise<SelectedElement> {
  return new Promise(async (resolve) => {
    await page.exposeFunction("elementSelected", (data: SelectedElement) => {
      resolve(data);
    });

    await page.evaluate(() => {
      function getFullSelector(el: HTMLElement): string {
        let path = "";

        while (el.parentElement) {
          let tag = el.tagName.toLowerCase();

          const siblings = Array.from(el.parentElement.children).filter(
            (child) => child.tagName === el.tagName,
          );

          if (siblings.length > 1) {
            const index = siblings.indexOf(el) + 1;
            tag += `:nth-of-type(${index})`;
          }

          path = tag + (path ? " > " + path : "");
          el = el.parentElement;
        }

        return path;
      }

      alert("Clique no elemento que deseja monitorar!");

      document.addEventListener(
        "mousedown",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          const el = event.target as HTMLElement;

          const data = {
            selector: getFullSelector(el),
            text: el.innerText || "",
          };

          (window as any).elementSelected(data);
        },
        { once: true, capture: true },
      );
    });
  });
}
