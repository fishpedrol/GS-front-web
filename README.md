# Salas de Estudo — CitizenTech (nome de trabalho)

Global Solution 2026.2 · FIAP · Engenharia de Software, 1º ano · Front-end Design e Web Development

## Ficha CitizenTech

| Campo | Definição |
|---|---|
| **Nome da solução** | A definir. Nome de trabalho: *Monitoramento Inteligente de Salas de Estudo*. |
| **Cidade e bairro** | São Paulo/SP; o campus/bairro da FIAP para a observação ainda a identificar. |
| **Cidadão beneficiado** | Estudantes universitários que querem escolher um ambiente adequado para estudar, trabalhar em grupo ou gravar vídeos/projetos. |
| **Problema em uma frase** | Estudantes têm dificuldade para identificar, antes de se deslocar, salas com espaço e condições adequadas de ruído, temperatura e luminosidade para suas atividades. |
| **Como funciona** | Um ESP32 **simulado** no Wokwi monitora uma sala-modelo e envia as leituras ao Supabase pela API; esta aplicação React mostra nove salas (uma com os dados da simulação e oito com dados fictícios fixos), aplica filtros e rankings e permite criar listas e favoritos no navegador. |
| **O que cada parte faz** | **Edge:** leitura simulada e decisão local (LEDs); **Supabase:** guarda a última leitura da sala IoT; **React/Web:** exibição, filtros, rankings e CRUD local de listas; **Python:** simulação independente em terminal; **Matemática:** modelagem da ocupação; **UX:** requisitos e experiência; **Storytelling:** comunicação do valor. |
| **Repositório** | https://github.com/fishpedrol/GS-front-web (privado) |
| **Indicador de impacto** | Proposto, ainda **não medido**: redução do tempo para encontrar uma sala adequada; complementarmente, a proporção de escolhas bem-sucedidas e a satisfação com a recomendação. |
| **ODS conectados** | **ODS 4 — Educação de Qualidade** (principal: melhores condições para estudar); **ODS 9 — Indústria, Inovação e Infraestrutura** (apoio: IoT aplicada à infraestrutura do campus); possivelmente **ODS 11 — Cidades e Comunidades Sustentáveis** (uso eficiente de espaços coletivos). |

### Equipe

| Integrante | RM | Responsabilidade |
|---|---|---|
| Daniel Roberto | 571746 | A definir |
| Felipe Pedrol | 569631 | Front-end Design e Web Development |
| Jecky Cossio | 572226 | A definir |
| Felipi Godoy | 573741 | A definir |

## Sobre a aplicação

O estudante entra com uma matrícula e senha **fictícias** (login só demonstrativo, sem cadastro), vê as nove salas numa página só, com a ocupação total e por mesa, as mesas totalmente livres, a temperatura, a luminosidade e o ruído, e usa os atalhos *Estudar sozinho*, *Trabalho em grupo* e *Gravar vídeo/projeto* para ver o ranking das salas. Favoritos e listas ficam **só no `localStorage` do navegador**.

**O que é real e o que é simulado:** a S01 recebe dados de um circuito **simulado** no Wokwi (os botões representam entradas e saídas, o potenciômetro gera dB **simulados**); as salas S02 a S09 são **fictícias e fixas**. Nada aqui é medição física de uma sala real.

## Estado

Em desenvolvimento. Pronta a base do projeto (React + Vite + Tailwind + Vitest, as camadas e a configuração do ambiente); o painel das salas, os filtros, os favoritos e listas e a leitura da S01 pela API vêm nas próximas etapas.

## Pré-requisitos

- Node.js 20.19 ou mais novo (ou 22.12+), com o npm. Testado com o Node 24.19.0 e o npm 11.17.0.
- Git.

## Instalação e execução

```bash
git clone https://github.com/fishpedrol/GS-front-web.git
cd GS-front-web/web
npm install
cp .env.example .env.local   # opcional: sem ele, a S01 usa a leitura de demonstração (mock)
npm run dev                  # abre em http://localhost:5173
```

| Comando (em `web/`) | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm test` | os testes (Vitest) |
| `npm run build` | o build de produção em `web/dist/` |
| `npm run lint` | o lint (oxlint) |
| `npm run preview` | serve o build de produção |

### Variáveis de ambiente (`web/.env.local`)

| Variável | Para quê |
|---|---|
| `VITE_TELEMETRIA_MODO` | `mock` (padrão) ou `supabase` |
| `VITE_SUPABASE_URL` | a URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | a chave **publicável** do Supabase (a aplicação recusa uma chave secreta) |

## Estrutura

```text
├── README.md          esta ficha e as instruções
├── AI.md              como a IA foi usada no projeto
├── CONTEXTO_PROJETO_GS_CITIZENTECH.md   a especificação comum do grupo
└── web/               a aplicação React + Vite + Tailwind
    └── src/
        ├── components/   apresentação
        ├── hooks/        estado (custom hooks)
        ├── domain/       regras de negócio puras
        ├── services/     acesso a dados (Supabase e localStorage)
        └── data/         as salas fictícias
```

## Limitações assumidas

- O login é **fictício** e só visual; não protege nada.
- Listas e favoritos ficam no navegador: outro navegador ou perfil não os vê, e limpar os dados do site os apaga.
- A chave publicável do Supabase fica no navegador (é o modelo do Supabase); a permissão da tabela é restrita à telemetria simulada da S01.
- Os limiares de conforto (temperatura, luz, ruído, ocupação) ainda são provisórios, até o grupo aprovar a tabela.
