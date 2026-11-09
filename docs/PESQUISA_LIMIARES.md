# Pesquisa dos limiares de conforto das salas de estudo

> **PROPOSTA da parte web, aguardando a aprovação do grupo (G.1, que fecha as dependências D3 e D4 do [DEPENDENCIAS.md](DEPENDENCIAS.md)).**
> Nada aqui é critério aprovado. Até o grupo aprovar, todos os números abaixo são **provisórios**: não vão para slide nem para o README como critério oficial (REGRAS_E_LIMIARES.md, §3).
> Pesquisa feita em 08/11/2026. Cada fonte diz se foi **lida de verdade** (verificada) ou não.

**Para quem é:** Edge (o C++ do ESP32 e os LEDs), Python, Matemática, UX e a web usam **a mesma tabela** (CONTEXTO, §5.2: "uma tabela **única** de critérios").

**Aviso que vale para tudo:** as normas citadas foram escritas para **locais de trabalho** (NR-17, NHO 11) ou para **projeto de edificações** (ABNT). Nenhuma foi escrita para "sala de estudo de aluno". Usamos os números delas como **referência**, e os valores do projeto são **simulados** (Wokwi) ou **fictícios** (seeds S02 a S09). Nada disso é medição real.

---

## 1. A tabela proposta

### 1.1 Os números

| Indicador | Unidade | limiteBaixo | limiteAlto | criticoAbaixo | atencaoAbaixo | atencaoAcima | criticoAcima | Confiança |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Temperatura | °C | 21 | 26 | 18 | 21 | 25 | 26 | média |
| Luminosidade | `lux_estimado` | 300 | 750 | 200 | 300 | 2000 | 3000 | média |
| Ruído | dB **simulados** | 40 | 55 | null | null | 45 | 65 | baixa |
| Ocupação | % da capacidade sentada | 35 | 70 | null | null | 50 | 90 | baixa (**critério do grupo**) |

**Escala do ruído simulado:** `DB_MIN = 30`, `DB_MAX = 80`. Com isso, o índice do CONTEXTO, §5.3 fica `indiceRuido = limitar(arredondar(2 × (dB − 30)), 0, 100)`.

### 1.2 Os mesmos números em palavras

| Indicador | Adequado | Atenção | Crítico | Faixa (baixo / médio / alto) |
|---|---|---|---|---|
| Temperatura | de 21 a 25 °C | de 18 até menos de 21 °C, **ou** acima de 25 até 26 °C | abaixo de 18 °C **ou** acima de 26 °C | frio abaixo de 21; ameno de 21 a 26; quente acima de 26 |
| Luminosidade | de 300 a 2000 lux | de 200 até menos de 300 lux, **ou** acima de 2000 até 3000 lux | abaixo de 200 lux **ou** acima de 3000 lux | escuro abaixo de 300; médio de 300 a 750; claro acima de 750 |
| Ruído | até 45 dB | acima de 45 até 65 dB | acima de 65 dB | silencioso abaixo de 40; moderado de 40 a 55; barulhento acima de 55 |
| Ocupação | até 50 % | acima de 50 até 90 % | acima de 90 % | baixa abaixo de 35; média de 35 a 70; alta acima de 70 |

### 1.3 Como ler (a regra exata, igual em todas as disciplinas)

- **Faixa** (onde o valor está): `baixo` se `v < limiteBaixo`; `alto` se `v > limiteAlto`; senão `médio`.
- **Severidade** (se é bom para usar):
  - `crítico` se (`criticoAbaixo` não é null **e** `v < criticoAbaixo`) **ou** (`criticoAcima` não é null **e** `v > criticoAcima`);
  - senão `atenção` se (`atencaoAbaixo` não é null **e** `v < atencaoAbaixo`) **ou** (`atencaoAcima` não é null **e** `v > atencaoAcima`);
  - senão `adequado`.
- Todas as comparações são **estritas** (`<` e `>`): o próprio número do limite fica do lado de dentro. Exemplo: 18 °C é atenção, não crítico; 25 °C é adequado; 45 dB é adequado; 50 % é adequado.
- Ruído e ocupação **baixos não são problema**: por isso `criticoAbaixo` e `atencaoAbaixo` são `null` nos dois.
- O estado geral (os LEDs, RN-08) não muda: vermelho se algum indicador está crítico; amarelo se nenhum está crítico e algum está em atenção; verde só se todos estão adequados; falha de sensor é um estado à parte.

### 1.4 A ideia que usei para escolher (fácil de explicar)

**"Duas referências de cada lado."** Para cada lado que pode dar problema (pouco e muito), peguei **duas referências** das fontes:

- atende às **duas** → `adequado`;
- atende a **só uma** → `atenção`;
- não atende a **nenhuma** → `crítico`.

