/**
 * Representa um elemento HTML selecionado pelo usuário.
 */
export type SelectedElement = {
	/**
	 * O seletor CSS do elemento selecionado, usado para identificá-lo na página.
	 */
	selector: string;

	/**
	 * O texto contido no elemento selecionado, capturado para monitoramento de mudanças.
	 */
	textContent: string;
};
