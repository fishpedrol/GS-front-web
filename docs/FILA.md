# A fila de trabalho (parte web)

Criada em 08/11/2026. A ordem segue a dependência técnica do CONTEXTO, §13 ("primeiro provar a integração IoT mínima, depois cards e regras, depois filtros e CRUD, então acabamento e documentação"), ajustada para a parte web: como a integração real depende do Edge (DEPENDENCIAS.md, D2), a S01 entra primeiro em modo mock e a prova ponta a ponta entra assim que o Wokwi publicar. O detalhe de cada linha está no [PLANO_WEB.md](PLANO_WEB.md). **Prazo do edital: 19/11/2026, às 23h55** (p. 25).

| # | O quê | Depende de | Estado |
|---|---|---|---|
| 0 | **Os docs de planejamento** (`docs/` e o `PRODUCT.md`) e a resposta das dependências | nada | **feita** (08/11/2026) |
| W1 | **A base:** git, `web/` com Vite + React + JavaScript + Tailwind, as pastas das camadas, o `.env.example`, o README com a Ficha CitizenTech, o `AI.md` começado, o Vitest e o primeiro deploy | nada | **feita** (08/11/2026: 4 commits no `fishpedrol/GS-front-web`, privado; build, 8 testes e lint passando; evidência no IMPLEMENTATION_STATUS.md). **Falta o deploy**, que espera o Felipe entrar na Vercel |
| W2 | **O domínio:** as nove salas (`data/salas.js`), os cálculos de ocupação (RN-01 a RN-06), a classificação provisória (`domain/limiares.js`) e os testes | D3 só para os números definitivos | **feita** (08/11/2026: `data/` e `domain/` com 318 testes, lint e build passando, limiares provisórios, a explicação, a proposta e o JSON para o grupo; evidência no IMPLEMENTATION_STATUS.md). Falta o commit e o push |
| W3 | **O painel:** o login fictício, o cabeçalho e os nove cards com todas as métricas e os selos de origem | D5 (combinar o layout com o UX; não trava) | **feita** (08/11/2026, de madrugada: o visual de painel de embarque pela skill impeccable, revisado até "ship"; no GitHub) |
| W4 | **Os favoritos e as listas:** o CRUD inteiro no `localStorage` (`useColecoes`) | nada | **feita** (08/11/2026; falta o teste à mão T-14 a T-16) |
| W5 | **Os filtros e os atalhos:** intervalos inclusivos, mesa livre, "Limpar filtros", os três atalhos com o ranking determinístico | os pesos (decisão da parte web) | **feita** (08/11/2026; pesos provisórios; falta o teste à mão T-11 a T-13) |
| W6 | **A S01 pela API:** `services/telemetria.js` (simulação local e Supabase), `useSalas` (polling, carregando, erro, desatualizado); depois, a prova ponta a ponta T-09 e T-10 | D1 (o Supabase); D2 (o Wokwi) só para a prova final | **simulação local feita** (08/11/2026); **falta ligar o Supabase** (o Felipe cria o projeto) e a prova com o Edge |
| W7 | **O acabamento:** responsivo, acessibilidade (T-17), estados vazios e de erro, o `/impeccable polish` | W3 a W6; D6 (o nome) | **em parte** (08/11/2026: 2 rodadas de print, o revisor final "ship", o DESIGN.md e o contraste calculado; falta o T-17 à mão e o nome) |
| W8 | **A entrega:** os testes T-11 a T-18 com evidência, o README e o `AI.md` finais, os 15+ commits, o acesso dos professores, o deploy final, o ZIP e **as duas entregas separadas** no Teams | tudo acima; D7, D8, D9 | na fila |

## O calendário proposto

| Dias | O quê |
|---|---|
| dom 08/11 e seg 09/11 | W1 e W2; responder as WP; levar ao grupo a D1, a D3 e a D7 |
| ter 10/11 e qua 11/11 | W3 e W4; mandar o JSON das salas ao grupo; fechar os limiares (D3, D4) |
| qui 12/11 e sex 13/11 | W5 e W6 com mock e com o Supabase real escrito à mão |
| sáb 14/11 e dom 15/11 | a prova ponta a ponta com o Edge (T-09, T-10); W7; telas para o UX e o Storytelling |
| seg 16/11 e ter 17/11 | W8: os testes com evidência, o README, o `AI.md`, o deploy final |
| qua 18/11 | revisão geral, o ZIP, conferir o acesso dos professores ao repositório |
| qui 19/11 | as duas entregas (Front-end e Web) **antes** das 23h55 |

**Sobras fora da fila** (só se der tempo e o Felipe pedir): o histórico de leituras da S01, a umidade do DHT22 no card, o modo escuro.