A **faixa** usa números das mesmas fontes, mas não precisa coincidir com a severidade. Isso é de propósito (CONTEXTO, §5.2: a faixa "não diz automaticamente se é bom ou ruim"). Exemplo: a S03 tem 920 lux, faixa **alto** e severidade **adequado**.

---

## 2. Temperatura (°C)

### 2.1 O que as fontes dizem

- **NR-17 (Ergonomia), redação da Portaria MTP nº 423/2021, texto consolidado do gov.br. Verificada (li o PDF oficial).**
  - Item 17.8.4: "Nos locais de trabalho em ambientes internos onde são executadas atividades que exijam manutenção da solicitação intelectual e atenção constantes, devem ser adotadas medidas de conforto acústico e de conforto térmico [...]".
  - Item 17.8.4.2: "[...] observando-se o parâmetro de faixa de temperatura do ar entre 18 e 25 °C para ambientes climatizados."
- **ABNT NBR 16401-2:2008 (parâmetros de conforto térmico). A norma eu não li (é paga). Os valores vêm de uma fonte secundária que eu li (Sollo Engenharia):**
  - verão (roupa típica 0,5 clo): 22,5 a 25,5 °C com UR de 65 %; 23,0 a 26,0 °C com UR de 35 %;
  - inverno (roupa típica 0,9 clo): 21,0 a 23,5 °C com UR de 60 %; 21,5 a 24,0 °C com UR de 30 %;
  - atividade sedentária ou leve (1,0 a 1,2 met). A temperatura é a **operativa**, que leva em conta o ar e as superfícies, não só o ar.
- **NBR 16401-2, edição nova.** O catálogo (normas.com.br, verificado) mostra uma **nova edição em 11/2024**, com 86 páginas; a mesma página diz "Vigente" e, num aviso no fim, que ela "foi cancelada". **Não li o conteúdo da edição de 2024.**
- **2º Projeto de Revisão da NBR 16401-2 (nov. 2023), publicado pelo LabEEE/UFSC. Verificado. Atenção: o próprio documento diz que "não tem valor normativo".** Ele troca as faixas fixas pelo método do **PMV**: "A conformidade é alcançada se −0.5 < PMV < +0.5", e diz que os gráficos de zona de conforto "não podem ser aplicados com base apenas na temperatura de bulbo seco".
- **ASHRAE 55.** Não consegui abrir (é paga; a página da ANSI devolveu erro 403). Pelo projeto de revisão acima, a NBR nova segue a mesma linha (PMV e modelo adaptativo). **Não verificado.**

### 2.2 A proposta e o porquê

| Lado | Referência 1 | Referência 2 | Resultado |
|---|---|---|---|
| Frio | NR-17: no mínimo 18 °C | NBR 16401-2:2008: a zona de conforto mais baixa começa em 21,0 °C | abaixo de 18 é crítico; de 18 até menos de 21 é atenção |
| Calor | NR-17: no máximo 25 °C | NBR 16401-2:2008: a zona de verão vai até 26,0 °C | acima de 26 é crítico; acima de 25 até 26 é atenção |

- **Adequado: de 21 a 25 °C**, onde as duas referências concordam.
- **Faixa:** `médio` de 21 a 26 °C, que é a região coberta pelas zonas de conforto da NBR 16401-2:2008 (juntando verão e inverno); `baixo` (frio) abaixo; `alto` (quente) acima.

### 2.3 Limitações

- O DHT22 do Wokwi dá a **temperatura do ar** (e a umidade). A NBR usa a temperatura operativa, e a revisão usa o PMV, que pede também a velocidade do ar, a roupa e a atividade. Com um sensor só, a faixa fixa é uma **simplificação** do grupo.
- A faixa da NR-17 é para ambientes **climatizados**. Não sabemos se as salas reais são.
- Não separamos verão de inverno (seria mais um dado para o Edge e a web). É uma escolha de simplicidade.

---

## 3. Luminosidade (`lux_estimado`)

### 3.1 O que as fontes dizem

- **NR-17, item 17.8.3. Verificado.** A iluminação dos locais de trabalho internos deve seguir "os níveis mínimos de iluminamento [...] estabelecidos na Norma de Higiene Ocupacional nº 11 (NHO 11) da Fundacentro [...], versão 2018."
- **NHO 11 (Fundacentro, 2018). Verificada (li uma cópia hospedada pela biblioteca da Unicesumar; não abri o site da Fundacentro).** Ela cita a ABNT NBR ISO/CIE 8995-1:2013 nas referências técnicas. No Quadro 1 (iluminância mínima E, em lux):
  - "28. Construções educacionais": **sala de aulas e sala de aulas particulares: 300**; sala de aulas noturnas, classes e educação de adultos: 500; sala de ensino de computador: 500; sala comum de estudantes e sala de reunião: 200; sala de desenho técnico: 750;
  - "26. Bibliotecas": estante: 200; **área de leitura: 500**;
  - item 5 (critério): "Em áreas nas quais são realizadas tarefas de forma contínua, a iluminância não pode ser inferior a 200 lux"; "É permitida uma tolerância de 10% abaixo desse valor"; quando falta a tarefa no quadro, o valor sai "por associação com tarefa similar";
  - a escala de iluminância: 20, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1.000, 1.500, 2.000...
