# Status da implementação (parte web)

Atualizado em 08/11/2026. Ambiente: PC do Felipe, Windows 11 Pro, Node 24.19.0, npm 11.17.0, git 2.53.0, gh 2.100.0, Git Bash e PowerShell 5.1.

**Regra:** uma linha só vira "feito" com evidência: a data, o comando exato e a saída real (ou o print, com o nome do arquivo e a hora). "Escrevi o código" não é evidência. O que foi conferido só lendo o código diz "só por leitura do código".

## Implementado

| Área | Situação |
|---|---|
| Docs do projeto (este sistema) | feito (08/11/2026) |
| W1. A base (git, Vite, Tailwind, Vitest, README, `AI.md`) | **feito** (08/11/2026; evidência abaixo) |
| W1. O deploy na Vercel | **não feito**: espera o Felipe entrar na Vercel com a conta dele e importar o repositório |
| W2. O domínio (salas, ocupação, limiares provisórios, classificação, data da leitura, normalização) | **feito** (08/11/2026; evidência abaixo). Os limiares são **provisórios** até o grupo aprovar (D3, D4). Commit e push: não feitos nesta etapa (ela não rodou git) |
| W2. O `salas_para_o_grupo.json` e a proposta dos limiares para o grupo | **feito** (08/11/2026: `docs/salas_para_o_grupo.json` e `docs/PROPOSTA_LIMIARES_GRUPO.md`); **falta o Felipe mandar** ao grupo |
| W3. O painel (login fictício, nove cards, selos) | **feito** (08/11/2026; evidência abaixo): `TelaLogin`, `pages/PaginaPainel`, `QuadroSalas`/`LinhaSala` e os componentes das leituras, da situação, da origem e das mesas. Design pela skill `impeccable` (painel de embarque), revisado por um revisor independente: disposição final **ship** (8 correções e 3 regressões resolvidas). Commits `170afb6` a `7b89156` |
| W4. Favoritos e listas (CRUD no `localStorage`) | **feito, lógica e telas** (08/11/2026): `domain/colecoes.js`, `services/colecoesLocais.js`, `hooks/useColecoes.js`, `BotaoFavorito`, `SeletorListas`, `PainelListas`. T-14 a T-16 ainda **não executados à mão** (só pelos testes automáticos e pelo roteiro de print, que cria uma lista e favorita a S07) |
| W5. Filtros, atalhos e ranking | **feito, lógica e telas** (08/11/2026): `domain/filtros.js`, `domain/ranking.js`, `hooks/useFiltros.js`, `SeletorAtividade`, `PainelFiltros`, `EstadoVazio`. Pesos **provisórios**. T-11 a T-13 ainda não executados à mão |
| W6. A S01 pela API (mock, Supabase, polling, desatualizado) | **modo de simulação local: feito** (08/11/2026): `services/telemetria.js`, `hooks/useSalas.js`, o `SeloOrigem` com "Atualizado às" e "Desatualizado". O modo Supabase está escrito e testado com um fetch falso, mas **não foi ligado a um Supabase de verdade** (espera o Felipe criar o projeto, D1) |
| W6. A prova ponta a ponta Wokwi → Supabase → React (T-09, T-10) | não começado; depende do Edge (DEPENDENCIAS.md, D2) |
| W7. Acabamento e acessibilidade | **em parte** (08/11/2026): as 2 rodadas de print (1440, 1366×768 e 390), o detector do impeccable sem achados, o revisor final (ship), o `DESIGN.md` (fora do git) e o contraste calculado (o pior caso, tinta-3 sobre placa-alta, dá 5,16:1). Falta: o teste à mão de teclado e leitor de tela (T-17) e o nome do grupo (D6) |
| W8. Entrega | não começado |

## Os testes do CONTEXTO, §11 (os da web)

