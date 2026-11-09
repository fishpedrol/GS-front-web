# Plano da aplicação web (Front-end Design + Web Development)

Escrito em 08/11/2026 a partir do CONTEXTO (§3, §6, §7, §8, §11) e do edital (p. 40–42 e 59–61). É a mesma aplicação para as duas disciplinas, com **duas entregas separadas** no Teams (p. 42 e 61). Cada fatia termina com: os testes passando, a evidência no IMPLEMENTATION_STATUS.md, a anotação no `AI.md`, os docs atualizados e o commit com o push.

## Como os requisitos do edital ficam cobertos

| Exigência (p. 42 e 61) | Onde | Fatia |
|---|---|---|
| React com Vite | `web/` | W1 |
| Tailwind CSS | `web/` | W1 |
| No mínimo 8 componentes reutilizáveis | `components/` (lista no TECHNICAL_ARCHITECTURE.md, §4) | W3 a W5 |
| `useState` e `useEffect` | os hooks e o `App` | W3 a W6 |
| No mínimo 2 custom hooks | `useRoomReadings`, `useLocalCollections` (e `useRoomFilters`, `useAuthDemo`) | W4 a W6 |
| Lógica e dados separados da apresentação | `domain/`, `services/`, `data/` sem JSX | W2 em diante |
| API externa | Supabase REST, leitura da S01 | W6 |
| CRUD (criação, consulta, atualização, exclusão) | listas e favoritos no `localStorage`, pela orientação docente relatada (CONTEXTO, §3.3) | W4 |
| Funcionalidade real, não tela estática | filtros, ranking, CRUD, polling | W4 a W6 |
| Git, 15+ commits significativos | um commit por fatia ou sub-fatia | todas |
| README (descrição, pré-requisitos, instalação, execução) com a Ficha no topo (p. 21) | `README.md` | W1 e W8 |
| `AI.md` na raiz, com uso real (p. 41 e 60) | `AI.md` | todas |
| Deploy (pedido em Front-end, p. 42) | Vercel | W1 e W8 |
| Repositório privado, acesso de escrita aos professores, ZIP | GitHub e Teams | W8 |

## W1. A base

- `git init` na raiz (ou o clone do repositório); `.gitignore` com `node_modules`, `dist`, `.env`.
- `web/` com `npm create vite@latest` (template React, **JavaScript**), Tailwind, o lint (oxlint, que veio no template) e Vitest.
- As pastas `components/`, `hooks/`, `domain/`, `services/`, `data/`, cada uma com o seu papel (TECHNICAL_ARCHITECTURE.md, §2).
- `.env.example` com `VITE_TELEMETRIA_MODO=mock`, `VITE_SUPABASE_URL=` e `VITE_SUPABASE_PUBLISHABLE_KEY=`.
- O `README.md` da raiz começando pela Ficha CitizenTech (os campos do CONTEXTO, §1; o que não foi decidido fica "A definir").
- O `AI.md` com as cinco seções do edital (ferramentas, interações, aplicação, validação, análise crítica) e a primeira entrada: esta sessão.
- O primeiro deploy na Vercel.

**Pronta quando:** `npm run dev` abre a página, `npm run build` e `npm test` passam, e o deploy abre (se houver).

## W2. O domínio

- `data/salas.js`: as nove salas (CONTEXTO, §4.1) e os seeds S02–S09 (§7.6), com `origem: 'demo'`; a S01 sem valores fixos (§7.6, fim).
- `domain/ocupacao.js`: total, capacidade, vagas, mesas totalmente vazias, taxa (§4.2), com as regras RN-01 a RN-06.
- `domain/limiares.js` e `domain/classificacao.js`: faixa (baixo/médio/alto) e severidade (adequado/atenção/crítico) **separadas** (§5.2), com os valores provisórios do REGRAS_E_LIMIARES.md; o estado geral pela regra dos LEDs (RN-08).
- `domain/normalizar.js`: a linha da `room_telemetry` vira a sala normalizada (TECHNICAL_ARCHITECTURE.md, §3), com a validação de mesa fora de 0..3 e de leitura ausente.
- Testes Vitest de tudo, com o exemplo `[1,1,1]` → 3 ocupados, 6 vagas, 0 mesas vazias (§4.2).
- Exportar `salas.json` para o grupo (DEPENDENCIAS.md, "O que os outros precisam").