- **ABNT NBR ISO/CIE 8995-1:2013. A norma eu não li (é paga).** Uma fonte secundária que li (Prado, TCC de Engenharia Civil da UTFPR, 2019) diz que ela recomenda para salas de aula "300 lux na tarefa e 200 lux no entorno imediato", com UGR máximo de 19.
- **Luz demais.** As normas dão **mínimos**, não máximos. Para o excesso, achei o UDI (*useful daylight illuminance*), uma métrica de luz natural:
  - **Mardaljevic (slides do workshop do Radiance, 2006). Verificado.** A faixa útil vai de 100 a 2000 lux; "It was around the 2000 lux mark that blinds were drawn and/or dissatisfaction was noted"; acima de 2000 lux há relação com ganho solar excessivo e ofuscamento.
  - **Mardaljevic (fórum do Radiance, 11/12/2012). Verificado.** Ele disse que 2000 lux foi "a little too conservative"; que usa 100, 300 e 3000 lux; e que "a consensus [...] may be forming around the 100, 300 and 3,000 (or 4,000?) lux values". Também escreveu: "UDI -- no fixed rules".
  - **Pattern Guide (página sobre o UDI). Verificado.** Avisa que "There is significant debate regarding the selection of 2,000 lux as an 'upper threshold'."

### 3.2 A proposta e o porquê

| Lado | Referência 1 | Referência 2 | Resultado |
|---|---|---|---|
| Pouca luz | NHO 11: tarefa contínua, no mínimo 200 lux | NHO 11 / NBR ISO/CIE 8995-1: sala de aula, no mínimo 300 lux | abaixo de 200 é crítico; de 200 até menos de 300 é atenção |
| Luz demais | UDI original: até 2000 lux | UDI revisto pelo autor: até cerca de 3000 lux | acima de 3000 é crítico; acima de 2000 até 3000 é atenção |

- **Por que 300 e não 500?** A severidade responde "dá para usar a sala?", e para isso usei os **mínimos**. A sala de estudo é parecida com a "sala de aulas particulares" da NHO 11 (300 lux). Os **500 lux** da "área de leitura" de biblioteca são o **ideal para ler**: sugiro usar esse número na **pontuação do ranking** (por exemplo, no "Estudar sozinho"), não na severidade. O efeito da outra escolha está no §7.
- **Faixa:** `baixo` abaixo de 300 (abaixo do mínimo de sala de aula); `médio` de 300 a 750 (os valores que a NHO 11 pede para salas de escola vão de 300 a 750); `alto` acima de 750 (mais luz do que qualquer sala de escola do quadro pede). "Alto" **não** quer dizer ruim.
- A tolerância de 10 % da NHO 11 **não** foi aplicada: o valor já é estimado, e um número redondo é mais fácil. O grupo pode decidir aplicar.

### 3.3 A unidade: `lux_estimado` (e não índice)

**Proposta: `lux_estimado`.** O motivo: o fotorresistor do Wokwi trabalha em lux, e a documentação dá a conta para voltar da leitura para lux. Com um índice adimensional, os limiares deixariam de ter ligação com as normas (300, 500 lux).

O que a documentação do Wokwi diz (página "Photoresistor (LDR) Sensor Module", **verificada**):

- o atributo `lux` do componente começa em 500 e é controlado por um controle deslizante; a tabela de exemplos vai de 0,1 lux (lua cheia) a 100.000 lux (sol direto);
- o módulo é um LDR em série com um resistor de 10 kΩ; o pino AO é a saída analógica; o DO é digital, com limiar padrão de 2,5 V (cerca de 100 lux);
- a conversão, com `GAMMA = 0,7` e `RL10 = 50` (os mesmos valores dos atributos do componente): `tensão = leitura / 1024 × 5`; `resistência = 2000 × tensão / (1 − tensão / 5)`; `lux = (RL10 × 1000 × 10^GAMMA / resistência)^(1 / GAMMA)`;
- a conta pode dar **infinito** com muita luz, e a página sugere checar com `isfinite(lux)`;
- **a página não fala do ESP32**: o exemplo é do Arduino (10 bits, 5 V).

**Adaptação para o ESP32 (um cálculo meu, que ainda precisa ser testado no Wokwi pelo Edge):**

