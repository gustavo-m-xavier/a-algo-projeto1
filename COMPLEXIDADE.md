# Análise de Complexidade — Big O

## Visão Geral do Projeto

Esta aplicação é um sistema full-stack de monitoramento web composto por:

- **Backend:** servidor Express.js (TypeScript) com automação de navegador via Puppeteer
- **Frontend:** aplicação React (TypeScript + Vite) com comunicação por HTTP e Server-Sent Events (SSE)

O fluxo principal consiste em: receber uma URL → abrir o navegador → permitir que o usuário selecione um elemento HTML → monitorar mudanças nesse elemento → enviar os dados capturados a um endpoint de destino.

---

## Notação e Variáveis

| Símbolo | Significado |
|---------|-------------|
| `n`     | Número total de nós no DOM |
| `h`     | Profundidade (altura) da árvore DOM do elemento selecionado até `document.body` |
| `s`     | Número médio de irmãos (_siblings_) por nível da árvore |
| `c`     | Número de filhos de um nó pai |
| `k`     | Comprimento de uma string (URL, seletor, valor) |
| `t`     | Número de iterações de polling até detectar mudança |
| `b`     | Número de elementos `<button>` presentes na página alvo |
| `m`     | Número acumulado de mensagens de log armazenadas no frontend |
| `r`     | Número de resultados de rastreamento acumulados no frontend |

---

## Backend

### 1. `readValue(page, selector, referenceLength)`
**Arquivo:** [backend/src/services/monitor.ts](backend/src/services/monitor.ts)

**Descrição:** Lê o valor textual de um elemento DOM e percorre a árvore de ancestrais para encontrar o texto representativo.

**Algoritmo:**

```
document.querySelector(selector)  →  busca linear no DOM
while (parent && parent !== document.body)  →  percurso vertical na árvore
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo | **O(n + h)** | `querySelector` percorre até `n` nós; o laço `while` percorre `h` ancestrais |
| Espaço | **O(1)** | Nenhuma estrutura auxiliar proporcional à entrada |

> O `document.querySelector` tem complexidade O(n) no pior caso, onde `n` é o total de nós do DOM. O laço de ancestrais percorre no máximo `h` níveis até `document.body`.

---

### 2. `readStableValue(page, selector, referenceLength)`
**Arquivo:** [backend/src/services/monitor.ts](backend/src/services/monitor.ts)

**Descrição:** Realiza **3 leituras consecutivas** com intervalo de 150 ms e confirma que o valor permanece estável entre elas antes de retorná-lo.

**Algoritmo:**

```
while (streak < 3)  →  loop fixo: no máximo 3 iterações
  readValue()        →  O(n + h) por chamada
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo | **O(n + h)** | O laço executa exatamente 3 vezes (constante); custo dominante é cada chamada a `readValue` |
| Espaço | **O(1)** | Apenas variáveis escalares auxiliares |

> O número de iterações é fixo (máximo 3), portanto o fator `3` é absorvido pela notação assintótica, mantendo O(n + h).

---

### 3. `monitorElementAsync(browser, page, selector, initialValue)`
**Arquivo:** [backend/src/services/monitor.ts](backend/src/services/monitor.ts)

**Descrição:** Loop de polling infinito que verifica periodicamente (a cada 3 segundos) se o valor do elemento monitorado mudou. Encerra quando uma mudança é detectada.

**Algoritmo:**

```
while (true)              →  loop potencialmente infinito
  readValue()             →  O(n + h) por iteração
  if (mudança detectada)
    readStableValue()     →  O(n + h)
    break
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo (pior caso) | **O(∞)** | O elemento pode nunca mudar; o loop não tem limite superior garantido |
| Tempo (caso geral) | **O(t × (n + h))** | `t` = número de polls até a mudança; cada poll executa `readValue` em O(n + h) |
| Espaço | **O(1)** | Nenhuma acumulação de dados ao longo das iterações |

> O tempo de execução é não determinístico e diretamente proporcional à latência do evento monitorado.

---

### 4. `getSelectorTree(element)`
**Arquivo:** [backend/src/browser/overlay.js](backend/src/browser/overlay.js)

**Descrição:** Constrói o seletor CSS completo de um elemento percorrendo sua árvore de ancestrais até a raiz do documento. Para cada nível, verifica irmãos do mesmo tipo para determinar índice `nth-of-type`.

**Algoritmo:**

```
while (element.parentElement)            →  O(h) níveis
  Array.from(parent.children)            →  O(c) filhos
    .filter(child => child.tagName ===)  →  O(c)
  siblings.indexOf(element)             →  O(c)
  treePath = tag + ' > ' + treePath     →  concatenação de string O(k) acumulada
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo | **O(h × c)** | Por nível: filtragem de `c` filhos em O(c); `indexOf` em O(c); `h` níveis totais |
| Espaço | **O(h)** | A string `treePath` cresce proporcionalmente à profundidade `h` |
| Concatenação de strings | **O(h²)** *(pior caso)* | Concatenação com `+` dentro do loop recria a string a cada iteração; `h` iterações com string crescendo linearmente resulta em custo quadrático acumulado |

