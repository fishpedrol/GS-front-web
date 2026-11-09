# Regras e números

Os números que o código usa, num lugar só. **Quando um número mudar, atualize junto `web/src/domain/` e os testes**, e, se for do contrato comum (CONTEXTO, §10.2), o CONTEXTO antes, avisando o grupo. Edge, Python e Matemática usam os mesmos números (CONTEXTO, §5.2: "uma tabela única de critérios").

## 1. As salas (decididas pelo grupo; CONTEXTO, §4.1)

| ID | Porte | Mesas | Capacidade | Fonte | Mesas (seed) | Temp. °C | Luz (lux est.) | Ruído (dB sim.) |
|---|---|---:|---:|---|---|---:|---:|---:|
| S01 | média | 3 | 9 | Wokwi → Supabase | (da API) | (da API) | (da API) | (da API) |
| S02 | pequena | 2 | 6 | fictícia fixa | `[0, 2]` | 22 | 410 | 42 |
| S03 | pequena | 2 | 6 | fictícia fixa | `[3, 3]` | 18 | 920 | 71 |
| S04 | média | 3 | 9 | fictícia fixa | `[1, 1, 1]` | 21 | 500 | 46 |
| S05 | média | 3 | 9 | fictícia fixa | `[0, 3, 3]` | 24 | 350 | 57 |
| S06 | média | 3 | 9 | fictícia fixa | `[2, 2, 1]` | 19 | 180 | 61 |
| S07 | média | 3 | 9 | fictícia fixa | `[0, 0, 1]` | 23 | 450 | 39 |
| S08 | grande | 4 | 12 | fictícia fixa | `[3, 2, 1, 0]` | 25 | 600 | 53 |
| S09 | grande | 4 | 12 | fictícia fixa | `[3, 3, 3, 2]` | 28 | 760 | 68 |

Total: 9 salas, 27 mesas, 81 lugares. Os seeds são **[Dado fictício]** e podem mudar, mantendo as capacidades.

## 2. A ocupação (RN-01 a RN-07)

- Cada mesa tem 3 lugares; `0 ≤ mesa ≤ 3`. Capacidade = 3 × mesas.
- Total = soma das mesas; vagas = capacidade − total; mesas vazias = mesas com 0; taxa = 100 × total / capacidade.
- Sem pessoas em pé. Para grupo, só conta mesa com 0. Sem campo de tamanho do grupo.

## 3. Os limiares — **PROPOSTA da parte web, aguardando o grupo (G.1)**

> **PROPOSTA da parte web, aguardando o grupo (G.1; fecha a D3 e a D4).** Nada aqui é critério aprovado: estes números não vão para slide nem para o README como oficiais. São os mesmos de `web/src/domain/limiares.js` (08/11/2026). A pesquisa completa, com os trechos das fontes, está no [PESQUISA_LIMIARES.md](PESQUISA_LIMIARES.md); a página para mandar ao grupo é a [PROPOSTA_LIMIARES_GRUPO.md](PROPOSTA_LIMIARES_GRUPO.md).

Faixa (onde o valor está) e severidade (se é bom para usar) são coisas diferentes (CONTEXTO, §5.2). Frio, escuro ou claro demais também podem ser críticos (RN-09). O estado geral segue os LEDs: vermelho se algum crítico; amarelo se nenhum crítico e algum em atenção; verde só se todos adequados; falha é um estado à parte (RN-08).

### 3.1 Os números propostos

| Indicador | Unidade | limiteBaixo | limiteAlto | criticoAbaixo | atencaoAbaixo | atencaoAcima | criticoAcima | Estado |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Temperatura | `°C` | 21 | 26 | 18 | 21 | 25 | 26 | **proposta** |
| Luminosidade | `lux_estimado` | 300 | 750 | 200 | 300 | 2000 | 3000 | **proposta** |
| Ruído | `dB_simulados` | 40 | 55 | null | null | 45 | 65 | **proposta** |
| Ocupação | `%` (da capacidade sentada) | 35 | 70 | null | null | 50 | 90 | **proposta** (critério do grupo, sem norma) |

`null` = aquele lado não alerta (pouco ruído e sala vazia não são problema).