- a documentação da Espressif (Arduino-ESP32, ADC, **verificada**) diz: "Default is 12 bits (range from 0 to 4095)"; com a atenuação de 11 dB, o ESP32 lê de 150 mV a 3100 mV;
- então, alimentando o módulo com 3,3 V: `tensão = leitura / 4095 × 3,3` e `resistência = 10000 × tensão / (3,3 − tensão)` (é a mesma conta do divisor; com 5 V ela vira a fórmula do Wokwi). Também dá para usar `analogReadMilliVolts()`, que devolve a tensão já calibrada;
- conferi a fórmula com a tabela do Wokwi a 5 V e 10 bits (100 lux dá 511; 400 lux dá 281; 1000 lux dá 170, iguais aos da página). Com 3,3 V e 12 bits, as leituras **esperadas** nos limiares são:

| Lux | 200 | 300 | 500 | 750 | 2000 | 3000 |
|---|---:|---:|---:|---:|---:|---:|
| `analogRead` esperado (ESP32, 3,3 V) | 1558 | 1295 | 1001 | 802 | 447 | 346 |

Cuidado: menos leitura quer dizer **mais** luz (o LDR fica em baixo no divisor). Não verifiquei se o Wokwi simula a não linearidade real do ADC do ESP32 nas pontas.

---

## 4. Ruído (dB simulados)

### 4.1 O que as fontes dizem

- **NR-17. Verificada.** Item 17.8.4.1.1: o ruído de fundo "deve respeitar os valores de referência para ambientes internos de acordo com sua finalidade de uso estabelecidos em normas técnicas oficiais" (a NBR 10152). Item 17.8.4.1.2: "Para os demais casos, o nível de ruído de fundo aceitável para efeito de conforto acústico será de até 65 dB(A) [...]".
- **ABNT NBR 10152:2017 (com a Errata 1:2020). A norma eu não li (é paga).** Duas fontes secundárias que li trazem os mesmos valores (RLAeq / RLASmax / RLNC):
  - salas de aula: **35 / 40 / 30**;
  - bibliotecas: **40 / 45 / 35**;
  - o blog da Volk do Brasil diz que há uma tolerância de até 5 dB no RLAeq e no RLASmax. Isso **só** aparece nessa fonte e não confirmei na norma.
- **ABNT NBR 10152:1987 (a edição antiga, já substituída). Verificada (li uma cópia hospedada num site da Prefeitura de João Pessoa).** Tabela 1, Escolas: bibliotecas, salas de música e salas de desenho, **35 a 45 dB(A)**; salas de aula e laboratórios, **40 a 50 dB(A)**; circulação, **45 a 55 dB(A)**. As notas da tabela dizem: "O valor inferior da faixa representa o nível sonoro para conforto, enquanto que o valor superior significa o nível sonoro aceitável para a finalidade" e "Níveis superiores aos estabelecidos nesta Tabela são considerados de desconforto, sem necessariamente implicar risco de dano à saúde".
- **OMS, *Guidelines for Community Noise* (1999). Verificada (li o capítulo 4 numa cópia arquivada do site da OMS e a ficha do documento no site da OMS).** Item 4.3.2: "in classrooms, the background sound pressure level should not exceed 35 dB LAeq during teaching sessions". Na tabela, "School class rooms and pre-schools, indoors": 35 dB LAeq, "during class". O mesmo capítulo diz que a voz casual tem cerca de 50 dB(A) a 1 m de distância.

### 4.2 A proposta e o porquê

| Lado | Referência 1 | Referência 2 | Resultado |
|---|---|---|---|
| Barulho | Biblioteca: o "aceitável" é 45 dB (NBR 10152:1987, 35 a 45; e o RLASmax de 45 na edição de 2017) | NR-17: o limite geral de conforto é 65 dB(A) | acima de 65 é crítico; acima de 45 até 65 é atenção |

- **Adequado: até 45 dB.** A sala de estudo foi comparada à **biblioteca**, que é o uso mais parecido (ler e estudar). O 45 aparece como teto "aceitável" para biblioteca nas duas edições da NBR 10152.
- **Faixa:** `baixo` (silencioso) abaixo de 40 dB, o valor de referência de biblioteca na NBR 10152:2017; `alto` (barulhento) acima de 55 dB, mais que o aceitável até para a **circulação** (corredor) de escola na NBR 10152:1987; `médio` (moderado) entre 40 e 55.

### 4.3 Limitações (importantes)

- Os números das normas são de **ruído de fundo**, com a sala sem a fala das pessoas. O "dB" do projeto representa o barulho **da sala em uso**. É uma adaptação do grupo.
- O valor sai de um **potenciômetro**: não é medição de pressão sonora, não é dB(A) calibrado e não é LAeq (CONTEXTO, §5.3). O card mostra o selo "dado simulado".

### 4.4 A escala simulada (`DB_MIN` e `DB_MAX`)

