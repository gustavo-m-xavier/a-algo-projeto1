(function () {
	if (window.console && typeof console.log === 'function') {
		console.log('Overlay injetado no MAIN WORLD')
	}

	/**
	 * Inicializa o controle de sobreposição na página, permitindo ao usuário monitorar cliques em elementos específicos da página. 
	 */
	function startOverlay() {
		if (!document.body) {
			document.addEventListener('DOMContentLoaded', startOverlay, { once: true })
			return
		}

		let lockedElement = null
		let hoverHighlighted = null

		/**
		 * Renderiza um controle de sobreposição para realizar o monitoramento de elementos da página.
		 * @returns O controle responsável por iniciar o monitoramento de cliques na página.
		 */
		function createOverlay() {
			const btn = document.createElement('button')
			btn.innerText = 'Monitorar o click'
			btn.style.position = 'fixed'
			btn.style.top = '10px'
			btn.style.right = '10px'
			btn.style.zIndex = '2147483647'
			btn.style.backgroundColor = 'rgba(0, 63, 117, 0.9)'
			btn.style.color = 'white'
			btn.style.padding = '1rem'
			btn.style.boxShadow = 'rgba(0,0,0,0.24) 0px 3px 8px'
			btn.style.borderStyle = 'none'
			btn.style.borderRadius = '4px'
			btn.style.textTransform = 'uppercase'
			btn.id = 'tracking-selection-overlay'

			document.body.appendChild(btn)
			return btn
		}

		/**
		 * Manipula o evento de clique no controle de sobreposição, iniciando o monitoramento do próximo clique na página para capturar o elemento selecionado.
		 * @param event O evento de clique que aciona o callback.
		 * @param overlay O controle de sobreposição que inicia o monitoramento de cliques na página.
		 * @remarks O monitoramento é configurado para capturar apenas o próximo clique na página, ignorando cliques subsequentes até que o processo seja reiniciado.
		 */
		function handleElementSelection(event, overlay) {
			event.preventDefault()
			event.stopPropagation()

			overlay.innerText = 'Monitorando...'
			overlay.style.display = 'none'

			const hoverHandler = (e) => {
				if (e.target !== overlay) {
					highlightHover(e.target)
				}
			}

			window.addEventListener('mousemove', hoverHandler, true)

			window.addEventListener(
				'mousedown',
				(e) => {
					e.preventDefault()
					e.stopPropagation()

					window.removeEventListener('mousemove', hoverHandler, true)
					clearPreviousHoverHighlight()

					const el = e.target
					if (el === overlay) return

					lockHighlight(el)

					const data = {
						selector: getSelectorTree(el),
						textContent: el.innerText || '',
					}

					window.elementSelected && window.elementSelected(data)

					overlay.style.display = 'block'
					overlay.innerText = 'Monitorar o click'
				},
				{ once: true, capture: true }
			)
		}

		/**
		 * Destaca visualmente um elemento da página para indicar ao usuário o elemento a ser selecionado.
		 * @param element O elemento HTML que deve ser destacado quando o usuário passar o mouse sobre ele.
		 */
		function highlightHover(element) {
			if (hoverHighlighted && hoverHighlighted !== lockedElement) {
				hoverHighlighted.style.outline = ''
			}

			if (element !== lockedElement) {
				element.style.outline = '2px solid #ff9800'
				element.style.outlineOffset = '2px'
				hoverHighlighted = element
			}
		}

		/**
		 * Remove o destaque visual do penúltimo elemento destacado para indicar perda de foco do mesmo.
		 */
		function clearPreviousHoverHighlight() {
			if (hoverHighlighted && hoverHighlighted !== lockedElement) {
				hoverHighlighted.style.outline = ''
			}
			hoverHighlighted = null
		}

		/**
		 * Mantém o destaque visual de um elemento selecionado para indicar que o mesmo está sendo monitorado.
		 * @param element O elemento HTML que deve ser destacado.
		 */
		function lockHighlight(element) {
			if (lockedElement) {
				lockedElement.style.outline = ''
			}

			lockedElement = element
			element.style.outline = '2px solid #00c853'
			element.style.outlineOffset = '2px'
		}

		/**
		 * Obtém o seletor completo de um elemento, incluindo índices para elementos irmãos do mesmo tipo.
		 * @param element o elemento HTML para o qual o seletor deve ser gerado.
		 * @returns uma string representando o caminho completo do seletor CSS para o elemento fornecido.
		 */
		function getSelectorTree(element) {
			let treePath = ''

			while (element.parentElement) {
				let tag = element.tagName.toLowerCase()
				const siblings = Array.from(element.parentElement.children)
					.filter(child => child.tagName === element.tagName)

				if (siblings.length > 1) {
					const index = siblings.indexOf(element) + 1
					tag += `:nth-of-type(${index})`
				}

				treePath = tag + (treePath ? ' > ' + treePath : '')
				element = element.parentElement
			}

			return treePath
		}

		// Cria o botão e registra o listener
		const btn = createOverlay()
		btn.addEventListener('click', (e) => handleElementSelection(e, btn), true)

		window.__overlayLoaded = true
	}

	startOverlay()
})()