| Indicador | Adequado | Atenção | Crítico | Faixa baixo / médio / alto |
|---|---|---|---|---|
| Temperatura | 21 a 25 °C | 18 até menos de 21, ou acima de 25 até 26 | abaixo de 18 ou acima de 26 | abaixo de 21 / 21 a 26 / acima de 26 |
| Luminosidade | 300 a 2000 lux | 200 até menos de 300, ou acima de 2000 até 3000 | abaixo de 200 ou acima de 3000 | abaixo de 300 / 300 a 750 / acima de 750 |
| Ruído | até 45 dB | acima de 45 até 65 | acima de 65 | abaixo de 40 / 40 a 55 / acima de 55 |
| Ocupação | até 50 % | acima de 50 até 90 | acima de 90 | abaixo de 35 / 35 a 70 / acima de 70 |

### 3.2 A fonte de cada um

| Indicador | Fonte (o que foi lido) | Confiança |
|---|---|---|
| Temperatura | NR-17, item 17.8.4.2 (18 a 25 °C em ambiente climatizado; lida no PDF oficial) e NBR 16401-2:2008 (zonas de conforto de 21 a 26 °C; lida numa fonte secundária, a norma é paga). Adequado onde as duas concordam; atenção onde só uma atende | média |
| Luminosidade | pouca luz: NHO 11 da Fundacentro, para onde a NR-17 (item 17.8.3) manda (tarefa contínua no mínimo 200 lux; sala de aula 300 lux). Luz demais: o UDI (Mardaljevic), 2000 lux e, na revisão do próprio autor, cerca de 3000 lux. Faixa média de 300 a 750 (os valores da NHO 11 para salas de escola) | média (baixa no lado de luz demais) |
| Ruído | NBR 10152 (biblioteca: até 45 dB é o "aceitável", nas edições de 1987 e 2017; a de 2017 lida em fontes secundárias) e NR-17, item 17.8.4.1.2 (até 65 dB(A)). Faixa: abaixo de 40 (biblioteca, NBR 10152:2017) e acima de 55 (mais que a circulação de escola, NBR 10152:1987) | baixa (dB simulados, não dB(A)) |
| Ocupação | critério do grupo, sem norma. Atenção acima de 50 %: a sala já parece cheia (Williams, 1996, citando um estudo de biblioteca); crítico acima de 90 %: praticamente lotada | baixa |

### 3.3 A regra (igual em todas as disciplinas)

- **Faixa:** `baixo` se `v < limiteBaixo`; `alto` se `v > limiteAlto`; senão `medio`.
- **Severidade:** `critico` se passou de um limite crítico (abaixo ou acima); senão `atencao` se passou de um limite de atenção; senão `adequado`. Um limite `null` não conta.
- **Comparações estritas** (`<` e `>`): o próprio limite fica do lado de dentro (18 °C é atenção; 25 °C, 45 dB e 50 % são adequados).
- **Sem leitura válida:** o valor e a faixa ficam `null` e a severidade fica `invalido`, o que leva a sala a `falha`.

### 3.4 O índice de ruído

`DB_MIN = 30` e `DB_MAX = 80` (`RUIDO_DB_MIN` e `RUIDO_DB_MAX` no `limiares.js`; critério do grupo, sem norma, **proposta**):

```text
indiceRuido = limitar(arredondar(100 × (dB − 30) / (80 − 30)), 0, 100)
            = limitar(arredondar(2 × (dB − 30)), 0, 100)      (100 = mais ruidoso)
```

- O arredondamento é o do `Math.round` (0,5 sobe): 30,25 dB → índice 1. O Python precisa de `math.floor(x + 0.5)`, porque o `round()` dele arredonda para o par.
- Do potenciômetro para dB (ESP32, leitura de 0 a 4095; **a confirmar no Wokwi pelo Edge**): `dB = 30 + leitura × 50 / 4095`.
- Os limiares caem em posições redondas: 40 dB = 20 % do curso (índice 20), 45 = 30 %, 55 = 50 %, 65 = 70 %.
- O dB é logarítmico; o índice é linear em dB. Índice 60 **não** é o dobro do 30 (CONTEXTO, §5.3).

### 3.5 A faixa de leitura possível (fora dela é erro de leitura)