- **Proposta: `DB_MIN = 30` e `DB_MAX = 80`** (critério do grupo, não norma).
  - 30 dB fica um pouco **abaixo** da menor referência para escola (35 dB da OMS e da NBR 10152:2017). Assim a escala cobre também "mais silencioso que o ideal".
  - 80 dB fica 15 dB **acima** do crítico (65), para o potenciômetro ter folga e mostrar "muito barulhento".
  - A faixa cobre todos os seeds (39 a 71 dB).
- **Do potenciômetro para dB** (ESP32, 0 a 4095): `dB = 30 + leitura × 50 / 4095`. A página do potenciômetro do Wokwi (verificada) fala em valores de 0 a 1023 no atributo `value` e não menciona o ESP32; a faixa 0 a 4095 vem da documentação da Espressif. **O Edge precisa confirmar no Wokwi.**
- Com essa escala, os limiares caem em posições redondas do botão:

| dB simulados | 40 | 45 | 55 | 65 |
|---|---:|---:|---:|---:|
| Posição do potenciômetro | 20 % (leitura 819) | 30 % (1229) | 50 % (2048) | 70 % (2867) |
| `indiceRuido` | 20 | 30 | 50 | 70 |

- **Lembrete: dB é logarítmico.** Por definição, `nível = 10 × log10(intensidade / intensidade de referência)`. Então +10 dB quer dizer intensidade **10 vezes** maior, e +3 dB, mais ou menos o **dobro**. O `indiceRuido` é linear **em dB**: índice 60 **não** é "o dobro de barulho" do índice 30. Por isso o índice se chama "intensidade do ruído" (100 = mais ruidoso), e não "qualidade" (CONTEXTO, §5.3).
- **Para o Edge:** a média móvel sobre a leitura do potenciômetro serve como suavização, mas não é LAeq (o LAeq é uma média da energia, não dos dB). Basta não chamar de LAeq.

---

## 5. Ocupação (% da capacidade sentada)

### 5.1 Não há norma

Não achei norma de "conforto de ocupação" para sala de estudo. **Isto é critério do grupo, não norma.** A única evidência que li:

- **Williams, P. N. "To Measure and Manage Space", *Indiana Libraries*, v. 15, n. 2, 1996. Verificado.** Ele cita um estudo de Schneekloth e Keable na Newman Library (Virginia Tech): "the Newman Library is perceived full when seating has reached the 50 percent capacity of people occupancy", com mochilas e livros ocupando as outras cadeiras. Ele mesmo avisa: "perception is an inexact guide". **O estudo original não li.**

### 5.2 A proposta e o porquê

- `taxa = 100 × ocupados / capacidade` (RN-01 a RN-03; a capacidade é 3 × mesas).
- **Atenção acima de 50 %:** passou da metade dos lugares, a sala já **parece cheia** para quem chega (Williams, 1996).
- **Crítico acima de 90 %:** praticamente lotada; sobra no máximo 1 lugar em cada 10. Na S01 (9 lugares), só 9 de 9 fica crítico; 8 de 9 (88,9 %) fica em atenção.
- **Faixa:** `baixo` abaixo de 35 % (cerca de 1 pessoa por mesa de 3); `alto` acima de 70 % (mais de 2 pessoas por mesa); `médio` entre os dois.
- Com as capacidades de 6, 9 e 12, nenhuma taxa possível cai exatamente em 35, 70 ou 90. A taxa de 50 % acontece (3 de 6, 6 de 12) e conta como **adequado** (comparação estrita).
- A ocupação por mesa (mesa com 0 para grupo, RN-06) **não** entra aqui. Ela é condição do ranking.

---

## 6. O resultado com os seeds fictícios (CONTEXTO, §7.6)

**[Dado fictício]** Os seeds não são medições. Não ajustei os números para eles; esta é a conferência.

| Sala | Temperatura | Luz | Ruído | Ocupação | Estado geral |
|---|---|---|---|---|---|
| S01 (exemplo do §6.3: 22,8 °C, 410 lux, 54 dB, `[1,2,0]`) | médio · adequado | médio · adequado | médio · **atenção** | 33 %: baixo · adequado | **amarelo** |
| S02 | 22: médio · adequado | 410: médio · adequado | 42: médio · adequado | 33 %: baixo · adequado | **verde** |
| S03 | 18: baixo · **atenção** | 920: **alto · adequado** | 71: alto · **crítico** | 100 %: alto · **crítico** | **vermelho** |
| S04 | 21: médio · adequado | 500: médio · adequado | 46: médio · **atenção** | 33 %: baixo · adequado | **amarelo** |
| S05 | 24: médio · adequado | 350: médio · adequado | 57: alto · **atenção** | 67 %: médio · **atenção** | **amarelo** |
| S06 | 19: baixo · **atenção** | 180: baixo · **crítico** | 61: alto · **atenção** | 56 %: médio · **atenção** | **vermelho** |
| S07 | 23: médio · adequado | 450: médio · adequado | 39: baixo · adequado | 11 %: baixo · adequado | **verde** |
| S08 | 25: médio · adequado | 600: médio · adequado | 53: médio · **atenção** | 50 %: médio · adequado | **amarelo** |
| S09 | 28: alto · **crítico** | 760: **alto · adequado** | 68: alto · **crítico** | 92 %: alto · **crítico** | **vermelho** |

