# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (aplicação React + Vite + Tailwind, responsiva; o estudante abre no celular procurando sala, e o professor avalia no computador)

## Users

Estudantes universitários (FIAP, São Paulo) que querem achar, antes de se deslocar, uma sala boa para o que vão fazer: estudar sozinhos, trabalhar em grupo ou gravar um vídeo. Abrem com pressa, muitas vezes no celular, andando pelo campus. Não são especialistas em sensores. Também usam: os professores das disciplinas de Front-end e Web, que avaliam o protótipo e a clareza do que é real e do que é simulado.

## Product Purpose

Mostrar as nove salas numa página só, com ocupação total e por mesa, mesas totalmente livres, temperatura, luminosidade e ruído, e recomendar a melhor sala para a atividade escolhida (atalhos com ranking determinístico e filtros ajustáveis). A sala S01 recebe os dados de um ESP32 simulado no Wokwi pelo Supabase; as outras oito são fictícias e fixas. Favoritos e listas ficam só no navegador.

Sucesso: em poucos segundos o estudante sabe qual sala serve para ele agora, e nunca confunde dado simulado ou antigo com medição ao vivo.

## Positioning

"Escolher melhor onde estudar, com informação clara." Não é reserva de sala, não controla ar-condicionado nem luz, e não usa IA: informa e recomenda com regras que dá para explicar. O nome e a identidade visual ainda não foram decididos pelo grupo.

## Capabilities and Constraints

- React + Vite + JavaScript (sem TypeScript) + Tailwind CSS; no mínimo 8 componentes e 2 custom hooks (edital, p. 42).
- Os dados principais de cada sala aparecem no próprio card, sem precisar clicar. Não há tela de detalhe nem painel administrativo.
- Login com uma matrícula e senha fictícias fixas; sem cadastro.
- Origem e frescor sempre à vista: "IoT simulado" (S01), "Dados demonstrativos" (S02 a S09), "Atualizado às HH:MM", "Desatualizado", "Erro".
- Unidades sempre explícitas: °C, lux estimado (ou índice, a definir), dB **simulados**.
- Funciona no celular (a partir de 360 px) e no desktop; navegável por teclado; estado nunca só por cor.

## Brand Commitments

O vocabulário do estudante: sala, mesa, lugar, "mesa totalmente livre", "lugares vagos", estudar sozinho, trabalho em grupo, gravar vídeo. Frases como "2 mesas totalmente livres", "Ruído alto — valor simulado", "Última atualização às 14:32; simulação interrompida". Nada alarmista, nada que pareça medição certificada.

## Product Principles

- O card responde a pergunta sozinho: dá para decidir sem abrir nada.
- Honestidade antes de beleza: o que é simulado, fictício ou antigo diz que é.
- Mesa parcialmente ocupada não é mesa de grupo; a tela deixa isso claro.
- Estado vazio ensina o próximo passo ("Nenhuma sala com esses filtros — Limpar filtros").
- Nada some sem aviso: excluir uma lista pede confirmação, e o que foi salvo continua ao reabrir o navegador.
