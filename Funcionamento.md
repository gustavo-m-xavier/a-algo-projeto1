# 📌 Documentação de Funcionamento - Monitor de Mudança com Puppeteer

## 📖 Visão Geral

Este sistema permite monitorar alterações em um elemento específico de uma página web.  
O usuário informa uma URL, seleciona manualmente um elemento na página e o sistema detecta mudanças nesse elemento.

---

## ⚙️ Fluxo de Funcionamento

### 1. Entrada de URL
- O usuário insere a URL da página que deseja monitorar.
- Essa URL será utilizada para iniciar o processo de monitoramento.

---

### 2. Envio da Requisição
- Após informar a URL, o sistema envia uma requisição HTTP do tipo **POST** para:
  
  http://localhost:3000/monitor
  
- A URL fornecida é enviada no corpo da requisição.

---

### 3. Inicialização do Puppeteer
- O sistema inicia o navegador utilizando o **Puppeteer**.
- O navegador é aberto no modo **não-headless**, ou seja, visível para o usuário.

---

### 4. Acesso à Página
- O navegador navega automaticamente até a URL informada pelo usuário.

---

### 5. Seleção do Elemento
- O usuário deve:
1. Clicar no botão **"Monitorar click"**
2. Em seguida, clicar no elemento da página que deseja monitorar

- O sistema registra esse elemento como alvo de monitoramento.

---

### 6. Monitoramento de Alterações
- O sistema começa a observar o elemento selecionado.
- Ele verifica continuamente se houve alguma mudança no conteúdo do elemento.

---

### 7. Detecção de Mudança
- Quando uma alteração é detectada:
- O sistema captura o novo valor do elemento
- Finaliza o processo de monitoramento

---

### 8. Encerramento
- O navegador é automaticamente fechado após a detecção da mudança.

---

### 9. Exibição do Resultado
- O valor atualizado do elemento monitorado é exibido no campo **"resultado"** da aplicação.

---

## 🧠 Resumo do Processo

1. Usuário insere URL  
2. Sistema envia requisição POST  
3. Puppeteer abre navegador (visível)  
4. Página é carregada  
5. Usuário seleciona elemento  
6. Sistema monitora mudanças  
7. Alteração detectada  
8. Navegador é fechado  
9. Resultado exibido  

---

## 🚀 Observações

- O monitoramento depende da interação do usuário para seleção do elemento.
- O navegador precisa permanecer aberto até que uma mudança seja detectada.
- O sistema é ideal para acompanhar alterações dinâmicas em páginas web.

---