**Comentário:**

- Das oito salas fictícias: **2 verdes** (S02, S07), **3 amarelas** (S04, S05, S08) e **3 vermelhas** (S03, S06, S09). O exemplo da S01 fica amarelo por causa do ruído.
- Os exemplos do pedido batem: a S03 com 18 °C fica em **atenção** (frio, mas dentro da NR-17), com 920 lux fica **alto · adequado** e com 71 dB fica **crítico**; a S06 com 180 lux fica **crítica** (abaixo dos 200 lux da NHO 11); a S09 com 28 °C e 11 de 12 lugares fica **crítica** nos dois.
- Aparecem as três faixas em todos os indicadores, e as três severidades em temperatura, ruído e ocupação.
- **Luz:** nenhum seed cai em atenção (nenhum está entre 200 e 300 lux nem acima de 2000), e a **luz demais** nunca aparece. Para testar, o Edge pode levar o controle do LDR da S01 acima de 2000 lux no Wokwi, e os testes do Vitest devem ter casos nos limites (200, 300, 2000 e 3000 lux).
- O **ruído** é o indicador que mais aparece em atenção (5 das 9 salas, contando o exemplo da S01). É coerente: 45 dB é um teto de biblioteca, e conversa normal fica perto de 50 dB(A) (OMS).
- Casos de limite para os testes (iguais em JavaScript, C++ e Python): 18, 21, 25 e 26 °C; 200, 300, 750, 2000 e 3000 lux; 40, 45, 55 e 65 dB; 35, 50, 70 e 90 %.

---

## 7. Alternativas para o grupo escolher

| Mudança | De onde vem | O que muda nos seeds |
|---|---|---|
| Luz: atenção abaixo de **500** (e não 300) | NHO 11, biblioteca, "área de leitura: 500" | S02, S05, S07 e o exemplo da S01 passam para atenção na luz; **nenhuma sala fica verde** (das oito fictícias: 0 verdes, 5 amarelas, 3 vermelhas) |
| Luz: aplicar a tolerância de 10 % da NHO 11 (270 e 180 lux) | NHO 11, item 5 | a S06 (180 lux) passa de crítico para atenção na luz (180 não é menor que 180) e a sala fica amarela, porque os outros indicadores dela estão só em atenção |
| Ruído: adequado até **50** dB | NBR 10152:1987, "salas de aula": 40 a 50 dB(A) | a S04 (46 dB) fica verde; a S08 (53) e a S01 (54) continuam amarelas |
| Ruído: adequado até **40** dB | NBR 10152:2017, biblioteca, RLAeq 40, sem a tolerância | a S02 (42 dB) fica amarela; sobra só a S07 verde |
| Ocupação: atenção acima de **70 %** | geometria (mais de 2 por mesa), sem fonte externa | a S05 e a S06 saem da atenção na ocupação; o estado geral delas não muda |
| Temperatura: atenção também acima de **24 °C** | NBR 16401-2:2008, zona de inverno até 24,0 °C | a S08 (25 °C) entra em atenção na temperatura; o estado geral dela não muda (já é amarela) |
| Luz demais sem crítico (`criticoAcima = null`) | o próprio autor do UDI diz "no fixed rules" | nada nos seeds; no Wokwi, luz demais só acenderia o amarelo |

---

## 8. O que precisa integrar com o resto do grupo

| Quem | O que fazer com esta tabela |
|---|---|
| **Grupo (G.1)** | Aprovar ou mudar os números do §1 e as escolhas do §7, a unidade `lux_estimado` e a escala 30 a 80 dB. Depois de aprovada, a tabela entra no CONTEXTO, §5.2 (quem atualiza o CONTEXTO é o grupo). |
| **Edge** | Usar as mesmas constantes no C++; a regra dos LEDs (RN-08) e o estado de falha à parte; a conversão do LDR para lux no ESP32 (§3.3) e a do potenciômetro para dB (§4.4), testadas no Wokwi; mandar `light_unit = "lux_estimado"` e `noise_db_simulated` para o Supabase (CONTEXTO, §6.3). A histerese, se houver, é do Edge e não muda a tabela. |
| **Python e Matemática** | Usar a mesma tabela e a mesma regra estrita (`<` e `>`). |
| **UX** | Os rótulos "dB simulados" e "lux estimado"; mostrar faixa e severidade separadas, com texto além da cor. |
| **Web (nós)** | Depois da aprovação: trocar os provisórios de `web/src/domain/limiares.js`, atualizar os testes e o REGRAS_E_LIMIARES.md, §3. |
| **Todos** | Testar a **equivalência** entre C++, JavaScript e Python com os casos de limite do §6 (CONTEXTO, §5.2, sugestão). |