`LEITURA_POSSIVEL` no `limiares.js` (**provisório**). Um valor fora dela vira `null` no `normalizar.js`, e a sala vai para `dados_invalidos` e `falha` (CONTEXTO, §5.4). As pontas contam como dentro.

| Indicador | Mínimo | Máximo | De onde |
|---|---:|---:|---|
| Temperatura (°C) | −40 | 80 | faixa do DHT22 (AM2302) pelo datasheet do fabricante; não conferida no Wokwi (o Edge confirma) |
| Luz (lux estimado) | 0 | 100000 | luz não é negativa; o máximo é o maior valor da tabela do fotorresistor do Wokwi |
| Ruído (dB simulados) | 30 | 80 | a própria escala do potenciômetro |

### 3.6 Como fica no código e o que muda quando o grupo responder

- O topo do `web/src/domain/limiares.js` diz: `// PROVISÓRIO — proposta da parte web, aguardando a aprovação do grupo (tabela única para Edge, Python, Matemática e Web).` O código não aponta para a `docs/`, porque ela fica fora do repositório.
- Se o grupo mudar um número: trocar no `limiares.js`, atualizar os testes (`limiares.test.js`, as bordas e a tabela das 8 salas no `classificacao.test.js`, e o `normalizar.test.js` se mudar a faixa de leitura), atualizar esta seção e, depois de aprovado, tirar o "PROVISÓRIO" do comentário.
- Com os números de hoje, das oito salas fictícias: 2 verdes (S02, S07), 3 amarelas (S04, S05, S08) e 3 vermelhas (S03, S06, S09). O exemplo da S01 (CONTEXTO, §6.3) fica amarelo, por causa do ruído (54 dB).

## 4. O ranking — **PROVISÓRIO (proposta da parte web, aguardando o grupo)**

> **PROVISÓRIO.** O CONTEXTO, §7.5, deixa "a definir" os pesos, os desempates e o que fazer com a S01 desatualizada. Estes números são a proposta da parte web, os mesmos de `web/src/domain/ranking.js` (08/11/2026), marcados `// PROVISÓRIO` no código. Não apresentar as notas como se fossem cientificamente calibradas (§7.5).

Primeiro elimina, depois pontua de 0 a 100 de forma determinística e ordena do maior para o menor (CONTEXTO, §7.5; RN-15). Os filtros manuais (`domain/filtros.js`, intervalos inclusivos, RN-14) rodam antes: o ranking só ordena as salas que passaram neles. Sem atalho escolhido, fica a ordem S01 a S09, sem nota.

### 4.1 Quem sai (as eliminações)

| Regra | Atalho | Frase na tela |
|---|---|---|
| estado `falha` (sem leitura confiável: `sem_leitura`, `dados_invalidos`, `offline`...) | os três | "Sem leitura confiável" |
| nenhum lugar vago | Estudar sozinho, Gravar vídeo | "Sala lotada" |
| nenhuma mesa com 0 pessoas (RN-06) | Trabalho em grupo | "Nenhuma mesa totalmente livre" |
| ruído crítico (acima de 65 dB simulados, §3) | Gravar vídeo | "Barulhenta demais para gravar" |

A ordem é a da tabela, e vale a primeira que pegar (a S03 no vídeo sai como "Sala lotada", não como barulhenta). As que saem ficam no fim, por id, sem nota e sem posição.

### 4.2 Os pesos (somam 100 em cada atalho) — **PROVISÓRIO**

| Atalho | Ruído | Temperatura | Luz | Ocupação | Mesas livres |
|---|---:|---:|---:|---:|---:|
| Estudar sozinho | 40 | 20 | 20 | 20 | — |
| Trabalho em grupo | 20 | 10 | 10 | 25 | 35 |
| Gravar vídeo | 45 | 10 | 30 | 15 | — |

Cada atalho pesa mais o que o §7.5 diz que ele prefere: sozinho, o silêncio; grupo, a mesa totalmente livre e a sala vazia; vídeo, o ruído e a luz.

### 4.3 Como cada indicador pontua — **PROVISÓRIO**

