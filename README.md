# Projeto 1 - Análise de Algoritmos

Repositório dedicado ao projeto 1 de Análise de Algoritmos

## Sobre o Projeto

O projeto consiste em uma aplicação que monitora, a partir do clique do usuário, alguma informação que está presente na tela.

Caso a informação mude de alguma forma, ex:

```
Valor inicial: R$57,00

Valor alterado: R$58,03
```

Ele vai trazer essa informação antiga e alterada, abrirá uma nova guia em um site, colocará essas informações e apertará o botão de envio.

Após isso, a aplicação termina sua requisição.

### Backend

No backend, está presente toda a lógica que faz esse monitoramento acontecer, abrindo o browser, navegando nele, monitorando e após tudo, fechando-o

### Frontend

O frontend é responsável por trazer uma visualização amigável ao usuário para utilizar a aplicação e ver seus monitoramentos feitos.

## Como Rodar o Projeto

Para rodar o projeto, você precisa do [Node24](https://nodejs.org/en/blog/release/v24.14.0) baixado na sua máquina.

Com isso, basta clonar o repositório:

```bash
git clone "https://github.com/gustavo-m-xavier/a-algo-projeto1.git"
```

### Backend

Para rodar o backend, você deve seguir os seguintes comandos:

```bash
cd backend

// baixando dependências
npm install

// rodando o projeto
npx ts-node src/index.ts
```

Se tudo tiver ocorrido bem, aparecerá a seguinte mensagem:

```bash
Servidor rodando em: http://localhost:3000
```

### Frontend

Em outro terminal você deve rodar o frontend e seguir os seguintes comandos:

```bash
cd frontend

// baixando dependências
npm install

// rodando o projeto
npm run dev
```

Se tudo tiver ocorrido bem, aparecerá a seguinte mensagem:

```bash
> frontend@0.0.0 dev
> vite

5:53:02 PM [vite] (client) Re-optimizing dependencies because lockfile has changed

  VITE v8.0.3  ready in 316 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```
