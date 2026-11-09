---
name: Painel de Salas
description: As nove salas de estudo lidas de relance, como um painel de embarque.
colors:
  noite: "oklch(0.165 0.026 258)"
  moldura: "oklch(0.2 0.027 258)"
  placa: "oklch(0.235 0.024 258)"
  placa-alta: "oklch(0.275 0.024 258)"
  junta: "oklch(0.13 0.022 258)"
  regua: "oklch(0.335 0.022 258)"
  regua-forte: "oklch(0.42 0.022 258)"
  tinta: "oklch(0.955 0.012 85)"
  tinta-2: "oklch(0.8 0.018 250)"
  tinta-3: "oklch(0.68 0.02 250)"
  melhor: "oklch(0.88 0.165 95)"
  melhor-tinta: "oklch(0.2 0.04 95)"
  ok: "oklch(0.8 0.15 152)"
  atencao: "oklch(0.79 0.15 62)"
  critico: "oklch(0.72 0.18 25)"
  falha: "oklch(0.72 0.02 250)"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.4rem"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "Barlow Condensed, Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.03em"
  title:
    fontFamily: "Barlow Condensed, Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  numeral:
    fontFamily: "Barlow Condensed, Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  body:
    fontFamily: "Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  body-sm:
    fontFamily: "Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  control:
    fontFamily: "Barlow Condensed, Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
  label:
    fontFamily: "Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.1em"
rounded:
  seat: "2px"
  palheta: "3px"
  mesa: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  "1": "4px"
  "1-5": "6px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "10": "40px"
components:
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.noite}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.tinta-2}"
  button-secondary:
    backgroundColor: "{colors.placa}"
    textColor: "{colors.tinta-2}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 14px"
  button-secondary-hover:
    textColor: "{colors.tinta}"
  button-secondary-pressed:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.noite}"
  button-quiet:
    textColor: "{colors.tinta-2}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 12px"
  button-quiet-hover:
    backgroundColor: "{colors.placa}"
    textColor: "{colors.tinta}"
  button-danger:
    backgroundColor: "{colors.critico}"
    textColor: "{colors.noite}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 12px"
  icon-toggle:
    textColor: "{colors.tinta-3}"
    rounded: "{rounded.md}"
    size: "40px"
  icon-toggle-on:
    backgroundColor: "{colors.placa-alta}"
    textColor: "{colors.tinta}"
  input:
    backgroundColor: "{colors.noite}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 12px"
  palheta:
    backgroundColor: "{colors.placa-alta}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.palheta}"
  palheta-melhor:
    backgroundColor: "{colors.melhor}"
    textColor: "{colors.melhor-tinta}"
    rounded: "{rounded.palheta}"
  linha-sala:
    backgroundColor: "{colors.placa}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "16px"
  quadro:
    backgroundColor: "{colors.moldura}"
    rounded: "{rounded.lg}"
  chip-sala:
    backgroundColor: "{colors.placa}"
    textColor: "{colors.tinta}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "4px 4px 4px 10px"
---

# Design System: Painel de Salas

## Overview

**Creative North Star: "O Painel de Embarque"**

As salas são as partidas de um saguão de aeroporto ou rodoviária, à noite. Cada sala é uma linha-placa que se lê de relance, da esquerda para a direita: posição, código em palhetas, mesas, clima, situação, ações. O mundo é escuro e fosco (azul-noite com placas um tom acima), a letra é branca-quente e condensada, e todo número fica em coluna tabular. A densidade é de painel, não de página: muita informação por linha, nenhuma decoração que não seja parte da máquina.

A cor é reservada. O fundo e a tinta fazem quase tudo; a cor aparece só onde carrega estado. O amarelo pertence a uma única sala por vez, a melhor para a atividade escolhida, como a perna ativa num mapa de percurso. Verde, laranja e vermelho são exclusivos da situação e das leituras, e nunca aparecem sem palavra e símbolo ao lado. Profundidade vem do tom (noite, moldura, placa, placa alta) e da junta escura que corta cada palheta ao meio, não de sombras de cartão.