| ID | Cenário | Situação |
|---|---|---|
| T-09 | Alterar o Wokwi e ver o Supabase e o React mudarem sem reload | não executado |
| T-10 | Parar o Wokwi e ver a última leitura com a hora e "Desatualizado" | não executado |
| T-11 | Filtro de ocupação 3..6 | não executado na tela; a regra tem teste unitário (`filtros.test.js`: 3 a 6 → S03, S04, S05, S06, S08) |
| T-12 | Atalho "Trabalho em grupo" sem sala sem mesa vazia | não executado na tela; a regra tem teste unitário (`ranking.test.js`: S03, S04, S06 e S09 saem com "Nenhuma mesa totalmente livre") |
| T-13 | Filtrar e limpar; as nove voltam | não executado na tela; sem filtro as nove passam (`filtros.test.js`); o `limparFiltros` do `useFiltros` só foi conferido fora do projeto |
| T-14 | Criar, renomear, consultar e excluir lista | não executado na tela; as regras têm teste unitário (`colecoes.test.js`) |
| T-15 | Outro navegador/perfil não vê as listas | não executado (é do navegador: o `localStorage` de cada perfil é separado) |
| T-16 | Adicionar/remover sala e favoritar, sem duplicar, depois do reload | não executado na tela; "não duplica" tem teste unitário (`colecoes.test.js`), e gravar e ler de volta também (`colecoesLocais.test.js`) |
| T-17 | Celular e teclado | não executado |
| T-18 | Clonar o ZIP/repositório e seguir o README | não executado |

## O registro das evidências

(Data · fatia · comando · saída.)

### 08/11/2026 · W1 · a base

- `npm create vite@latest web -- --template react --no-interactive` → `create-vite v9.3.4`, "Scaffolding project in C:\Users\Cliente\Documents\GS\web... Done."
- `npm ls --depth=0` (em `web/`) → `react@19.3.1`, `react-dom@19.3.1`, `vite@8.3.6`, `@vitejs/plugin-react@6.2.1`, `tailwindcss@4.3.5`, `@tailwindcss/vite@4.3.5`, `vitest@5.1.0`, `oxlint@1.92.0`; `npm install` → "found 0 vulnerabilities".
- `npm run build` → `dist/index.html 0.48 kB`, `dist/assets/index-*.css 7.93 kB`, `dist/assets/index-*.js 220.16 kB`, "✓ built in 87ms".
- `grep -o 'min-h-screen\|bg-slate-50\|text-3xl' dist/assets/*.css` → as três classes do `App.jsx` estão no CSS gerado (o Tailwind compila).
- `npm test` → "Test Files 1 passed (1) · Tests 8 passed (8)" (`src/services/configuracao.test.js`).
- `npm run lint; echo $?` → nenhum aviso, saída 0.
- `npx vite --port 5179 --strictPort` + `curl http://localhost:5179/` → `<html lang="pt-BR">`, `<title>Salas de Estudo — CitizenTech</title>`; o `/src/App.jsx` servido contém "Salas de Estudo" e o `/src/index.css` servido contém `min-h-screen` (o Tailwind no modo dev). Servidor parado depois. **A página não foi vista num navegador** (sem print).
- `git push -u origin main` → `* [new branch] main -> main` em `https://github.com/fishpedrol/GS-front-web.git`; `gh repo view fishpedrol/GS-front-web --json visibility` → `PRIVATE`.

### 08/11/2026 · W2 · o domínio

Comandos rodados às 02:05 em `C:/Users/Cliente/Documents/GS/web`, no Git Bash, depois da revisão e da correção da W2.