> A concatenação repetida de strings (`treePath = tag + ' > ' + treePath`) dentro do loop é um **anti-padrão clássico** com custo acumulado O(h²). A alternativa eficiente seria acumular partes em um array e unir com `Array.join(' > ')` ao final, mantendo O(h).

---

### 5. `submitTrackingAsync(browser, oldValue, newValue)`
**Arquivo:** [backend/src/services/tracking-submitter.ts](backend/src/services/tracking-submitter.ts)

**Descrição:** Abre uma nova página no navegador e submete os dados capturados via formulário. Busca todos os botões da página para interação.

**Algoritmo:**

```
page.$$("button")  →  query de todos os botões da página (sem filtro)
[0]                →  acesso ao primeiro elemento — O(1)
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo | **O(b)** | `page.$$("button")` percorre o DOM para coletar todos os `b` botões existentes |
| Espaço | **O(b)** | Retorna um array com todos os `b` elementos `<button>` encontrados |

> A operação `page.$$("button")` sem filtro é desnecessariamente custosa: o código utiliza apenas o primeiro botão (`[0]`). O uso de `page.$("button")` (singular) resolveria em O(1) ao parar na primeira ocorrência.

---

### 6. `selectElementAsync(page)`
**Arquivo:** [backend/src/services/element-selection.ts](backend/src/services/element-selection.ts)

**Descrição:** Injeta o script de overlay na página e aguarda a seleção do elemento pelo usuário.

**Algoritmo:**

```
page.waitForFunction()  →  polling interno do Puppeteer até condição ser verdadeira
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo | **O(t_u)** | `t_u` = tempo até o usuário clicar; não determinístico (entrada humana) |
| Espaço | **O(1)** | Nenhuma acumulação de dados |

---

### 7. `isValidUrl(url)`
**Arquivo:** [backend/src/utils/urlValidator.ts](backend/src/utils/urlValidator.ts)

**Descrição:** Valida o formato de uma URL usando o construtor nativo `URL`.

**Algoritmo:**

```
new URL(url)  →  parsing linear proporcional ao comprimento da string
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo | **O(k)** | O parsing de uma string de comprimento `k` é linear |
| Espaço | **O(1)** | Apenas o objeto `URL` temporário é criado |

---

### 8. `trackPage` — Orquestrador Principal
**Arquivo:** [backend/src/api/operations.ts](backend/src/api/operations.ts)

**Descrição:** Handler da rota `/monitor`. Coordena sequencialmente todo o fluxo: validação de URL → abertura do browser → seleção de elemento → monitoramento.

**Algoritmo:**

```
isValidUrl()         →  O(k)
selectElementAsync() →  O(t_u)
monitorElementAsync()→  O(t × (n + h))
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo total | **O(k + t_u + t × (n + h))** | Soma das complexidades sequenciais; dominado pelo monitoramento |
| Tempo dominante | **O(t × (n + h))** | O loop de polling é sempre o maior fator |
| Espaço | **O(1)** | Nenhuma estrutura de dados cresce com a entrada |

---

## Frontend

### 9. Acumulação de Logs via EventSource
**Arquivo:** [frontend/src/App.tsx](frontend/src/App.tsx) — `handleSubmit`, linhas 43–46

**Descrição:** A cada mensagem recebida pelo SSE, o array de logs é atualizado com spread operator.

**Algoritmo:**

