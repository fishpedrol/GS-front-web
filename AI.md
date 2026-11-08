# Uso de Inteligência Artificial

Documentação do uso de IA na aplicação web (Front-end Design e Web Development), como pede o edital (p. 41 e 60). Este arquivo é atualizado a cada etapa do desenvolvimento, com o que aconteceu de verdade.

## 1. Ferramentas utilizadas

| Ferramenta | Para quê |
|---|---|
| **Claude Code** (Anthropic, modelo Claude Opus 5.5), no terminal do PC do Felipe | ler o edital e o documento de contexto do grupo; organizar a documentação do projeto; gerar a estrutura do projeto React; escrever código e testes, sempre revisados pelo Felipe |

Os commits são feitos pela conta do GitHub do Felipe Pedrol, que revisa cada etapa antes. O que a IA fez em cada etapa está registrado abaixo, na seção 2.

## 2. Interações realizadas

### 08/11/2026 — A documentação e o plano

- **Pedido (resumo):** ler o edital e o documento de contexto do grupo, montar a documentação de trabalho da parte web e dizer se ela depende de outra parte para começar.
- **Resposta (resumo):** a IA leu o `CONTEXTO_PROJETO_GS_CITIZENTECH.md` e as páginas do edital da web (p. 40–42 e 59–61) e montou a pasta `docs/`: o plano em fatias (W1 a W8), a arquitetura, a tabela de regras e números, as dependências com as outras partes do grupo, as perguntas abertas e o checklist das entregas. A conclusão foi que a parte web pode começar sem esperar ninguém; só a prova ponta a ponta da sala S01 depende do circuito do Wokwi (Edge).
- **Decisões do Felipe sobre as perguntas da IA:** criar o repositório, nós criarmos o Supabase, a IA fazer cada etapa e explicar no fim.

### 08/11/2026 — A base do projeto (fatia W1)

- **Pedido (resumo):** criar o repositório e a base do projeto, com as escolhas de planejamento já respondidas (o Supabase criado pela parte web e o modo de trabalho).
- **Resposta (resumo):** a IA criou o git, gerou o projeto com o `create-vite` (React, JavaScript, sem TypeScript), configurou o Tailwind CSS e o Vitest, criou as pastas das camadas e o `.env.example`, e escreveu este `AI.md` e o `README.md` com a Ficha CitizenTech.

## 3. Aplicação no projeto

| Etapa | O que a IA gerou ou sugeriu | O que o grupo mudou |
|---|---|---|
| Docs (08/11) | toda a pasta `docs/`, o `CLAUDE.md`, o `AGENTS.md` e o `PRODUCT.md` | o Felipe respondeu as perguntas WP.1 a WP.8 (`docs/DECISIONS.md`) |
| W1 (08/11) | `web/` (estrutura do Vite), `vite.config.js` com Tailwind e Vitest, a página provisória `App.jsx`, `services/configuracao.js` e os testes dele, `.env.example`, `README.md` | — |

## 4. Validação das respostas

- **Docs:** cada regra dos docs aponta a seção do CONTEXTO ou a página do edital de onde saiu, para conferir. O texto do edital foi extraído do PDF com `pdftotext`, e as páginas da web foram lidas inteiras.
- **W1:** `npm run build` sem erro; `npm test` com 8 testes passando (`services/configuracao.test.js`: o modo mock, o modo Supabase, a falta de variáveis e a recusa da chave secreta); `npm run lint` sem avisos; as classes do Tailwind conferidas no CSS gerado. A saída de cada comando está em `docs/IMPLEMENTATION_STATUS.md`.

## 5. Análise crítica

> **A escrever pelo grupo antes da entrega**, com as próprias palavras: os benefícios, as limitações e as dificuldades de usar a IA neste projeto.

Pontos já observados, para ajudar:

- A IA acelerou a organização: transformou um documento de contexto longo num plano por etapas, com o que depende de quem.
- A IA precisou ser orientada a **não inventar** dados, links ou testes. O projeto usa dados simulados e fictícios, e tudo é rotulado como tal.
- Todo código gerado precisa ser entendido e explicado por quem entrega (edital, p. 22). Por isso, cada etapa termina com a explicação do que foi feito.