- `cd "C:/Users/Cliente/Documents/GS/web" && npm test` → "Test Files 7 passed (7) · Tests 318 passed (318)", "Start at 02:05:54", "Duration 395ms"; saída 0.
- `npx vitest run --reporter=json` (contagem por arquivo) → `services/configuracao.test.js` 8, `data/salas.test.js` 10, `domain/ocupacao.test.js` 39, `domain/limiares.test.js` 20, `domain/classificacao.test.js` 106, `domain/atualizacao.test.js` 32, `domain/normalizar.test.js` 103; "total 318 passed 318 failed 0".
- `npm run lint; echo $?` → `> oxlint`, nenhum aviso nem erro impresso, saída 0.
- `npm run build` → "vite v8.3.6", "✓ 16 modules transformed", `dist/index.html 0.48 kB`, `dist/assets/index-dLbvc9yo.css 7.93 kB`, `dist/assets/index-v983ped1.js 220.16 kB`, "✓ built in 164ms"; saída 0.
- `grep -nE "^import" src/domain/*.js src/data/*.js` (sem os `.test.js`) → só `classificacao.js` (importa `./limiares.js` e `./ocupacao.js`) e `normalizar.js` (importa `../data/salas.js`, `./atualizacao.js`, `./limiares.js` e `./ocupacao.js`). O `data/salas.js`, o `ocupacao.js`, o `limiares.js` e o `atualizacao.js` não importam nada.
- `grep` por `react`, `fetch`, `localStorage`, `sessionStorage` e `window` no `domain/` e no `data/` (sem os testes e sem as linhas de comentário) → nenhum uso.
- `node --input-type=module -e "... montarSalas(null) ... classificarSala ..."` → S01 `falha` (`sem_leitura`); S02 e S07 `verde`; S04, S05 e S08 `amarelo`; S03, S06 e S09 `vermelho`. O exemplo da S01 do CONTEXTO, §6.3 → `amarelo` (ruído 54, índice 48).
- `node --input-type=module -e "import { SALAS, LEITURAS_DEMO } from './src/data/salas.js'; ..."` → escreveu `docs/salas_para_o_grupo.json`; a conferência com `node -e "require(...)"` → "JSON valido; 9 salas; S01 leitura = null; aviso = Dados fictícios de demonstração; a S01 vem do Wokwi"; totais 9 salas, 27 mesas, 81 lugares.
- **Não conferido aqui:** a página no navegador (a W2 não muda a tela; o `App.jsx` continua o da W1) e o git (esta etapa não rodou commit nem push).

### 08/11/2026 · W4, W5 e W6 · a lógica das telas (modo mock)

Comandos rodados às 03:16 em `C:/Users/Cliente/Documents/GS/web`, no Git Bash, depois da revisão e da correção desta etapa. Os arquivos novos: `domain/filtros.js`, `domain/ranking.js`, `domain/colecoes.js`, `domain/sessao.js`, `domain/formatar.js`, `services/telemetria.js`, `services/colecoesLocais.js`, `services/sessaoDemo.js` (cada um com o `.test.js`) e `hooks/useSalas.js`, `hooks/useColecoes.js`, `hooks/useFiltros.js`, `hooks/useSessaoDemo.js`.