O sistema recusa o dashboard SaaS de cards brancos com sombra. No celular a linha vira um cartão empilhado com borda de régua; a partir de 1280 px o painel vira uma grade única, com a armadura das colunas visível em réguas de um pixel do dispositivo. O movimento é mecânico e raro: a palheta vira só quando um valor muda, e as linhas descem em escalonamento só quando a atividade muda. Tudo desliga com `prefers-reduced-motion`.

**Key Characteristics:**
- Fundo azul-noite com camadas tonais, nunca branco, nunca sombra de cartão.
- Palheta split-flap como unidade de exibição: código da sala, posição, relógio, situação e o título da entrada.
- Letra condensada (Barlow Condensed para o painel, Barlow Semi Condensed para o texto) e numerais tabulares em tudo que é número.
- Amarelo só na melhor sala; cor de estado sempre acompanhada de ícone e palavra.
- Grade de colunas visível no painel largo, com réguas de 1 pixel do dispositivo.

## Colors

Uma paleta quase monocromática em azul-noite e branca-quente, com cinco cores de estado que só aparecem onde há estado. Os valores canônicos estão em OKLCH (definidos no `@theme` do `web/src/index.css`), para que a claridade e o contraste fiquem previsíveis.

### Primary
- **Amarelo de Partida** (`melhor`): só a sala em 1º lugar no ranking da atividade escolhida. Pinta a palheta da posição (com a tinta escura `melhor-tinta` por cima), a borda e o contorno da linha (a 80%), um véu de fundo de 8% no cartão do celular e as palavras "Melhor agora". Em nenhum outro lugar, nem em seleção de texto, foco ou cursor.
- **Tinta de Partida** (`melhor-tinta`): o texto escuro sobre o amarelo.

### Secondary (estado)
- **Verde de Embarque** (`ok`): leitura adequada, situação verde, mesa totalmente livre (borda da mesa e palavra "livre"), contagem de mesas livres quando maior que zero.
- **Laranja de Atenção** (`atencao`): leitura em atenção, dado desatualizado, API sem resposta, avisos da página (borda a 50% sobre a moldura).
- **Vermelho Crítico** (`critico`): leitura crítica, erro de login, confirmação de exclusão (fundo a 10%) e o botão destrutivo.
- **Cinza Sem Leitura** (`falha`): leitura inválida, dispositivo offline ou sensor com falha. É um cinza azulado de propósito: a ausência de dado não é um alarme.