```typescript
setLogs((prev) => [...prev, data.message]);
// executado m vezes ao longo do monitoramento
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo por atualização | **O(m)** | O spread `[...prev]` copia os `m` elementos existentes a cada nova mensagem |
| Tempo total acumulado | **O(m²)** | `m` atualizações, cada uma de custo O(m): `1 + 2 + 3 + ... + m = m(m+1)/2` |
| Espaço | **O(m)** | O array `logs` cresce linearmente com o número de mensagens recebidas |

> O padrão de spread em estado React é idiomático para arrays pequenos, mas torna-se **O(m²) acumulado** em sessões longas sem limite no número de logs armazenados.

---

### 10. Acumulação de Resultados de Rastreamento
**Arquivo:** [frontend/src/App.tsx](frontend/src/App.tsx) — linha 66

**Descrição:** Resultados de rastreamento são acumulados em array por spread.

```typescript
setTrackingResults((prev) => [...prev, data.data]);
```

| Complexidade | Notação | Justificativa |
|---|---|---|
| Tempo por atualização | **O(r)** | Spread copia os `r` resultados existentes |
| Espaço | **O(r)** | Array cresce linearmente com o número de rastreamentos concluídos |

---

### 11. Renderização de Logs e Resultados
**Arquivo:** [frontend/src/App.tsx](frontend/src/App.tsx) — linhas 112–174

**Descrição:** Renderização da lista de logs e dos cards de resultados via `.map()`.

```typescript
logs.map((line, i) => ...)           // O(m)
trackingResults.map((result) => ...) // O(r)
```

| Componente | Complexidade de Tempo | Complexidade de Espaço |
|---|---|---|
| Renderização de logs | **O(m)** | **O(m)** nós DOM criados |
| Renderização de resultados | **O(r)** | **O(r)** nós DOM criados |
| `substring(0, 32)` (truncagem) | **O(1)** | **O(1)** |

---

## Tabela Resumo

| Função / Componente | Arquivo | Tempo | Espaço | Observação |
|---|---|---|---|---|
| `isValidUrl()` | `urlValidator.ts` | **O(k)** | O(1) | `k` = comprimento da URL |
| `readValue()` | `monitor.ts` | **O(n + h)** | O(1) | `n` nós DOM; `h` ancestrais |
| `readStableValue()` | `monitor.ts` | **O(n + h)** | O(1) | 3 chamadas fixas a `readValue` |
| `monitorElementAsync()` | `monitor.ts` | **O(t × (n + h))** | O(1) | `t` polls; pior caso O(∞) |
| `getSelectorTree()` | `overlay.js` | **O(h × c)** / **O(h²)** | O(h) | *concatenação de string no loop |
| `submitTrackingAsync()` | `tracking-submitter.ts` | **O(b)** | O(b) | `b` botões na página |
| `selectElementAsync()` | `element-selection.ts` | **O(t_u)** | O(1) | `t_u` = interação humana |
| `trackPage()` | `operations.ts` | **O(t × (n + h))** | O(1) | Dominado pelo monitoramento |
| Acumulação de logs (SSE) | `App.tsx` | **O(m²)** acumulado | O(m) | Spread em cada atualização |
| Acumulação de resultados | `App.tsx` | **O(r)** por update | O(r) | Sem limite de armazenamento |
| Renderização de logs | `App.tsx` | **O(m)** | O(m) | Re-renderiza tudo a cada update |
| Renderização de resultados | `App.tsx` | **O(r)** | O(r) | — |

---

## Análise dos Casos

### Melhor Caso — O(n + h)

O melhor caso ocorre quando o elemento monitorado **já possui o valor alterado antes do primeiro poll** (`t = 1`). Nesse cenário:

- Uma única execução de `readValue()`: O(n + h)
- Uma execução de `readStableValue()`: O(n + h)
- Sem acumulação de logs no frontend

**Complexidade global no melhor caso: O(n + h)**

---

### Caso Médio — O(t × (n + h))

No caso médio, o elemento muda após `t` iterações de polling. Assumindo DOM de profundidade e largura típicas:

- Loop de monitoramento: O(t × (n + h))
- Geração de seletor: O(h × c)
- Frontend com `m` logs acumulados: O(m²)

**Complexidade global no caso médio: O(t × (n + h) + m²)**

---

### Pior Caso — O(∞)

O pior caso ocorre quando o elemento monitorado **nunca muda de valor**. O loop `while (true)` em `monitorElementAsync` nunca termina:

- `monitorElementAsync()`: O(∞)
- Logs no frontend crescem indefinidamente: memória → O(∞)

**Complexidade global no pior caso: O(∞)**

> Na prática, o timeout do navegador ou encerramento manual da requisição HTTP delimita a execução. Entretanto, do ponto de vista algorítmico formal, não há garantia de terminação.

---

## Conclusão

O algoritmo central desta aplicação é o **loop de polling contínuo** implementado em `monitorElementAsync`. Sua complexidade é **não determinística** pois depende de um evento externo (mudança no DOM de uma página web). As demais operações — traversal de DOM, geração de seletor CSS, validação de URL — são determinísticas e eficientes.

Os pontos de atenção de complexidade são:

1. **O(t × (n + h))** — o loop de polling é o gargalo principal; cresce linearmente com o número de verificações necessárias
2. **O(h²)** — a concatenação de strings no loop de `getSelectorTree` é quadrática na profundidade do DOM
3. **O(m²) acumulado** — o padrão de spread no frontend torna-se custoso em sessões longas de monitoramento
4. **O(b)** — a busca por botões em `submitTrackingAsync` retorna todos os botões da página quando apenas o primeiro é necessário