- `cd "C:/Users/Cliente/Documents/GS/web" && npm test` → `vitest run`, "RUN v5.1.0", "Test Files 15 passed (15) · Tests 649 passed (649)", "Start at 03:16:05", "Duration 605ms"; saída 0.
- `npx vitest run --reporter=json` (a contagem por arquivo; o relatório saiu em `web/.vitest/json/output.json`, apagado depois) → `data/salas` 10, `domain/atualizacao` 32, `domain/classificacao` 106, `domain/colecoes` 90, `domain/filtros` 62, `domain/formatar` 6, `domain/limiares` 20, `domain/normalizar` 103, `domain/ocupacao` 39, `domain/ranking` 79, `domain/sessao` 18, `services/colecoesLocais` 24, `services/configuracao` 8, `services/sessaoDemo` 10, `services/telemetria` 42; "total 649 passed 649 failed 0".
- `npm run lint; echo $?` → `> eslint .`, nenhum aviso nem erro impresso, saída 0. (O lint agora é o ESLint 10 com o `eslint-plugin-react-hooks` 7, `web/eslint.config.js`; não é mais o oxlint da W1.)
- `npm run build` → "vite v8.3.6 building client environment for production...", "✓ 62 modules transformed.", `dist/index.html 0.70 kB`, `dist/assets/index-DokcR1fU.css 34.88 kB │ gzip: 7.11 kB`, `dist/assets/index-DKDNqgsh.js 284.80 kB │ gzip: 87.60 kB`, 42 arquivos de fonte da Barlow (`.woff` e `.woff2`), "✓ built in 275ms"; saída 0.
- `grep` por `react`, `fetch`, `localStorage`, `sessionStorage`, `window` e `document` em cada arquivo do `domain/` (sem os testes e sem as linhas de comentário) → nenhum uso. O mesmo `grep` por `react`, `useState` e `useEffect` nos `services/` → nenhum uso.
- `grep -nE "^import"` nos arquivos novos → `filtros.js` e `ranking.js` importam só `./limiares.js`; `colecoes.js`, `sessao.js`, `formatar.js` e `sessaoDemo.js` não importam nada; `colecoesLocais.js` importa `../domain/colecoes.js`; `telemetria.js` importa `./configuracao.js`; os hooks importam `react` e o `domain/`, os `services/` e o `data/` (a seta `hooks → (services, domain) → data`).
- `node C:/Users/Cliente/AppData/Local/Temp/claude/494258152dc418cc/71d4408c-4b11-4486-87b2-8c06ce4a95da/scratchpad/exemplos_parte3.mjs` (roda o código de verdade; confere os exemplos da EXPLICACAO_CODIGO.md, Parte 3, e do REGRAS_E_LIMIARES.md, §4 e §5) →
  - ranking com a S01 sem leitura: sozinho `S07 98, S02 93, S04 73, S08 70, S05 67, S06 39, S09 22` (saem S01 e S03); grupo `S07 97, S02 74, S08 60, S05 56` (saem S01, S03, S04, S06, S09); vídeo `S07 98, S02 95, S04 73, S08 70, S05 68, S06 34` (saem S01, S03, S09);
  - com a linha do CONTEXTO, §6.3: a S01 em 3º nos três (73, 64, 73); desatualizada (60 s depois), `pontuacao: 58` e o primeiro motivo "Leitura desatualizada";
  - filtros: ocupação 3 a 6 → `S03,S04,S05,S06,S08` (T-11); mesa livre → `S02,S05,S07,S08`; ruído até 45 → `S02,S07`; `valorDoFiltro('luzMin', '1.000')` → `1000`, `('ruidoMax', '')` → `null`;
  - simulador: os 10 primeiros passos dão `verde, verde, amarelo, amarelo, vermelho, verde, amarelo, amarelo, verde, verde` (o 10º é o 1º de novo), sempre `origem: 'mock'`;
  - `buscarLeituraSupabase` com um `fetch` falso: a URL `https://abc.supabase.co/rest/v1/` vira `https://abc.supabase.co/rest/v1/room_telemetry?room_id=eq.S01&select=*`, com `apikey` e `Authorization: Bearer`, `cache: no-store`, `GET`; `[]` → `null`; HTTP 500 → "A API respondeu com erro (HTTP 500)."; sem rede → "Não foi possível falar com a API. Confira a internet e a URL do Supabase."; chave `sb_secret_abc` → o erro da chave secreta, sem pedido;
  - `conferirCredenciais(' rm000000 ', 'salas2026')` → `{ ok: true }`; `('RM000000', ' salas2026')` → "Matrícula ou senha incorreta. Use o acesso de demonstração."; `lerPreferencias` com `{quebrado` e com `{"schema_version":2}` → o vazio e o aviso "Não foi possível ler suas listas salvas; começamos do zero.".
