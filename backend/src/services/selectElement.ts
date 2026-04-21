import { Page } from "puppeteer";
import { SelectedElement } from "../types/SelectedElement";

/**
 * Seleciona um elemento na página e retorna suas informações.
 * @param page a instância da página do Puppeteer onde o elemento será selecionado.
 * @returns uma Promise que resolve com um objeto contendo o seletor CSS completo e o texto do elemento selecionado.
 */
export async function selectElementAsync(page: Page): Promise<SelectedElement> {
	return new Promise(async (resolve) => {
		await page.exposeFunction("elementSelected", (data: SelectedElement) => {
			resolve(data);
		});

		await page.evaluate(() => {
			const createdButton = createOverlay();

			createdButton.addEventListener(
				"click",
				(event) => handleElementSelection(event, createdButton),
				{ capture: true },
			);
		});
	});
}

/**
 * Obtém o seletor completo de um elemento, incluindo índices para elementos irmãos do mesmo tipo.
 * @param el o elemento HTML para o qual o seletor deve ser gerado.
 * @returns uma string representando o caminho completo do seletor CSS para o elemento fornecido.
 */
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

/**
 * Renderiza um controle de sobreposição para realizar o monitoramento de elementos da página.
 * @returns O controle responsável por iniciar o monitoramento de cliques na página.
 */
function createOverlay(): HTMLButtonElement {
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

	return createdButton;
}

/**
 * Manipula o evento de clique no controle de sobreposição, iniciando o monitoramento do próximo clique na página para capturar o elemento selecionado.
 * @param event O evento de clique que aciona o callback.
 * @param overlay O controle de sobreposição que inicia o monitoramento de cliques na página.
 * @remarks O monitoramento é configurado para capturar apenas o próximo clique na página, ignorando cliques subsequentes até que o processo seja reiniciado.
 */
function handleElementSelection(event: PointerEvent, overlay: HTMLButtonElement) {
	event.preventDefault();
	event.stopPropagation();

	overlay.innerText = "Monitorando click...";

	document.addEventListener(
		"mousedown",
		(event) => {
			event.preventDefault();
			event.stopPropagation();

			const el = event.target as HTMLElement;

			if (el === overlay) {
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
}