| Indicador | Pontos |
|---|---|
| Ruído, temperatura, luz | peso × 1 se `adequado`; × 0,5 se `atencao`; × 0 se `critico` ou sem leitura (`PARTE_DO_PESO`, interno) |
| Ocupação | peso × vagas ÷ capacidade (sala vazia = o peso inteiro; cheia = 0) |
| Mesas livres (só no grupo) | peso × mín(mesas vazias, 2) ÷ 2: 1 mesa vale a metade, 2 ou mais o peso inteiro (`MESAS_LIVRES_PARA_O_PESO_INTEIRO = 2`, interno) |

```text
nota = arredondar(soma dos pontos)         (Math.round: 0,5 sobe)
se a leitura está desatualizada: nota = máx(0, nota − 15)
```

A conta da ocupação usa as vagas, e não a taxa, porque parte de números inteiros: com a taxa (1 − taxa/100), um 12,5 pode sair 12,499999999999998 e arredondar para baixo.

### 4.4 O desempate

Na mesma nota: **menor taxa de ocupação**; depois **mais mesas totalmente livres**; por fim o **menor id** (comparado como texto: S01 antes de S02). Nunca sobra empate entre duas salas.

### 4.5 A S01 desatualizada — **PROVISÓRIO**

Continua no ranking, **com aviso** (RN-11): o primeiro motivo vira "Leitura desatualizada" e a nota perde **15 pontos** (`PONTOS_A_MENOS_SE_DESATUALIZADA = 15`, interno), porque não é a medição de agora. "Desatualizada" é o selo do §5 (mais de 30 s desde o `updated_at`). Era a pendência do §7.5; isto é a proposta.

### 4.6 O porquê na tela

Cada sala que entra mostra 4 frases curtas, do que mais pesa para o que menos pesa: sozinho (ruído, vagas, temperatura, luz); grupo (mesas livres, ocupação, ruído, temperatura); vídeo (ruído, luz, vagas, temperatura). Ex.: S07 no sozinho: "Silenciosa (39 dB simulados)", "8 lugares vagos", "Temperatura confortável (23 °C)", "Boa iluminação (450 lux estimado)".

### 4.7 Com os números de hoje

Os pesos acima, os limiares do §3 (**proposta**), os seeds do §1 (**[Dado fictício]**) e a S01 sem leitura (conferido rodando o código e calculado à mão no `ranking.test.js`):

| Atalho | A ordem (nota) | Saem |
|---|---|---|
| Estudar sozinho | S07 (98), S02 (93), S04 (73), S08 (70), S05 (67), S06 (39), S09 (22) | S01 (sem leitura), S03 (lotada) |
| Trabalho em grupo | S07 (97), S02 (74), S08 (60), S05 (56) | S01 (sem leitura); S03, S04, S06, S09 (sem mesa livre) |
| Gravar vídeo | S07 (98), S02 (95), S04 (73), S08 (70), S05 (68), S06 (34) | S01 (sem leitura), S03 (lotada), S09 (ruído crítico) |

A conta da S07 no sozinho: ruído 40 + temperatura 20 + luz 20 + ocupação 20 × 8 ÷ 9 (17,78) = 97,78 → **98**. Com a S01 do exemplo do CONTEXTO, §6.3 (leitura em dia), ela entra em 3º nos três (73, 64 e 73); no sozinho e no vídeo empata com a S04 em 73 e fica na frente pelo desempate (mesma taxa, 1 mesa vazia contra nenhuma). Desatualizada, cai para 58 no sozinho.

### 4.8 O que muda quando o grupo responder

Trocar os números no `web/src/domain/ranking.js`, refazer as notas calculadas à mão no `ranking.test.js` (estão num comentário ao lado de cada caso), atualizar esta seção e, depois de aprovado, tirar o "PROVISÓRIO" dos comentários.

## 5. A demonstração e o tempo