### Neutral
- **Noite** (`noite`): o fundo da página, do `html` e dos campos de texto (o campo é um "buraco" no painel). O `theme-color` e o favicon usam o mesmo tom em hex (#0f1626).
- **Moldura** (`moldura`): o cabeçalho, a caixa do painel largo, o painel de filtros, o formulário de entrada, as listas, os avisos e o estado vazio.
- **Placa** (`placa`): o fundo fosco de cada linha de sala e dos botões de atalho em repouso.
- **Placa Alta** (`placa-alta`): o estado ligado de controles (favorita, sala em lista, filtros abertos) e o hover dos botões pequenos.
- **Junta** (`junta`): o tom mais escuro do sistema, o corte entre as metades da palheta.
- **Régua** (`regua`): toda borda e divisória em repouso, a grade das colunas e a borda dos cartões no celular.
- **Régua Forte** (`regua-forte`): a borda em hover, a borda tracejada dos blocos de demonstração e vazios, a barra de rolagem.
- **Tinta** (`tinta`): o texto principal, branco-quente (matiz 85). Também é o preenchimento do botão primário, do atalho pressionado, dos contadores, da seleção de texto, do cursor e do anel de foco.
- **Tinta 2** (`tinta-2`): texto secundário (descrições, unidades, motivos do ranking, botões em repouso) e o hover do botão primário.
- **Tinta 3** (`tinta-3`): rótulos, metadados, cabeçalhos de coluna e ícones em repouso.

### Named Rules
**The Uma Sala Amarela Rule.** O amarelo marca uma única sala por tela, a 1ª do ranking. Se nenhuma atividade está escolhida, não há amarelo nenhum. Seleção, foco e cursor usam a tinta, nunca o amarelo.

**The Cor Que Carrega Estado Rule.** Verde, laranja, vermelho e cinza só aparecem em situação, leitura, frescor, mesa livre e erro, e sempre ao lado de um ícone e de uma palavra ("Adequado", "Atenção", "Crítico", "Sem leitura"). Quem não distingue cores lê a palavra e vê a forma.

**The Ilha Fosca Rule.** O fundo nunca é branco nem claro. A hierarquia de superfícies sobe em passos curtos de claridade: noite, moldura, placa, placa alta.

## Typography

**Display Font:** Barlow Condensed (com Barlow Semi Condensed, ui-sans-serif, system-ui)
**Body Font:** Barlow Semi Condensed (com ui-sans-serif, system-ui)

**Character:** Uma família só, em duas larguras. A Condensed é a voz do painel (títulos, palhetas, numerais, rótulos de controle), sempre em caixa alta com espaçamento aberto; a Semi Condensed é a voz da explicação, legível em parágrafos curtos. As fontes vêm empacotadas pelo `@fontsource` (Semi Condensed 400 a 700, Condensed 500 a 700), sem depender de site externo.

### Hierarchy
- **Display** (Condensed 700, 2.6rem no celular, 3.6rem a partir de 640px, 4.4rem a partir de 1024px, line-height 1): só o título da tela de entrada, letra a letra em palhetas.
- **Headline** (Condensed 700, 2rem; 2.25rem no painel largo, line-height 1, caixa alta, 0.03em): o título da página do painel.
- **Title** (Condensed 700, 1.5rem, caixa alta, 0.04em): o nome no cabeçalho e o título das listas; 1.25rem para o título do formulário.
- **Numeral** (Condensed 600, 1.5rem, line-height 1, tabular): o valor de cada leitura (temperatura, luz, ruído). O código da sala, o relógio e a posição usam palhetas em 1.125rem a 1.25rem, 700.
- **Body** (Semi Condensed 400, 1rem, line-height 1.45): texto corrido e campos. Linhas limitadas a 36 a 62ch.
- **Body small** (400 a 500, 0.875rem): metadados, origem do dado, motivos do ranking, botões silenciosos. É o tamanho mais usado da interface.
- **Control** (Condensed 600, 0.95rem a 1rem, caixa alta, 0.05em; 700 e 1.125rem no botão de entrar): os atalhos de atividade, o botão de filtros e o botão primário.
- **Label** (Semi Condensed 500 a 600, 0.75rem, caixa alta, 0.08em a 0.1em, tinta 3): cabeçalhos das colunas, o rótulo das leituras no celular e o "Agora" do relógio. A situação na palheta usa 0.95rem, 600, caixa alta, 0.07em.

### Named Rules
**The Coluna Tabular Rule.** Todo número que se compara com outro (leituras, contagens, hora, posição, pontos, matrícula) leva `font-variant-numeric: tabular-nums lining-nums`. Números em coluna não dançam quando mudam.

**The Duas Larguras Rule.** Caixa alta e Condensed para o que o painel exibe; Semi Condensed em caixa normal para o que o painel explica. Parágrafo em caixa alta não existe.

## Layout

Página com contêiner máximo de 90rem (72rem na entrada), margem lateral de 16px (24px a partir de 640px) e ritmo na escala de 4px do Tailwind: 6px entre peças irmãs pequenas (mesas, chips, atalhos), 12px entre linhas e campos, 16 a 20px entre blocos, 40px antes das listas.

O painel tem duas formas. Até 1279px, cada sala é um cartão empilhado numa grade de três colunas (posição ou sala, conteúdo, situação e ações), com as três leituras numa faixa inferior separada por régua; 12px entre cartões. A partir de 1280px (`xl`), o painel vira uma tabela de faixas: uma grade de colunas fixa compartilhada pelo cabeçalho e pelas linhas (posição 3.5rem, sala, mesas, temperatura, luz, ruído, situação, ações), células com 64px de altura mínima, régua à esquerda de cada célula e régua embaixo de cada linha. A coluna de posição só existe quando há ranking.

Os atalhos de atividade e a barra de filtros dividem a mesma linha, para o painel começar alto na tela. No celular os atalhos viram uma grade de 2 colunas. Alvos de toque têm 40 a 44px. A entrada usa duas colunas a partir de 1024px (texto 1.15fr, formulário até 26rem).

**The Armadura Visível Rule.** No painel largo, a grade das colunas é estrutura exposta: réguas de 1px, que viram 0.5px em telas 2x para medir um pixel do dispositivo. Cabeçalho e linhas leem da mesma definição de colunas; nunca desalinham.

## Elevation & Depth

O sistema é plano e tonal. Não há sombra de cartão em lugar nenhum: a profundidade vem dos passos de claridade (noite, moldura, placa, placa alta) e das réguas. A única sombra é material e pertence à palheta: um lábio escuro de 1px embaixo e um brilho interno de 1px em cima, que fazem a peça parecer uma lâmina física. Os campos de texto descem para a noite, um tom abaixo da moldura que os contém.

### Shadow Vocabulary
- **Lábio da palheta** (`box-shadow: 0 1px 0 oklch(0.1 0.02 258), inset 0 1px 0 oklch(0.36 0.024 258 / 0.6)`): só na palheta, nunca em cartões, botões ou painéis.

### Named Rules
**The Sem Sombra de Cartão Rule.** Superfícies não flutuam. Uma superfície que precisa se destacar sobe um passo de tom ou ganha borda de régua; nunca ganha `box-shadow`.

## Shapes

Cantos pequenos e mecânicos. Cartões, botões, campos e chips usam 6px; caixas maiores (painel largo, filtros, formulário, listas, estado vazio) usam 8px; a palheta usa 3px; a mesa 4px e cada lugar 2px. No painel largo as linhas perdem o canto e a borda e passam a ser faixas retas dentro da moldura de 8px. Círculo só nos contadores (insígnia de número). Bordas sempre de 1px em régua; tracejado em régua forte marca o que não é conteúdo real (o acesso de demonstração, o estado vazio).

A palheta é a silhueta do sistema: um bloco quase quadrado com uma junta horizontal escura no meio, feita com gradiente. A palheta de palavra (a situação) usa uma junta suave, porque com a junta forte uma palavra colorida parece riscada.

## Components

### Buttons
Diretos e de painel: caixa alta condensada nos controles principais, sem ícone decorativo.
- **Shape:** cantos de 6px, altura de 44px (40px nos secundários, 36px nos compactos das listas).
- **Primary:** fundo tinta, texto noite (entrar, limpar filtros no vazio, criar lista). Hover desce para tinta 2.
- **Secondary (atalho):** fundo placa, borda régua, texto tinta 2; hover leva a borda à régua forte e o texto à tinta. Pressionado (`aria-pressed`) inverte para fundo tinta e texto noite.
- **Quiet:** sem fundo, texto tinta 2 em 0.875rem; hover ganha fundo placa e texto tinta (Sair, Cancelar).
- **Outline:** borda régua, texto tinta, 0.875rem, hover com fundo placa (Minhas listas, Preencher para mim).
- **Danger:** fundo crítico, texto noite, só dentro de uma confirmação.
- **Focus:** anel de 2px em tinta com 2px de respiro, em todo elemento focável.
- **Transição:** cor em 150ms; nada mais se mexe no hover.

### Icon toggles
- Quadrados de 40px, borda régua, ícone de 19px em tinta 3. Ligado (favorita, sala em lista): borda tinta a 60%, fundo placa alta, ícone em tinta; a estrela fica preenchida. Um contador circular em tinta mostra em quantas listas a sala está.

### Chips
- **Style:** a sala numa lista: fundo placa (ou noite), borda régua, código em Condensed 600 tabular, nome em tinta 2, e um botão de remover de 28px.

### Cards / Containers
- **Corner Style:** 6px na linha de sala do celular; 8px nas caixas de moldura.
- **Background:** placa para linhas; moldura para caixas.
- **Shadow Strategy:** nenhuma (ver Elevation & Depth).
- **Border:** 1px régua; a melhor sala troca para amarelo a 80%.
- **Internal Padding:** 12px no celular, 16px a partir de 640px; 16 a 24px nas caixas.

### Inputs / Fields
- **Style:** fundo noite, borda régua, cantos 6px, altura 44px (40px nos filtros, 36px nos compactos), texto 1rem, placeholder tinta 3. Campos de número sem setinhas.
- **Focus:** a borda sobe para tinta 2, mais o anel de foco global.
- **Error:** mensagem em crítico com ícone de alerta, ligada por `aria-describedby`.
- **Checkbox:** 16px com `accent-color` na tinta.

### Navigation
- Cabeçalho em moldura com régua embaixo: nome em Title, relógio em palhetas no meio, e à direita a matrícula (tinta 3), o atalho Minhas listas com contagem e o Sair. No celular o relógio desce para uma linha própria.

### Palheta (signature)
A unidade de exibição do painel: um caractere (ou uma palavra) num bloco de 3px de canto, com gradiente vertical em azul de placa cortado ao meio por uma junta escura e o lábio de sombra. Usa Condensed com line-height 1. Aparece no código da sala (letra a letra, 3px entre palhetas), na marca de favorita, na posição do ranking, no relógio e no título da entrada. A posição da 1ª sala troca o gradiente por amarelo sólido. Quando um valor muda, o texto vira (`rotateX` de -82° a 0° em 320ms, `cubic-bezier(0.16, 1, 0.3, 1)`); no primeiro desenho, nada se mexe.

### Linha de sala (signature)
Tudo o que decide a sala, sem clicar: código em palhetas e nome, porte e número de mesas, origem e frescor do dado, o mapa das mesas, as três leituras (valor, unidade, severidade e faixa), a situação na palheta de palavra e as ações. Com atividade escolhida, uma faixa abaixo explica o porquê da posição ou "Não serve: ...". Ao trocar a atividade, as linhas entram de cima para baixo (6px, 240ms, 28ms de escalonamento por linha).

### Mapa das mesas
Cada mesa é um bloco de 4px de canto com três lugares de 10px: cheio em tinta 2 quando ocupado, vazado em tinta 3 a 70% quando vago. Mesa totalmente livre ganha borda verde e a palavra "livre"; no celular as outras mostram "1/3".

### Selo de origem
Sempre visível, em 0.875rem com ícone de 14px: "IoT simulado" em tinta, "Simulação local" em tinta 2, "Dados demonstrativos" em tinta 3; o frescor ao lado ("Atualizado às", "Desatualizado" em laranja, falhas em cinza).

## Do's and Don'ts

### Do:
- **Do** montar toda superfície nova com os passos noite, moldura, placa e placa alta, com borda de 1px em régua.
- **Do** escrever todo número comparável em numerais tabulares, e os valores do painel em Barlow Condensed.
- **Do** acompanhar toda cor de estado com um ícone SVG do conjunto (traço 1.75, cantos redondos) e uma palavra.
- **Do** usar a palheta para o que o painel exibe como identificador ou valor de painel (código, posição, hora, situação), e animar a virada só quando o valor muda.
- **Do** manter o anel de foco de 2px em tinta, com 2px de respiro, em todo controle.
- **Do** desligar a virada e a entrada das linhas com `prefers-reduced-motion: reduce`.
- **Do** usar a borda tracejada em régua forte só para o que não é conteúdo real (demonstração, vazio).

### Don't:
- **Don't** usar o amarelo em mais de uma sala, ou em qualquer coisa que não seja a melhor sala (nem link, nem foco, nem destaque de marca).
- **Don't** pôr sombra de cartão ou fundo branco em nenhuma superfície; a única sombra é o lábio da palheta.
- **Don't** mostrar estado só por cor, nem usar verde, laranja ou vermelho como decoração.
- **Don't** usar a junta forte numa palheta de palavra colorida; ela lê como texto riscado. Use a palheta de palavra.
- **Don't** usar emoji ou caractere como ícone; os ícones são SVG desenhados à mão.
- **Don't** animar a chegada do conteúdo no carregamento da página nem no hover; o movimento só conta que algo mudou. A única exceção é o pulso do esqueleto enquanto as salas carregam.