- `npx vitest run --config C:/Users/Cliente/AppData/Local/Temp/claude/494258152dc418cc/71d4408c-4b11-4486-87b2-8c06ce4a95da/scratchpad/verificar/vitest.config.mjs --reporter=verbose` (os hooks de verdade com um React de mentira e o relógio falso; fora do projeto e fora do `npm test`) → "Test Files 1 passed (1) · Tests 14 passed (14)", "Start at 03:17:55"; saída 0. São 9 casos do `useSalas` (a primeira leitura no StrictMode é `[1,0,0]`; uma API de 6 s ainda responde; o pedido cancelado por demorar não avança a `ultimaBusca`; `[]` depois de uma linha mantém a linha e mostra o erro; 0 desenhos em 4,8 s parado; "Desatualizado" aos 30 s e fora no mesmo desenho da leitura nova; o "atualizar agora"; desmontar no meio de um pedido) e 5 do `useColecoes` (duas `criarLista` com o mesmo nome no mesmo clique, criar e renomear, "Criar e adicionar", duas abas, o texto quebrado mantido até a pessoa mexer).
- `npx vitest run --config C:/Users/Cliente/AppData/Local/Temp/claude/494258152dc418cc/71d4408c-4b11-4486-87b2-8c06ce4a95da/scratchpad/hooks/vitest.hooks.config.mjs --reporter=verbose` (a conferência anterior, do mesmo tipo) → "Tests 5 failed | 5 passed (10)". Passam: `useSalas` no mock, a chave secreta no `useSalas`, os 2 do `useSessaoDemo` e o do `useFiltros` (inclui o limpar). Os 5 que falham ficaram **velhos** depois das correções: um espera a mensagem antiga de 5 s ("A API demorou mais de 5 segundos..."), e os 4 do `useColecoes` param em "window.addEventListener is not a function" (o React de mentira dela não tem o `window` que o ouvinte do evento `storage` usa). Esses 5 casos não valem como evidência; o `useSalas` e o `useColecoes` estão cobertos pela conferência de cima.
- **Não conferido aqui:** as telas num navegador (estão em andamento); o modo `supabase` contra um projeto de verdade (só com `fetch` falso); T-09 a T-17 na tela; e o git (esta etapa não rodou commit nem push).


### 08/11/2026 · W3 (as telas) e a junção com a lógica

Comandos rodados às 03:30, em `C:/Users/Cliente/Documents/GS/web`, com as telas e a lógica juntas, depois das correções do revisor final.

- `npm test` → "Test Files 15 passed (15) · Tests 649 passed (649)".
- `npm run lint; echo $?` → ESLint sem nenhum aviso, saída 0.
- `npm run build` → "✓ built in 605ms".
- Para cada um dos 9 commits novos (`78d9594` a `7b89156`): `git checkout <sha> && npx vite build` → "build ok" nos 9.
- `impeccable detect --json web/src/components web/src/pages web/src/App.jsx web/src/index.css web/index.html` → `[]`.
- Os prints (puppeteer-core com o Chrome instalado, roteiro `capturar.mjs` e `celular.mjs` no scratchpad da sessão): `.impeccable/review/desktop-login.png`, `desktop.png`, `desktop-grupo.png`, `notebook-1366.png`, `mobile-login.png`, `cel-todas-*.png`, `cel-ativ-*.png`; o roteiro entra pelo "Preencher para mim", favorita a S07, escolhe "Trabalho em grupo", abre os filtros e cria a lista "Grupo de quinta"; "sem erros no console".
- O revisor final (`impeccable-finish-reviewer`): primeira volta `fix` com 8 correções; segunda, as 8 resolvidas e 3 regressões; terceira, as 3 resolvidas, disposição **ship**. Ressalva dele, que não bloqueia: num notebook de 1366×768, a S08 e a S09 ficam abaixo da dobra.
- **Não conferido:** o teste à mão com teclado e leitor de tela, e o Supabase de verdade.