---

## 9. As fontes

| # | Fonte | Link | O que diz (trecho ou valor) | Verificada? |
|---|---|---|---|---|
| 1 | NR-17, Ergonomia (redação da Portaria MTP nº 423/2021; texto consolidado no gov.br, que lista até a Portaria MTP nº 4.219/2022) | https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-17-atualizada-2023.pdf | 17.8.3 (iluminação pela NHO 11); 17.8.4 (atividade intelectual: conforto acústico e térmico); 17.8.4.1.1 (ruído pelas normas técnicas); 17.8.4.1.2 (até 65 dB(A) nos demais casos); 17.8.4.2 (18 a 25 °C em ambientes climatizados) | sim |
| 2 | Página da NR-17 no gov.br (versões e portarias) | https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-17-nr-17 | link do PDF vigente e das portarias anteriores | sim |
| 3 | Fundacentro, NHO 11 (2018), cópia da biblioteca da Unicesumar | https://www.unicesumar.edu.br/biblioteca/wp-content/uploads/sites/50/2019/06/NHO-11_f.pdf | Quadro 1: sala de aulas 300; área de leitura de biblioteca 500; sala comum de estudantes 200; tarefa contínua no mínimo 200 lux; tolerância de 10 % | sim (cópia; o site da Fundacentro não abri) |
| 4 | ABNT NBR ISO/CIE 8995-1:2013 | (norma paga) | — | **não** |
| 5 | Prado, E. W. C., TCC de Engenharia Civil da UTFPR (Toledo), 2019 | https://repositorio.utfpr.edu.br/jspui/bitstream/1/25028/1/iluminanciasalasaulaescolas.pdf | pela NBR 8995-1:2013, salas de aula com "300 lux na tarefa e 200 lux no entorno imediato"; UGR 19 | sim (secundária) |
| 6 | Mardaljevic, J., slides do 5º Radiance Workshop, 2006 | https://www.radiance-online.org/community/workshops/2006-leicester/Presentations/MardaljevicCBnDCs.pdf | UDI de 100 a 2000 lux; perto de 2000 lux as persianas eram fechadas; acima, ganho solar e ofuscamento | sim |
| 7 | Mardaljevic, J., fórum do Radiance, 11/12/2012 | https://discourse.radiance-online.org/t/udi-upper-limits/2808 | 2000 "a little too conservative"; 100, 300 e 3000 (ou 4000?) lux; "UDI -- no fixed rules" | sim |
| 8 | Pattern Guide, "Useful Daylight Illuminance" | https://patternguide.advancedbuildings.net/using-this-guide/analysis-methods/useful-daylight-illuminance | faixas 0–100, 100–2000 e acima de 2000; debate sobre o teto de 2000 | sim (secundária) |
| 9 | Nabil e Mardaljevic, artigos originais do UDI (2005 e 2006) | (não abertos) | — | **não** |
| 10 | Sollo Engenharia, "Condições de conforto térmico conforme a NBR 16401" | https://www.solloengenharia.com.br/publicacoes/informacoes-tecnicas/14/condicoes-de-conforto-termico-conforme-a-nbr-16401-da-abnt/ | NBR 16401-2:2008: verão 22,5–25,5 °C (UR 65 %) e 23,0–26,0 °C (UR 35 %); inverno 21,0–23,5 °C (UR 60 %) e 21,5–24,0 °C (UR 30 %); 1,0 a 1,2 met | sim (secundária) |
| 11 | Catálogo normas.com.br, NBR 16401-2 | https://www.normas.com.br/visualizar/abnt-nbr-nm/27423/abnt-nbr16401-2-instalacoes-de-condicionamento-de-ar-sistemas-centrais-e-unitarios-parte-2-parametros-de-conforto-termico | nova edição em 11/2024, 86 páginas; a página diz "Vigente" e também "cancelada" | sim |
| 12 | ABNT, 2º Projeto de Revisão da NBR 16401-2 (nov. 2023), hospedado pelo LabEEE/UFSC | https://labeee.ufsc.br/sites/default/files/P_ABNTNBR16401-2_2023CN2.pdf | "não tem valor normativo"; conformidade se −0,5 < PMV < +0,5; não aplicar só com a temperatura de bulbo seco | sim |
| 13 | ABNT NBR 16401-2:2008 e a edição de 11/2024 (o texto) | (normas pagas) | — | **não** |
| 14 | ASHRAE Standard 55 | https://webstore.ansi.org/standards/ASHRAE/ansiashraestandard552023 | (a página devolveu erro 403) | **não** |
| 15 | Medição de Ruídos, "Norma NBR 10152" | https://medicaoderuidos.com.br/norma-nbr10152/ | NBR 10152:2017 (Errata 1:2020): salas de aula 35/40/30; bibliotecas 40/45/35 | sim (secundária) |
| 16 | Volk do Brasil, "Níveis de ruído NBR 10152" | https://blog.volkdobrasil.com.br/niveis-de-ruido-nbr-10152/ | os mesmos valores; tolerância de até 5 dB | sim (secundária) |
| 17 | ABNT NBR 10152:2017 (o texto) | (norma paga) | — | **não** |
| 18 | ABNT NBR 10152:1987 (edição antiga), cópia num site da Prefeitura de João Pessoa | http://antigo.joaopessoa.pb.gov.br/portal/wp-content/uploads/2015/02/NBR_10152-1987-Conforto-Ac_stico.pdf | Escolas: bibliotecas 35–45 dB(A); salas de aula 40–50; circulação 45–55; o valor inferior é "conforto", o superior é "aceitável" | sim (edição substituída) |
| 19 | OMS, *Guidelines for Community Noise* (1999), ficha do documento | https://www.who.int/publications-detail-redirect/a68672 | título, 1999, 141 páginas | sim |
| 20 | OMS, *Guidelines for Community Noise*, capítulo 4 (cópia arquivada do site da OMS) | https://web.archive.org/web/2005/http://www.who.int/docstore/peh/noise/Commnoise4.htm | sala de aula: "should not exceed 35 dB LAeq during teaching sessions"; voz casual de cerca de 50 dB(A) a 1 m | sim |
| 21 | Quality Planning (Nova Zelândia), "WHO Guidelines for Specific Environments" | https://qualityplanning.org.nz/node/832 | a mesma linha da tabela da OMS: 35 dB, "during class" | sim (secundária) |
| 22 | Wokwi, "Photoresistor (LDR) Sensor Module" | https://docs.wokwi.com/parts/wokwi-photoresistor-sensor | fórmula da leitura para lux; GAMMA 0,7 e RL10 50; tabela de 0,1 a 100.000 lux; `isfinite(lux)`; resistor de 10 kΩ | sim |
| 23 | Wokwi, "Potentiometer" | https://docs.wokwi.com/parts/wokwi-potentiometer | `value` de 0 a 1023; pino SIG em uma entrada analógica; não fala do ESP32 | sim |
| 24 | Wokwi, "DHT22" | https://docs.wokwi.com/parts/wokwi-dht22 | começa em 24 °C e 40 %; não informa a faixa; recomenda a biblioteca "DHT sensor library for ESPx" | sim |
| 25 | Espressif, Arduino-ESP32, ADC | https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html | "Default is 12 bits (range from 0 to 4095)"; 11 dB: de 150 a 3100 mV; `analogReadMilliVolts()` | sim |
| 26 | Williams, P. N., *Indiana Libraries*, v. 15, n. 2, 1996 | https://journals.indianapolis.iu.edu/index.php/IndianaLibraries/article/download/16722/pdf_187/23642 | biblioteca "perceived full" com 50 % dos lugares ocupados (citando Schneekloth e Keable) | sim |
| 27 | Schneekloth e Keable (o estudo original) | (não aberto) | — | **não** |

