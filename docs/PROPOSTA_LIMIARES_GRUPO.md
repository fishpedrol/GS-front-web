# Proposta: a tabela única de limiares

**De:** Felipe (Front-end e Web Development) · 08/11/2026
**Para:** Edge, Python e Matemática (e quem fizer os slides)
**Pedido:** aprovar ou mudar até **quarta, 11/11**.

O CONTEXTO (§5.2) pede "uma tabela única de critérios", a mesma no ESP32 (os LEDs), no Python, na Matemática, nos slides e no site. Hoje ela está "a definir". Esta é uma **proposta**, com a fonte de cada número. Até vocês aprovarem, o site usa estes números marcados como **provisórios**.

## 1. A tabela

| Indicador | Adequado | Atenção | Crítico | Faixa: baixo / médio / alto |
|---|---|---|---|---|
| Temperatura (°C) | 21 a 25 | 18 até menos de 21, ou acima de 25 até 26 | abaixo de 18 ou acima de 26 | abaixo de 21 / 21 a 26 / acima de 26 |
| Luz (lux estimado) | 300 a 2000 | 200 até menos de 300, ou acima de 2000 até 3000 | abaixo de 200 ou acima de 3000 | abaixo de 300 / 300 a 750 / acima de 750 |
| Ruído (dB simulados) | até 45 | acima de 45 até 65 | acima de 65 | abaixo de 40 / 40 a 55 / acima de 55 |
| Ocupação (% dos lugares) | até 50 | acima de 50 até 90 | acima de 90 | abaixo de 35 / 35 a 70 / acima de 70 |

Os mesmos números, como constantes (para copiar no C++ e no Python):

| Indicador | limiteBaixo | limiteAlto | criticoAbaixo | atencaoAbaixo | atencaoAcima | criticoAcima |
|---|---:|---:|---:|---:|---:|---:|
| temperatura | 21 | 26 | 18 | 21 | 25 | 26 |
| luz | 300 | 750 | 200 | 300 | 2000 | 3000 |
| ruido | 40 | 55 | — | — | 45 | 65 |
| ocupacao | 35 | 70 | — | — | 50 | 90 |

"—" quer dizer que aquele lado não alerta: pouco ruído e sala vazia não são problema. Já frio e escuro demais alertam (RN-09).

## 2. A regra (igual para todos)

- **Faixa** (onde o valor está; não diz se é bom): `baixo` se `v < limiteBaixo`; `alto` se `v > limiteAlto`; senão `medio`.
- **Severidade** (se a sala está boa para usar): `critico` se passou de um limite crítico; senão `atencao` se passou de um limite de atenção; senão `adequado`.
- **As comparações são estritas** (`<` e `>`): o próprio limite fica do lado de dentro. 18 °C é atenção (não crítico); 25 °C, 45 dB e 50 % são adequados.
- **Ocupação:** `taxa = 100 × pessoas / (3 × mesas)`. A S01 tem 9 lugares.

## 3. Os LEDs (RN-08)

1. **Falha** primeiro: sensor com erro, sem leitura ou leitura impossível → o comportamento de erro (ex.: vermelho piscando e a mensagem no Serial). **Nunca verde por falta de leitura.**
2. **Vermelho:** pelo menos um indicador crítico.
3. **Amarelo:** nenhum crítico e pelo menos um em atenção.
4. **Verde:** todos adequados.

## 4. As escalas do ruído e da luz

**Ruído (dB simulados, do potenciômetro; não é dB(A) medido):**

- escala de **30 a 80 dB**: `dB = 30 + leitura × 50 / 4095` (ESP32, leitura de 0 a 4095; **o Edge confirma no Wokwi**);
- índice de 0 a 100 (100 = mais barulhento): `indice = arredondar(2 × (dB − 30))`, preso entre 0 e 100. O meio arredonda **para cima** (0,5 → 1). No Python, use `math.floor(x + 0.5)`, porque o `round()` dele arredonda para o par;
- os limites caem em posições redondas do botão: 40 dB = 20 %, 45 = 30 %, 55 = 50 %, 65 = 70 %;
- o dB é logarítmico: índice 60 **não** é o dobro de barulho do índice 30.

**Luz (`lux_estimado`):** o fotorresistor do Wokwi trabalha em lux e a documentação dele dá a conversão. Para o ESP32 (3,3 V, 12 bits), a conta adaptada é **calculada, ainda não testada no Wokwi**:

```text
tensao      = leitura / 4095 × 3,3
resistencia = 10000 × tensao / (3,3 − tensao)
lux         = (50 × 1000 × 10^0,7 / resistencia)^(1 / 0,7)
```

| Lux | 200 | 300 | 500 | 750 | 2000 | 3000 |
|---|---:|---:|---:|---:|---:|---:|
| Leitura esperada no ESP32 | 1558 | 1295 | 1001 | 802 | 447 | 346 |

Menos leitura = **mais** luz. Com muita luz a conta pode dar infinito (a documentação do Wokwi sugere `isfinite`).

**Leitura impossível = erro de leitura**, e a sala vai para falha: temperatura fora de −40 a 80 °C (faixa do DHT22 no datasheet, a confirmar), luz negativa ou acima de 100.000 lux, ruído fora de 30 a 80.

