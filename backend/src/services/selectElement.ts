import { Page } from "puppeteer";
import { SelectedElement } from "../types/SelectedElement";

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

      const createdButton = document.createElement("button");

      createdButton.innerText = "Monitorar o click";
      createdButton.style.position = "fixed";
      createdButton.style.top = "10px";
      createdButton.style.right = "10px";
      createdButton.style.zIndex = "9999";
      createdButton.style.backgroundColor = "rgba(0, 63, 117, 0.9)";
      createdButton.style.color = "white";
      createdButton.style.padding = "1rem";
      createdButton.style.boxShadow = "rgba(0,0,0,0.24) 0px 3px 8px";

      document.body.appendChild(createdButton);

      createdButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          createdButton.innerText = "Monitorando click...";

          document.addEventListener(
            "mousedown",
            (event) => {
              event.preventDefault();
              event.stopPropagation();

              const el = event.target as HTMLElement;

              if (el === createdButton) {
                return;
              }

              const data = {
                selector: getFullSelector(el),
                text: el.innerText || "",
              };

              (window as any).elementSelected(data);
            },
            { once: true, capture: true },
          );
        },
        { capture: true },
      );
    });
  });
}
