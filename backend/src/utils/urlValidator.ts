/**
 * Efetua a validação de um texto para determinar se este se trata de uma URL válida.
 * @param url A possível URL a ser validada.
 * @returns Um booleano indicando se a URL é válida.
 */
export function isValidUrl(url: string) {
	try {
		new URL(url);
		return true;
	} catch (err) {
		return false;
	}
}
