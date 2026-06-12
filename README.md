# Dashboard Financeira

Projeto desenvolvido para fins de estudo e portfólio, com foco em aplicar conceitos de Clean Architecture no front-end usando React e Next.js.

A ideia geral é construir uma dashboard financeira onde o usuário consiga cadastrar receitas e despesas, organizando os lançamentos por cartão de crédito ou diretamente pela conta. O objetivo é exercitar uma separação clara entre regras de negócio, casos de uso, portas de acesso a dados e a camada de interface.

## Status do Projeto

O projeto ainda está em desenvolvimento e não representa uma versão final. Algumas funcionalidades já fazem parte da proposta inicial, enquanto outras ainda serão adicionadas conforme a evolução dos estudos.

Funcionalidades planejadas:

- Criação e gerenciamento de diferentes contas.
- Melhorias no fluxo de receitas e despesas.

## Tecnologias

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI](https://mui.com/)
- [Dexie.js](https://dexie.org/)
- [Jest](https://jestjs.io/)

## Como Baixar e Executar

Antes de começar, é necessário ter o [Node.js](https://nodejs.org/) instalado na máquina.

Clone o repositório:

```bash
git clone https://github.com/PedroHSSodre/financial_dashboard
```

Acesse a pasta do projeto:

```bash
cd dashboard
```

Instale as dependências:

```bash
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3001](http://localhost:3001) no navegador para visualizar a aplicação.

## Como Executar com Docker

Antes de começar, é necessário ter o [Docker](https://www.docker.com/) instalado na máquina.

Construa a imagem:

```bash
docker build -t dashboard .
```

Execute o container:

```bash
docker run --rm -p 3001:3001 dashboard  
```

Também é possível executar com Docker Compose:

```bash
docker compose up --build
```

Abra [http://localhost:3001](http://localhost:3001) no navegador para visualizar a aplicação.

## Scripts Disponíveis

```bash
npm run dev
```

Inicia o servidor de desenvolvimento.

```bash
npm run build
```

Gera a versão de produção da aplicação.

```bash
npm run start
```

Executa a versão de produção após o build.

```bash
npm run test
```

Executa os testes automatizados.

```bash
npm run lint
```

Executa a análise de lint do projeto.

## Objetivo de Estudo

Este projeto é uma forma prática de aprofundar conhecimentos em arquitetura de software aplicada ao front-end, principalmente na organização de responsabilidades, desacoplamento entre camadas e criação de uma base mais fácil de testar e evoluir.
