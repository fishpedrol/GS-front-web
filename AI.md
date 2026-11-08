# Uso de Inteligência Artificial

Documentação do uso de IA na aplicação web (Front-end Design e Web Development), como pede o edital (p. 41 e 60). Este arquivo é atualizado a cada etapa do desenvolvimento, com o que aconteceu de verdade.

## 1. Ferramentas utilizadas

| Ferramenta | Para quê |
|---|---|
| **Claude Code** (Anthropic, modelo Claude Opus 5.5), no terminal do PC do Felipe | ler o edital e o documento de contexto do grupo e organizar o planejamento; configurar a base do projeto; a partir da etapa W2, **explicar, revisar e tirar dúvidas**, com o código da aplicação escrito pelo Felipe |

Os documentos de planejamento que a IA ajudou a escrever (o plano por etapas, a arquitetura, as dependências com o grupo) ficam no computador do Felipe, fora do repositório.

## 2. Interações realizadas

### 08/11/2026 — O planejamento

- **Pedido (resumo):** ler o edital e o documento de contexto do grupo, montar a documentação de trabalho da parte web e dizer se ela depende de outra parte para começar.
- **Resposta (resumo):** a IA leu o `CONTEXTO_PROJETO_GS_CITIZENTECH.md` e as páginas do edital da web (p. 40–42 e 59–61) e montou o planejamento: as etapas W1 a W8, a arquitetura em camadas, a tabela de regras e números, o que depende de quem no grupo e o checklist das entregas. A conclusão foi que a parte web pode começar sem esperar ninguém; só a prova ponta a ponta da sala S01 depende do circuito do Wokwi (Edge).

### 08/11/2026 — A base do projeto (etapa W1)

- **Pedido (resumo):** criar o repositório e a base do projeto, com as escolhas de planejamento já respondidas (o Supabase criado pela parte web e o modo de trabalho).
- **Resposta (resumo):** a IA rodou o `create-vite` (o gerador oficial do Vite, template React em JavaScript), instalou e configurou o Tailwind CSS e o Vitest, criou as pastas das camadas e o `.env.example`, escreveu o `services/configuracao.js` com os testes e o `README.md` com a Ficha CitizenTech.

### 08/11/2026 — A mudança no modo de trabalho

- **Combinado:** a partir da etapa W2, o Felipe escreve o código da aplicação (as regras do `domain/`, os hooks e os componentes). A IA explica o que fazer, revisa o que ele escreveu, aponta erros e responde dúvidas.

## 3. Aplicação no projeto

| Etapa | O que a IA gerou ou sugeriu | O que o Felipe fez |
|---|---|---|
| Planejamento (08/11) | o plano por etapas, a arquitetura e as perguntas de decisão | decidiu as perguntas: o repositório, o Supabase criado pelo grupo, o modo de trabalho |
| W1 (08/11) | a configuração do Vite com Tailwind e Vitest, a página provisória `App.jsx`, o `services/configuracao.js` e os testes dele, o `.env.example`, o `README.md` | revisou e aprovou |

## 4. Validação das respostas

- **Planejamento:** cada regra aponta a seção do documento de contexto ou a página do edital de onde saiu, para conferir. O texto do edital foi extraído do PDF, e as páginas da web foram lidas inteiras.
- **W1 (08/11):** `npm run build` sem erro; `npm test` com 8 testes passando (`services/configuracao.test.js`: o modo mock, o modo Supabase, a falta de variáveis e a recusa da chave secreta); `npm run lint` sem avisos; as classes do Tailwind conferidas no CSS gerado; o servidor de desenvolvimento servindo a página.

## 5. Análise crítica

> **A escrever pelo grupo antes da entrega**, com as próprias palavras: os benefícios, as limitações e as dificuldades de usar a IA neste projeto.

Pontos já observados, para ajudar:

- A IA acelerou a organização: transformou um documento de contexto longo num plano por etapas, com o que depende de quem.
- A IA precisou ser orientada a **não inventar** dados, links ou testes. O projeto usa dados simulados e fictícios, e tudo é rotulado como tal.
- Usar a IA para revisar e explicar, em vez de gerar tudo, ajuda a entender o código que vai ser apresentado (edital, p. 22).
