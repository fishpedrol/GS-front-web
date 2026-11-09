# Dependências da parte web (Front-end + Web Development)

Escrito em 08/11/2026 para responder: a parte web depende de alguém terminar algo antes, ou já dá para começar?

## A resposta curta

**Dá para começar já. Nada trava o começo.** Quase tudo da web é nosso e independente: o projeto Vite, as nove salas, as regras de ocupação, os cards, os filtros, o ranking, o login fictício, os favoritos, as listas e o README. O que depende dos outros é **só a prova ponta a ponta da S01** (o Wokwi mudando e o card mudando junto, os testes T-09 e T-10 do CONTEXTO, §11), e mesmo ela a gente adianta: o front lê a S01 por um serviço que tem um modo **mock**, com o mesmo formato da tabela, e o Supabase dá para criarmos nós mesmos e testar escrevendo a linha à mão.

Três coisas não travam o código, mas **precisam de uma decisão do grupo até 11/11** para o resultado ficar coerente entre as disciplinas: os limiares (temperatura, luz, ruído e ocupação), quem cria o Supabase e o repositório, e o desenho da tela combinado com quem faz o protótipo de UX.

## O que a web precisa dos outros

| # | O quê | De quem | Trava o quê | Enquanto isso | Até quando |
|---|---|---|---|---|---|
| D1 | **Projeto Supabase** com a tabela `room_telemetry`, a linha `S01`, a RLS e a chave publicável | **A parte web** (decidido em 08/11) | Só a leitura real da S01 (fatia W6) | O serviço de telemetria em modo mock, com o mesmo formato (CONTEXTO, §6.3) | 12/11 |
| D2 | **ESP32 no Wokwi publicando** no Supabase (PATCH da linha S01) | Integrante de Edge | A prova T-09/T-10 e a demo da integração no vídeo | Escrever a linha à mão (`curl` ou o painel do Supabase) e ver o card mudar | 14/11 |
| D3 | **Tabela de limiares** (faixa baixo/médio/alto e severidade adequado/atenção/crítico de temperatura, luz, ruído e ocupação) | Grupo (Edge, Python, Matemática e nós) | Os rótulos e cores "definitivos" dos cards e o peso do conforto no ranking | **Proposta pronta em `docs/PROPOSTA_LIMIARES_GRUPO.md`, falta o grupo aprovar.** Até lá, os provisórios em `web/src/domain/limiares.js`, marcados como provisórios | 11/11 |
| D4 | **Unidade da luz** (lux estimado ou índice) e **faixa dos dB simulados** | Edge, com o grupo | O texto da unidade no card e o índice de ruído 0–100 | **Proposta pronta em `docs/PROPOSTA_LIMIARES_GRUPO.md`, falta o grupo aprovar:** `lux_estimado` e a escala de 30 a 80 dB simulados (`RUIDO_DB_MIN`, `RUIDO_DB_MAX`), provisórias no mesmo arquivo | 11/11 |
| D5 | **Protótipo de média fidelidade** (Software & Total Experience, edital p. 43–49) | Integrante de UX | Nada no código; o risco é a tela e os slides ficarem diferentes | Mostrar o nosso rascunho de layout cedo, ou pegar o dele assim que existir | 11/11 |
| D6 | **Nome da solução e identidade** | Grupo / Storytelling | Só o cabeçalho, o título e as cores | Nome de trabalho e cores neutras | 15/11 |
| D7 | **Repositório GitHub privado** e o acesso de escrita dos professores (edital, p. 42 e 61) | **Resolvido em 08/11:** `fishpedrol/GS-front-web`, privado. Falta convidar o grupo e, antes da entrega, os professores | — | — | grupo: 09/11; professores: até 18/11 |
| D8 | **Evidência escrita** da orientação docente "API externa e CRUD podem ser separados" (CONTEXTO, §3.3) | Quem consultou os professores | Nada no código; é risco de nota, porque o texto do edital (p. 40, 42, 59, 61) fala em CRUD na API | Seguir a decisão do grupo (CRUD no `localStorage`) e guardar o print quando vier | antes de 19/11 |
| D9 | **Nomes, RMs e responsabilidades** da equipe | Grupo | Só a Ficha CitizenTech no topo do README (edital, p. 21) | Deixar "A definir" e não inventar | 16/11 |

## O que os outros precisam da web

| O quê | Quem precisa | Até quando |
|---|---|---|
| A URL e a chave publicável do Supabase, e o formato exato do JSON (se formos nós a criar, D1) | Edge | 12/11 |
| As nove salas e os seeds S02–S09 num JSON (para todos usarem os mesmos números). **Pronto:** `docs/salas_para_o_grupo.json` (gerado do `data/salas.js`); falta mandar | Python, Matemática, UX | 10/11 |
| A tabela de limiares proposta (D3). **Pronta:** `docs/PROPOSTA_LIMIARES_GRUPO.md`; falta mandar e o grupo aprovar | Edge, Python, Matemática | 11/11 |
| Telas funcionando para prints e para o vídeo | UX (protótipo e slides), Storytelling (videopitch) | 15/11 |
| O link do deploy | Front-end e Web (as duas entregas), Storytelling | 17/11 |

## Partes que não se cruzam com a web

- **Python** (edital, p. 29–32): é uma aplicação de terminal independente. Só precisa usar as mesmas regras e as mesmas salas.
- **Matemática** (p. 33–34): o modelo de ocupação `N(t)`; usa a capacidade da S01 (9).
- **Storytelling** (p. 52–57): precisa das telas prontas, não do código.