## 5. O que cada um precisa fazer

| Quem | O quê |
|---|---|
| **Edge** | as mesmas constantes e a regra estrita no C++; os LEDs da seção 3; testar as conversões no Wokwi; mandar para o Supabase: `occupancy_by_table` com 3 números inteiros de 0 a 3, números com **ponto** decimal, `light_unit = "lux_estimado"`, `noise_db_simulated` entre 30 e 80, e `device_status` em minúsculas (`"ok"`, `"sensor_error"` ou `"offline"`); dizer de quanto em quanto tempo o ESP32 envia (o site usa isso para mostrar "Desatualizado") |
| **Python** | a mesma tabela e a regra estrita; o índice de ruído com `math.floor(x + 0.5)` |
| **Matemática** | a mesma tabela; a taxa de ocupação com a capacidade da S01 (9 lugares) |
| **Todos** | conferir se o C++, o Python e o site dão o mesmo resultado nos casos de borda: 18, 21, 25 e 26 °C; 200, 300, 750, 2000 e 3000 lux; 40, 45, 55 e 65 dB; 35, 50, 70 e 90 % |
| **Slides e telas** | "dB simulados" e "lux estimado" sempre escritos; faixa e severidade mostradas separadas, com texto além da cor |

## 6. A conferência com as salas fictícias

Com as leituras fictícias do CONTEXTO (§7.6), que **não são medições**: **2 verdes** (S02, S07), **3 amarelas** (S04, S05, S08) e **3 vermelhas** (S03, S06, S09). O exemplo da S01 (§6.3: 22,8 °C, 410 lux, 54 dB, `[1, 2, 0]`) fica **amarelo** por causa do ruído. Os números não foram ajustados para dar esse resultado.

Junto desta página vai o `salas_para_o_grupo.json`: as nove salas e as leituras fictícias, para todos usarem os mesmos números.

## 7. Se quiserem mudar

- Luz: atenção abaixo de **500** (o ideal de leitura de biblioteca, NHO 11) → nenhuma sala fictícia fica verde.
- Ruído: adequado até **50** dB (sala de aula, NBR 10152:1987) → a S04 fica verde.
- Ocupação: atenção só acima de **70 %** → a S05 e a S06 saem da atenção na ocupação (o estado delas não muda).

## 8. As fontes

As normas foram escritas para **locais de trabalho** ou para **projeto de prédios**, não para sala de estudo. Servem de referência. As leituras do projeto são simuladas (Wokwi) ou fictícias.

- **NR-17**, itens 17.8.3, 17.8.4.1.2 e 17.8.4.2 (PDF oficial, gov.br): <https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-17-atualizada-2023.pdf>
- **NHO 11 (Fundacentro, 2018)**, Quadro 1 e item 5 (cópia da biblioteca da Unicesumar): <https://www.unicesumar.edu.br/biblioteca/wp-content/uploads/sites/50/2019/06/NHO-11_f.pdf>
- **NBR ISO/CIE 8995-1:2013**, por fonte secundária (Prado, TCC da UTFPR, 2019): <https://repositorio.utfpr.edu.br/jspui/bitstream/1/25028/1/iluminanciasalasaulaescolas.pdf>
- **UDI (Mardaljevic)**, slides de 2006 e fórum de 2012: <https://www.radiance-online.org/community/workshops/2006-leicester/Presentations/MardaljevicCBnDCs.pdf> e <https://discourse.radiance-online.org/t/udi-upper-limits/2808>
- **NBR 16401-2:2008**, por fonte secundária (Sollo Engenharia): <https://www.solloengenharia.com.br/publicacoes/informacoes-tecnicas/14/condicoes-de-conforto-termico-conforme-a-nbr-16401-da-abnt/>
- **NBR 10152:1987** (edição antiga; cópia no site da Prefeitura de João Pessoa): <http://antigo.joaopessoa.pb.gov.br/portal/wp-content/uploads/2015/02/NBR_10152-1987-Conforto-Ac_stico.pdf>
- **NBR 10152:2017**, por fonte secundária: <https://medicaoderuidos.com.br/norma-nbr10152/>
- **Ocupação:** Williams, *Indiana Libraries*, 1996 (biblioteca "perceived full" com 50 % dos lugares): <https://journals.indianapolis.iu.edu/index.php/IndianaLibraries/article/download/16722/pdf_187/23642>
- **Wokwi**, fotorresistor e potenciômetro: <https://docs.wokwi.com/parts/wokwi-photoresistor-sensor> e <https://docs.wokwi.com/parts/wokwi-potentiometer>
- **Espressif**, ADC do ESP32 (12 bits, 0 a 4095): <https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html>

**Não lidas** (são pagas): o texto da NBR ISO/CIE 8995-1:2013, da NBR 10152:2017, da NBR 16401-2 (2008 e 2024) e da ASHRAE 55. A ocupação **não tem norma**: é critério do grupo.

## 9. Como responder

Responda com **"aprovado"** ou com o número que quer mudar e o motivo, até **11/11**. Depois de aprovada, a tabela entra no CONTEXTO, §5.2, e cada parte troca os seus números provisórios pelos aprovados.