**Pronta quando:** os testes do domínio passam e nenhum arquivo do `domain/` importa React.

## W3. O painel

- `LoginForm` + `useAuthDemo`: a matrícula e a senha fictícias (REGRAS_E_LIMIARES.md, §5), erro claro, sessão no `sessionStorage`, "Sair". O texto diz que é demonstrativo (RN-13).
- `DashboardHeader`, `RoomGrid`, `RoomCard`, `RoomOccupancy` (as mesas como 3 lugares cada), `EnvironmentalMetric` (valor, unidade, faixa e severidade, com ícone ou texto além da cor), `DataSourceBadge` ("IoT simulado" / "Dados demonstrativos") e `DataFreshnessBadge`.
- Antes de codar: `/impeccable shape` com o PRODUCT.md e o protótipo do UX, se já houver (D5).

**Pronta quando:** as nove salas aparecem com todas as métricas no card, sem clicar (RF-02 a RF-04, RF-06), no celular e no desktop.

## W4. Os favoritos e as listas (o CRUD)

- `services/colecoesLocais.js`: ler, gravar, migrar `schema_version`, tratar JSON corrompido ou ausente (CONTEXTO, §7.7).
- `useLocalCollections`: favoritar/desfavoritar, criar, listar, renomear, excluir (com confirmação), adicionar e remover sala, sem duplicar, ignorando sala inexistente.
- `FavoriteButton`, `ListManager`, `ListPicker` (adicionar a sala a uma lista a partir do card).

**Pronta quando:** T-14, T-15 e T-16 passam (RF-09 a RF-12), com os testes do serviço no Vitest.

## W5. Os filtros e os atalhos

- `domain/filtros.js`: intervalos **inclusivos** de ocupação, temperatura, luz e ruído; "ao menos uma mesa totalmente vazia" (RN-14).
- `domain/ranking.js`: elimina quem não serve e dá um score 0–100 determinístico por atalho, com o desempate (REGRAS_E_LIMIARES.md, §4). Grupo **exige** mesa com ocupação 0 (RN-06). A S01 desatualizada leva aviso no ranking.
- `useRoomFilters`, `FilterPanel`, `ActivityPresets`, `RoomRanking` (a posição e o "por quê" de cada sala), o contador de resultados, o estado vazio e o "Limpar filtros".

**Pronta quando:** T-11, T-12 e T-13 passam (RF-07, RF-08, RF-14), com os testes do domínio.

## W6. A S01 pela API

- `services/telemetria.js`: a mesma função `buscarLeituraS01()` com dois modos: `mock` (uma leitura que muda, rotulada "demonstração") e `supabase` (`fetch` no REST, só `GET`).
- `useRoomReadings`: polling pelo intervalo do REGRAS_E_LIMIARES.md, "carregando", erro sem quebrar a tela, a última leitura com a hora e o "Desatualizado" depois do limite (RF-05, RF-13, RNF-05, RNF-07).
- No Supabase: a tabela, a linha S01, a RLS de leitura e a de atualização só daquela linha; testar com `curl` escrevendo à mão e vendo o card mudar.
- Com o Edge publicando: a prova T-09 e T-10, com print e hora no IMPLEMENTATION_STATUS.md.

**Pronta quando:** o card da S01 muda sem recarregar quando a linha muda, e mostra "Desatualizado" quando para.

## W7. O acabamento

- `/impeccable audit` e `/impeccable polish`: contraste, foco visível, teclado, rótulos, 360 px, estado não só por cor (RNF-01, RNF-02, T-17).
- O nome e as cores do grupo (D6), se já houver.

## W8. A entrega

- Os testes T-11 a T-18 executados e registrados com evidência.
- O README final (descrição, pré-requisitos, instalação, execução, variáveis, limitações, links reais) e o `AI.md` final.
- O deploy final; o acesso de escrita dos professores conferido; o ZIP sem `node_modules` e sem `.env`.
- **Duas entregas** no Teams: Front-end Design (link do repositório, ZIP, README, link do deploy, `AI.md`) e Web Development (os mesmos; o deploy também, se o professor aceitar; CONTEXTO, §9.7). Checklist em [ENTREGAS_WEB.md](ENTREGAS_WEB.md).