| Número | Valor | Onde no código | Estado |
|---|---|---|---|
| Matrícula fictícia | `RM000000` (claramente falsa; nunca um RM real) | `CREDENCIAIS_DEMO`, `web/src/domain/sessao.js` | **PROVISÓRIO**: ainda não combinada com o grupo |
| Senha fictícia | `salas2026` | `CREDENCIAIS_DEMO`, `web/src/domain/sessao.js` | **PROVISÓRIO**: ainda não combinada com o grupo |
| Como a entrada confere | matrícula sem os espaços em volta e sem diferença de maiúsculas (`rm000000` entra); senha exatamente como foi digitada; só espaços conta como vazio | `conferirCredenciais`, `web/src/domain/sessao.js` | decidido pela parte web |
| Onde fica a sessão | `sessionStorage`, chave `citizentech_sessao_demo`, valor `{"matricula":"RM000000"}`; some ao fechar a aba | `web/src/services/sessaoDemo.js` | decidido (08/11) |
| Intervalo do polling da S01 | `INTERVALO_ATUALIZACAO_MS = 5000` (5 s) | `web/src/services/telemetria.js` | **PROVISÓRIO**: depende do intervalo de envio do ESP32, que o Edge ainda não definiu |
| Quando vira "Desatualizado" (o `STALE_AFTER_SECONDS` do CONTEXTO, §6.5) | `LIMITE_DESATUALIZADO_SEGUNDOS = 30`: mais de 30 s desde o `updated_at` (com 30 s exatos ainda está em dia) | `web/src/services/telemetria.js`, usado pelo `leituraDesatualizada` | **PROVISÓRIO**: tem de ser maior que o intervalo de envio do ESP32, ainda não definido |
| Tempo limite de um pedido à API | `TEMPO_LIMITE_PEDIDO_MS = 15000` (15 s); depois disso o pedido é cancelado e a tela mostra "A API demorou mais de 15 segundos para responder." | `web/src/services/telemetria.js` | **PROVISÓRIO**: três intervalos de hoje; sem medida da rede da FIAP nem do celular na apresentação |
| Relógio do selo "Desatualizado" | confere a cada 1 s (`INTERVALO_RELOGIO_MS = 1000`) | `web/src/hooks/useSalas.js` | ritmo da tela, não é regra |
| Chave do `localStorage` | `citizentech_user_preferences_v1` | `CHAVE_PREFERENCIAS`, `web/src/services/colecoesLocais.js` | decidido (CONTEXTO, §7.7, sugestão) |
| Tamanho máximo do nome de uma lista | 40 caracteres (um emoji conta como 1) | `NOME_LISTA_MAX`, `web/src/domain/colecoes.js` | escolha da parte web |

O `telemetria.test.js` confere a **relação** entre os tempos (o limite de "Desatualizado" e o tempo limite do pedido são maiores que o intervalo), e não os números: quando o Edge definir o intervalo de envio do ESP32, trocar o `INTERVALO_ATUALIZACAO_MS` e o `LIMITE_DESATUALIZADO_SEGUNDOS` (e, se precisar, o `TEMPO_LIMITE_PEDIDO_MS`), rodar os testes e atualizar esta tabela.

### 5.1 O roteiro do modo de demonstração (sem Supabase)

No modo `mock`, a S01 mostra um roteiro fixo de **9 leituras inventadas** (não vêm do Wokwi; a tela diz que é demonstração, RN-10), uma a cada busca, e depois volta ao começo (uma volta leva 45 s com o intervalo de hoje). Cada passo muda um valor só:

| Passo | Mesas | Temp. °C | Luz (lux est.) | Ruído (dB sim.) | Estado (com os limiares do §3) |
|---:|---|---:|---:|---:|---|
| 1 | `[1, 0, 0]` | 22,5 | 450 | 38 | verde |
| 2 | `[1, 1, 0]` | 22,5 | 450 | 38 | verde |
| 3 | `[1, 1, 0]` | 22,5 | 450 | 55 | amarelo |
| 4 | `[1, 1, 0]` | 23,5 | 450 | 55 | amarelo |
| 5 | `[1, 1, 0]` | 23,5 | 450 | 70 | vermelho |
| 6 | `[1, 1, 0]` | 23,5 | 450 | 38 | verde |
| 7 | `[1, 1, 0]` | 23,5 | 250 | 38 | amarelo |
| 8 | `[1, 0, 0]` | 23,5 | 250 | 38 | amarelo |
| 9 | `[1, 0, 0]` | 23,5 | 450 | 38 | verde |

São 4 verdes, 4 amarelos, 1 vermelho e nenhuma falha. O `telemetria.test.js` passa cada passo pelo `normalizarTelemetria` e pelo `classificarSala` de verdade: se um limiar do §3 mudar e o roteiro deixar de passar pelos três estados, o teste avisa.