---

## 10. O que não foi verificado

- O texto oficial da **ABNT NBR ISO/CIE 8995-1:2013** (é paga). Os valores vêm da NHO 11 e do TCC da UTFPR.
- O texto oficial da **ABNT NBR 10152:2017** e da Errata 1:2020 (é paga). Os valores vêm de dois sites secundários. A tolerância de 5 dB só aparece num deles.
- O texto da **ABNT NBR 16401-2:2008** (os valores das zonas são de fonte secundária) e o conteúdo da **edição de 11/2024**, que o catálogo mostra ao mesmo tempo como vigente e como cancelada.
- A **ASHRAE 55-2023** (é paga; a página da ANSI deu erro 403).
- Se as **diretrizes da OMS de 2018** para a Europa mudam algo nos 35 dB para sala de aula.
- Os artigos originais do **UDI** (Nabil e Mardaljevic, 2005 e 2006) e o estudo original de **Schneekloth e Keable**.
- A NHO 11 no **site da Fundacentro** (li uma cópia da biblioteca da Unicesumar).
- O que a "sala de leitura" do quadro da NHO 11 quer dizer: ela aparece junto de "quadro negro" e "mesa de demonstração", e pode ser a tradução de outro tipo de sala. Não conferi o original em inglês, e por isso não usei esse item.
- Como o **Wokwi simula o ADC do ESP32** (12 bits e 3,3 V) para o LDR e o potenciômetro. A fórmula adaptada (§3.3) e as leituras esperadas (§3.3 e §4.4) foram calculadas, não testadas no Wokwi.
