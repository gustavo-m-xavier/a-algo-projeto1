console.log('Overlay injetado no MAIN WORLD')

	(function () {
		/**
		 * Obtém o seletor completo de um elemento, incluindo índices para elementos irmãos do mesmo tipo.
		 * @param el o elemento HTML para o qual o seletor deve ser gerado.
		 * @returns uma string representando o caminho completo do seletor CSS para o elemento fornecido.
		 */
		function getFullSelector(el) {
			let path = ''
			while (el.parentElement) {
				let tag = el.tagName.toLowerCase()
				const siblings = Array.from(el.parentElement.children)
					.filter(child => child.tagName === el.tagName)

				if (siblings.length > 1) {
					const index = siblings.indexOf(el) + 1
					tag += `:nth-of-type(${index})`
				}

				path = tag + (path ? ' > ' + path : '')
				el = el.parentElement
			}
			return path
		}


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

			overlay.innerText = 'Monitorando click...'

			window.addEventListener(
				'mousedown',
				(event) => {
					event.preventDefault()
					event.stopPropagation()

					const el = event.target
					if (el === overlay) return

					const data = {
						selector: getFullSelector(el),
						textContent: el.innerText || '',
					}

					window.elementSelected(data)
				},
				{ once: true, capture: true }
			)
		}

		const btn = createOverlay()
		btn.addEventListener('click', (e) => handleElementSelection(e, btn), true)

		window.__overlayLoaded = true
	})()
