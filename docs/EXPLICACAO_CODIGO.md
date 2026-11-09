# Explicação do código: a aplicação web das Salas de Estudo

Atualizado em 08/11/2026. Cobre a **W1 (a base)**, a **W2 (as regras)** e a **lógica da W4, da W5 e da W6** (as listas, os filtros, o ranking, o login fictício, a S01 pela API e os quatro hooks). E as **telas** (a Parte 4): os 18 arquivos de componente, a página do painel e o visual de painel de embarque.

---

## Como ler este documento

Este texto é para você estudar e conseguir explicar cada linha do código. O edital pede isso: cada integrante "sabe explicar o projeto inteiro, não só a sua parte" (p. 22). No fim do projeto, ele vira um PDF.

**A ordem:**

1. **O mapa do projeto:** as pastas e por que o código é separado em camadas.
2. **Parte 1 (W1):** a configuração do projeto e o único serviço que existe até agora.
3. **Parte 2 (W2):** as salas e as regras (ocupação, limiares, classificação, data da leitura e normalização).
4. **Parte 3 (W4, W5 e W6):** a lógica das telas: os filtros, o ranking, os favoritos e as listas (o CRUD), o login fictício, a leitura da S01 (a API e o modo de demonstração) e os quatro custom hooks.
5. **Parte 4:** as telas (os componentes, a página do painel, o visual e a acessibilidade).
6. **Como rodar e testar.**

No fim de cada parte há **"Perguntas que o professor pode fazer"**, com uma resposta curta.

**Cada função é explicada sempre do mesmo jeito:**

- **Recebe:** o que entra (os parâmetros).
- **Devolve:** o que sai (o retorno).
- **Exemplo:** com números de verdade dos seeds. Todos os resultados foram conferidos rodando o código.
- **Por quê:** a regra que a função cumpre.

**As siglas:**

| Sigla | Quer dizer |
|---|---|
| RN-01 a RN-15 | as regras de negócio do CONTEXTO, §8.3 |
| §4.2, §5.2... | as seções do `CONTEXTO_PROJETO_GS_CITIZENTECH.md` (a fonte de verdade do grupo) |
| p. 42 | a página do edital (o PDF do desafio) |
| S01 a S09 | as nove salas |

**Os avisos que aparecem no código e aqui:**

- **[Dado fictício]:** número inventado para a demonstração (as salas S02 a S09). Não é medição.
- **Simulado:** sai do Wokwi, que é um simulador. O "dB" vem de um potenciômetro, não de um microfone.
- **PROVISÓRIO:** número proposto pela parte web que o grupo ainda não aprovou (os limiares).

**Palavras que aparecem muito:**

| Palavra | O que é |
|---|---|
| função | um bloco de código com nome, que recebe valores e devolve um resultado |
| parâmetro | o valor que a função recebe, entre parênteses: `taxaOcupacao(mesas)` |
| array (lista) | vários valores em ordem, entre colchetes: `[1, 2, 0]` |
| objeto | valores com nome, entre chaves: `{ total: 3, vagas: 6 }` |
| `null` | "não tem valor". É diferente de `0`, que é um valor |
| `export` / `import` | `export` deixa outro arquivo usar a função; `import` traz a função de outro arquivo |
| módulo | um arquivo `.js` que exporta coisas |

---

## O mapa do projeto

### As pastas que existem hoje

```text
web/
├── package.json        os scripts e as bibliotecas
├── vite.config.js      a configuração do Vite e do Vitest
├── eslint.config.js    as regras do lint (o ESLint; na W1 era o oxlint)
├── index.html          a página que o navegador abre
├── .env.example        o modelo das variáveis de ambiente
└── src/
    ├── main.jsx        liga o React à página
    ├── App.jsx         escolhe a tela: a entrada ou o painel (Parte 4)
    ├── index.css       liga o Tailwind e define as cores (Parte 4)
    ├── components/     as telas (Parte 4)
    ├── pages/          PaginaPainel.jsx, a página do painel (Parte 4)
    ├── hooks/          useSalas, useColecoes, useFiltros,
    │                   useSessaoDemo (Parte 3)
    ├── services/       configuracao (W1); telemetria, colecoesLocais,
    │                   sessaoDemo (Parte 3)
    ├── domain/         ocupacao, limiares, classificacao,
    │                   atualizacao, normalizar (W2); filtros,
    │                   ranking, colecoes, sessao, formatar (Parte 3)
    └── data/           salas.js (W2)
```

Cada arquivo `.js` de `domain/`, `data/` e `services/` tem um `.test.js` ao lado, com os testes dele. Os hooks não têm (ver 3.9).

### As camadas

| Pasta | O que faz | Pode usar React? | Pode acessar a rede ou o `localStorage`? |
|---|---|---|---|
| `components/` | só mostra: recebe os dados (props) e devolve o JSX | sim | não |
| `hooks/` | guarda o estado (`useState`) e os efeitos (`useEffect`); liga as telas às regras e aos serviços | sim | não diretamente: chama os `services/` |
| `services/` | busca e grava dados: o Supabase, o `localStorage`, a configuração | não | **sim**, é a única que pode |
| `domain/` | as regras puras: recebe números e devolve números ou textos | **não** | **não** |
| `data/` | só dados fixos (as salas fictícias) | não | não |

A regra de quem pode importar quem segue uma seta só:

```text
components → hooks → (services, domain) → data
```

Quem está à esquerda pode usar quem está à direita, nunca o contrário. Exemplo: o `domain/` nunca importa um componente.

### Por que separar

O edital pede, na p. 42: "manter a lógica de negócio e o acesso aos dados separados dos componentes de apresentação". A p. 40 diz o mesmo: "Separar a lógica de negócio, o acesso aos dados e a camada visual". E os custom hooks servem "para separar a lógica de negócio e o gerenciamento de estado da camada visual" (p. 42).

Na prática, separar ajuda em quatro coisas:

1. **Testar sem navegador.** O `domain/` é JavaScript puro, então o Vitest roda as regras em milissegundos, sem abrir tela.
2. **Mudar a tela sem quebrar a regra.** Se o card mudar de cor ou de layout, a conta da ocupação continua igual.
3. **Uma regra num lugar só.** A taxa de ocupação é calculada numa função só. O filtro, o ranking e o card usam a mesma.
4. **Explicar.** Cada arquivo tem um assunto só.

### O caminho de um dado

```text
Supabase (linha da S01) ou o simulador → services/telemetria.js (Parte 3)
   → hooks/useSalas.js (Parte 3)
   → domain/normalizar.js (Parte 2) ← data/salas.js (Parte 2)
   → domain/classificacao.js (Parte 2)
   → hooks/useFiltros.js: domain/filtros.js e domain/ranking.js (Parte 3)
   → as telas (Parte 4)
```

O caminho completo, com as listas e o login, está em 3.0.

---

## Parte 1 — A base (W1)

### 1.1 `web/package.json`

É a "ficha" do projeto: o nome, os comandos e as bibliotecas.

**Os scripts** (o que roda quando você digita `npm run <nome>`):

| Comando | Roda | Para quê |
|---|---|---|
| `npm run dev` | `vite` | abre o servidor de desenvolvimento, que recarrega a página quando você salva um arquivo |
| `npm run build` | `vite build` | gera a versão final, otimizada, na pasta `dist/` (é ela que vai para o deploy) |
| `npm run lint` | `eslint .` | procura erros comuns no código sem rodar o código, e confere as regras dos hooks |
| `npm test` | `vitest run` | roda todos os testes uma vez e mostra o resultado |
| `npm run test:watch` | `vitest` | roda os testes de novo a cada arquivo salvo |
| `npm run preview` | `vite preview` | abre a versão do `dist/` para conferir o build |

O `npm test` funciona sem o `run` porque `test` é um nome especial do npm.

Na W1, o lint era o oxlint (que veio com o modelo do Vite), com as regras no `web/.oxlintrc.json`. Hoje é o **ESLint**, com as regras no `web/eslint.config.js` e o plugin dos hooks (`eslint-plugin-react-hooks`), que avisa, por exemplo, se alguém chamar um `useState` dentro de um `if`. A troca e as regras estão em 3.15.

**Outros campos:**

- `"type": "module"`: o projeto usa `import` e `export` (o jeito moderno do JavaScript), e não o `require` antigo.
- `"private": true`: impede de publicar o projeto no npm por engano.
- `dependencies`: o que vai junto para o navegador: `react` e `react-dom` (e, desde as telas, as fontes Barlow, pelo `@fontsource`: Parte 4).
- `devDependencies`: o que só o programador usa: o Vite, o plugin do React, o Tailwind, o ESLint (com os plugins) e o Vitest. Elas não vão para o site.
- O `^` em `"^19.3.1"` quer dizer: aceite atualizações que não quebram (19.4, 19.5...), mas não a versão 20.
- `@types/react` e `@types/react-dom` vieram com o modelo do Vite. Eles só ajudam o editor a completar o código. **O projeto não usa TypeScript.**

### 1.2 `web/vite.config.js`

```js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})
```

- **`react()`**: ensina o Vite a ler JSX (o HTML dentro do JavaScript) e faz a página trocar só o pedaço que mudou quando você salva.
- **`tailwindcss()`**: lê as classes do Tailwind que você usou (`bg-slate-50`, `px-4`...) e gera o CSS só delas.
- **`test.environment: 'node'`**: os testes rodam no Node, sem navegador. Não precisa, porque o `domain/` e os `services/` não usam tela.

### 1.3 `web/index.html` e `web/src/main.jsx`

O `index.html` tem uma `<div id="root"></div>` vazia e chama o `/src/main.jsx`. O `main.jsx` coloca o React dentro dessa div:

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `document.getElementById('root')` acha a div vazia.
- `createRoot(...)` diz ao React: "você manda aqui dentro".
- `.render(<App />)` desenha o componente `App`.
- `<StrictMode>` só age em desenvolvimento: roda algumas partes duas vezes de propósito, para mostrar erros cedo. Não muda nada no site final.
- `import './index.css'` traz o CSS (o Tailwind) para a página.

### 1.4 `web/src/index.css`

```css
@import "tailwindcss";
```

Uma linha só. No Tailwind 4, é assim que ele entra no projeto. O plugin do Vite troca essa linha pelo CSS das classes que o código usa.

### 1.5 `web/src/App.jsx`

Na W1, era uma **página provisória**, só para provar que React, Vite e Tailwind funcionam juntos. **Ela já foi trocada:** hoje o `App.jsx` usa o `useSessaoDemo` (3.13) para escolher entre a tela de entrada e o painel (3.14 e Parte 4). O que segue é a página da W1, para entender um componente.

```jsx
function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      ...
    </main>
  )
}
export default App
```

- Um **componente** é uma função que devolve JSX.
- `className` é o `class` do HTML (no JSX, `class` é palavra reservada do JavaScript).
- As classes são do Tailwind: `min-h-screen` (pelo menos a altura da tela), `bg-slate-50` (fundo cinza bem claro), `px-4` e `py-12` (espaço interno dos lados e em cima e embaixo), `mx-auto max-w-xl` (centraliza e limita a largura).
- `export default App` deixa o `main.jsx` importar o `App`.

### 1.6 `web/.env.example`

```text
VITE_TELEMETRIA_MODO=mock
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

- É um **modelo**. Quem baixa o projeto copia para `.env.local` e preenche. O `.env.local` nunca vai para o git (o `web/.gitignore` tem a linha `*.local`).
- **Tudo que começa com `VITE_` vai para o navegador**: qualquer pessoa vê pelo F12. Por isso só pode entrar a chave **publicável** do Supabase.
- `VITE_TELEMETRIA_MODO`: `mock` (uma leitura de demonstração, sem internet) ou `supabase` (a leitura da tabela `room_telemetry`). O modo mock entra na W6.

### 1.7 `web/src/services/configuracao.js`

Lê as variáveis de ambiente e devolve a configuração num formato só. Fica em `services/` porque é acesso a dados de fora (o ambiente).

Na W1, ela só era chamada pelos testes. **Hoje quem chama é o `hooks/useSalas.js`** (3.10), uma vez, quando o painel abre: o modo e a chave vão para o `services/telemetria.js`, que também usa o `ehChaveSecreta` (3.6).

#### `MODOS_TELEMETRIA`

```js
export const MODOS_TELEMETRIA = ['mock', 'supabase']
```

A lista dos dois modos que existem.

#### `ehChaveSecreta(chave)`

- **Recebe:** a chave (um texto).
- **Devolve:** `true` se for uma chave **secreta** do Supabase; `false` se não for.
- **Como decide:**
  1. sem chave → `false`;
  2. começa com `sb_secret_` (o formato novo de chave secreta) → `true`;
  3. senão, tenta ler como **JWT** (o formato antigo): separa em 3 partes pelo ponto, decodifica a parte do meio e vê se o `role` é `'service_role'`;
  4. se der erro ao decodificar (`try/catch`), → `false`.
- **Exemplo:** `ehChaveSecreta('sb_secret_abc')` → `true`; `ehChaveSecreta('sb_publishable_abc')` → `false`; `ehChaveSecreta('a.b.c')` → `false` (3 partes, mas não decodifica).

**O que é JWT, em uma frase:** JWT (*JSON Web Token*) é um texto em três partes separadas por ponto (cabeçalho, dados e assinatura), cada uma em base64; qualquer pessoa consegue **ler** a parte do meio (onde está o `role`), mas só quem tem o segredo consegue **assinar**.

As trocas `replace(/-/g, '+')` e `replace(/_/g, '/')` existem porque o JWT usa uma variação do base64 (o *base64url*), e o `atob` do JavaScript só lê o base64 comum.

**Por que recusar a chave secreta:** a chave secreta (ou `service_role`) é de administrador e passa por cima das regras de segurança da tabela (a RLS). Como tudo que começa com `VITE_` vai para o navegador, quem abrisse o F12 poderia apagar ou mudar o banco inteiro. O CONTEXTO, §6.4, proíbe isso. A função impede o erro antes de ele acontecer.

#### `lerConfiguracao(ambiente = {})`

- **Recebe:** o objeto com as variáveis (`{ VITE_TELEMETRIA_MODO: ..., ... }`). O `= {}` quer dizer: se não mandarem nada, use um objeto vazio.
- **Devolve:** `{ modoTelemetria, supabaseUrl, supabaseChave, aviso }`.
- **Antes de decidir:** tira os espaços (`trim`) e passa o modo para minúsculas (`toLowerCase`). Sem modo, usa `'mock'`.

| Situação | `modoTelemetria` | `aviso` |
|---|---|---|
| nada no ambiente | `'mock'` | `null` |
| modo desconhecido (ex.: `'firebase'`) | `'mock'` | "Modo de telemetria desconhecido ("firebase"); usando o mock." |
| `supabase` com chave secreta | `'mock'`, e a chave **não** é repassada | "A chave do Supabase é SECRETA e não pode ficar no navegador. Use a chave publicável." |
| `supabase` sem URL ou sem chave | `'mock'` | "Faltam VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY; usando o mock." |
| `supabase` com URL e chave publicável | `'supabase'` | `null` |

- **Por que volta sempre para o mock:** a aplicação nunca quebra por falta de configuração. Ela abre em modo de demonstração e avisa o motivo.
- **Por que recebe o ambiente como parâmetro** (e não lê o `import.meta.env` lá dentro): assim o teste consegue passar qualquer ambiente, sem o Vite. É o mesmo motivo de o `domain/` receber tudo por parâmetro.

### 1.8 `web/src/services/configuracao.test.js`

São **8 testes**: 5 da `lerConfiguracao` (um para cada linha da tabela acima) e 3 da `ehChaveSecreta`. A função `jwtCom(role)`, dentro do teste, monta um JWT **falso** (sem assinatura válida), só com o `role` que interessa, para testar o formato antigo sem usar uma chave de verdade.

### Perguntas que o professor pode fazer (Parte 1)

**O que é o Vite?**
Uma ferramenta que roda o servidor de desenvolvimento (com recarga automática) e gera a versão final do site no `npm run build`.

**Qual a diferença entre `dependencies` e `devDependencies`?**
As `dependencies` vão para o site (o React). As `devDependencies` só ajudam a programar e a testar (o Vite, o Vitest, o ESLint).

**O que o `main.jsx` faz?**
Acha a `<div id="root">` do `index.html` e desenha o componente `App` dentro dela.

**Por que o CSS tem uma linha só?**
No Tailwind 4, o `@import "tailwindcss"` basta. O plugin gera o CSS só das classes usadas no código.

**Por que o `.env.local` não vai para o git?**
Porque cada pessoa tem a sua URL e a sua chave. No git vai só o modelo (`.env.example`), sem valores.

**Por que só a chave publicável?**
Tudo que começa com `VITE_` fica visível no navegador. A chave secreta dá acesso de administrador ao banco, então nunca pode ir para lá.

**O que é JWT?**
Um texto em três partes separadas por ponto (cabeçalho, dados e assinatura). Qualquer um lê os dados, mas só quem tem o segredo assina.

**Por que o modo padrão é o mock?**
Para a aplicação abrir mesmo sem Supabase configurado. Ela mostra um aviso em vez de quebrar.

**Por que a `lerConfiguracao` recebe o ambiente por parâmetro?**
Para dar para testar com qualquer combinação de variáveis, sem depender do Vite.

---

## Parte 2 — As regras (W2)

### 2.0 Como os arquivos da W2 se ligam

```text
data/salas.js            (só dados; não importa nada)
domain/ocupacao.js       (não importa nada)
domain/limiares.js       (não importa nada)
domain/atualizacao.js    (não importa nada)
domain/classificacao.js  ← limiares.js, ocupacao.js
domain/normalizar.js     ← data/salas.js, atualizacao.js,
                           limiares.js, ocupacao.js
```

O `normalizar.js` é o único arquivo do `domain/` que importa algo de fora dele: o `data/salas.js`, que só tem dados (nenhuma função). Nenhum arquivo do `domain/` usa React, `fetch`, `localStorage` nem `window`. Isso foi conferido com `grep` (está no IMPLEMENTATION_STATUS.md).

**As duas palavras mais importantes da W2:**

- **Sala normalizada:** o formato único de uma sala, venha ela do Supabase (a S01) ou do `data/` (S02 a S09). Tem `id`, `nome`, `porte`, `mesas`, `temperaturaC`, `luz`, `ruidoDb`, `origem`, `statusDispositivo` e `atualizadoEm`.
- **Derivado:** o que é **calculado** a partir da leitura (total, vagas, taxa, faixa, severidade, estado). Ele nunca é guardado nem enviado pelo ESP32: "a soma é calculada, não enviada" (CONTEXTO, §6.3).

---

### 2.1 `web/src/data/salas.js`

O topo do arquivo diz: **"TUDO AQUI É FICTÍCIO"**. As salas, os nomes e o número de mesas são parâmetros do protótipo (CONTEXTO, §4.1), não o inventário de uma instituição real. As leituras de S02 a S09 são **[Dado fictício]** (§7.6).

O arquivo só tem dados. As contas ficam no `domain/ocupacao.js`.

#### `MESAS_POR_PORTE`

```js
export const MESAS_POR_PORTE = { pequena: 2, media: 3, grande: 4 }
```

Quantas mesas cada porte tem (§4.1). Com 3 lugares por mesa: pequena = 6 lugares, média = 9, grande = 12.

#### `SALAS`

Uma lista com as 9 salas. Cada uma é assim:

```js
{ id: 'S01', nome: 'Sala de Estudo 01', porte: 'media',
  quantidadeMesas: MESAS_POR_PORTE.media, origem: 'iot' }
```

- `origem: 'iot'` só na S01, que recebe os dados do Wokwi pelo Supabase. As outras oito têm `origem: 'demo'` (RN-10).
- **Por que `quantidadeMesas: MESAS_POR_PORTE.media` e não o número 3 direto:** assim o porte e o número de mesas nunca ficam diferentes. Se alguém mudar o porte, muda a quantidade junto.
- Total: 2 pequenas + 5 médias + 2 grandes = **27 mesas e 81 lugares** (§4.1).

#### `LEITURAS_DEMO`

As leituras fixas de S02 a S09, copiadas da tabela do CONTEXTO, §7.6:

| Sala | `mesas` | `temperaturaC` | `luz.valor` (lux estimado) | `ruidoDb` (dB simulados) |
|---|---|---:|---:|---:|
| S02 | `[0, 2]` | 22 | 410 | 42 |
| S03 | `[3, 3]` | 18 | 920 | 71 |
| S04 | `[1, 1, 1]` | 21 | 500 | 46 |
| S05 | `[0, 3, 3]` | 24 | 350 | 57 |
| S06 | `[2, 2, 1]` | 19 | 180 | 61 |
| S07 | `[0, 0, 1]` | 23 | 450 | 39 |
| S08 | `[3, 2, 1, 0]` | 25 | 600 | 53 |
| S09 | `[3, 3, 3, 2]` | 28 | 760 | 68 |

A luz vem sempre como `{ valor: 410, unidade: 'lux_estimado' }`, com a unidade junto.

**Por que a S01 não está aqui:** o CONTEXTO, §7.6, diz que "S01 não tem valores estáticos de produção": ela mostra a **última leitura** que o Wokwi mandou. Se a S01 tivesse um número fixo, a tela poderia mostrar um dado inventado como se fosse do sensor.

**Nome do arquivo:** o CONTEXTO (§4.1) sugere `salasDemo.js`; o plano da web usa `salas.js`, porque o arquivo tem as nove salas e não só as demo. O grupo precisa saber desse nome.

#### O teste: `web/src/data/salas.test.js` (10 testes)

Confere o que o CONTEXTO diz, para um número digitado errado não passar: 9 salas de S01 a S09; 27 mesas e 81 lugares; 2 pequenas, 5 médias e 2 grandes; o número de mesas de cada porte; só a S01 com `origem: 'iot'`; leituras só de S02 a S09; cada leitura com o número certo de mesas, todas de 0 a 3; os totais do §7.6 (S02: 2, S03: 6, S04: 3, S05: 6, S06: 5, S07: 1, S08: 6, S09: 11); a coluna "Mesa vazia?" do §7.6; e a luz sempre em `lux_estimado`.

---

### 2.2 `web/src/domain/ocupacao.js`

As contas de ocupação (CONTEXTO, §4.2, e as regras RN-01 a RN-07). Aqui, **`mesas` é sempre uma lista com quantas pessoas estão sentadas em cada mesa**. Exemplo: `[1, 2, 0]` = mesa 1 com 1 pessoa, mesa 2 com 2, mesa 3 vazia.

Não existe "pessoa em pé" (RN-04) nem campo de "tamanho do grupo" (RN-07): o modelo é só a lista das mesas.

#### `LUGARES_POR_MESA`

```js
export const LUGARES_POR_MESA = 3
```

Cada mesa tem 3 lugares (RN-01). Todas as contas usam esta constante, e não o número 3 solto.

#### `validarMesas(mesas)`

- **Recebe:** qualquer coisa (o que veio do Supabase, do `data/` ou da tela).
- **Devolve:** `{ valido, erros }`. O `valido` é `true` ou `false`; o `erros` é a lista dos motivos, em português.
- **O que confere:** é uma lista? Não está vazia? Cada mesa é um número **inteiro** de 0 a 3?
- **Exemplos:**
  - `validarMesas([1, 1, 1])` → `{ valido: true, erros: [] }`
  - `validarMesas([1, 4, 0])` → `valido: false`, com o erro "A mesa 2 tem o valor 4, mas precisa ser um número inteiro de 0 a 3."
  - `validarMesas(['2'])` → "A mesa 1 tem o texto "2", ..." (as aspas mostram que veio **texto**, e não número)
  - `validarMesas([])` → "A lista de mesas está vazia: a sala precisa de pelo menos 1 mesa."
- **Por que `i + 1` na mensagem:** o JavaScript conta as posições a partir de 0; as pessoas contam as mesas a partir de 1.
- **Por que devolve uma lista de erros e não lança erro:** quem chama (o `classificacao.js`, o `normalizar.js`) pode decidir o que fazer, sem o programa parar.

Uma função interna ajuda a montar a mensagem: **`descreverValor`** (não é exportada). Ela escreve o texto entre aspas, o número do jeito que é, e, para outros tipos (uma lista, um `Symbol`), só o nome do tipo ("um valor do tipo symbol"). Isso evita que a própria mensagem de erro quebre o programa.

#### `exigirMesasValidas(mesas)` (interna)

Não é exportada. É chamada no começo de cada conta: se as mesas forem inválidas, **lança um erro** ("Mesas inválidas: ..."). Assim nenhuma conta devolve um número errado em silêncio.

```js
ocupacaoTotal([1, 4, 0])
// Erro: "Mesas inválidas: A mesa 2 tem o valor 4, ..."
```

#### `ocupacaoTotal(mesas)`

- **Recebe:** as mesas. **Devolve:** o total de pessoas (a soma).
- **Exemplo:** S09 `[3, 3, 3, 2]` → **11**.
- **Por quê:** RN-03, "Ocupação total = soma das mesas". Não existe um contador separado que possa ficar diferente das mesas.

#### `capacidadeSala(mesas)`

- **Recebe:** as mesas. **Devolve:** o número de mesas × 3.
- **Exemplo:** S02 `[0, 2]` → 2 × 3 = **6**.
- **Por quê:** RN-02, "Capacidade sentada = 3 × número de mesas".

#### `vagasIndividuais(mesas)`

- **Recebe:** as mesas. **Devolve:** capacidade − total.
- **Exemplo:** S05 `[0, 3, 3]` → 9 − 6 = **3** lugares livres.

#### `mesasTotalmenteVazias(mesas)`

- **Recebe:** as mesas. **Devolve:** quantas mesas têm **0** pessoas.
- **Exemplo:** S07 `[0, 0, 1]` → **2**. S04 `[1, 1, 1]` → **0** (tem 6 lugares livres, mas nenhuma mesa vazia).
- **Por quê:** RN-06, "Para trabalho em grupo só conta mesa com ocupação 0". Uma mesa com 1 ou 2 pessoas **não** conta, para o grupo não ter de dividir a mesa com quem não conhece.

#### `taxaOcupacao(mesas)`

- **Recebe:** as mesas. **Devolve:** a porcentagem de lugares ocupados, **sem arredondar**: `100 × total ÷ capacidade`.
- **Exemplos:** S08 `[3, 2, 1, 0]` → 6 de 12 = **50**. S06 `[2, 2, 1]` → 5 de 9 = **55,555...**
- **Por que sem arredondar:** a conta fica exata. Quem mostra na tela decide quantas casas decimais exibir.
- **A proteção da capacidade 0:** existe um `if (capacidade === 0) return 0`, contra a divisão por zero. Hoje ele **nunca roda**, porque a lista vazia (a única com capacidade 0) já é recusada antes. O comentário no código diz isso.

#### `resumoOcupacao(mesas)`

- **Recebe:** as mesas. **Devolve:** tudo junto: `{ total, capacidade, vagas, mesasVazias, taxa }`.
- **Exemplo:** o caso do CONTEXTO, §4.2, `[1, 1, 1]` (a S04):

```js
{ total: 3, capacidade: 9, vagas: 6, mesasVazias: 0, taxa: 33.33... }
```

- **Por quê:** a tela precisa dos cinco números de uma vez; assim ela chama uma função só.

#### `ehIndiceDeMesa(mesas, indice)` (interna)

Não é exportada. Diz se o índice aponta para uma mesa que existe: um inteiro de 0 até a última posição.

#### `entrarNaMesa(mesas, indice)`

O botão **"+"**: uma pessoa senta na mesa.

- **Recebe:** as mesas e o índice da mesa (a primeira é 0).
- **Devolve:** uma **lista nova**, com +1 na mesa, só se ela tiver menos de 3.
- **Exemplos:**
  - `entrarNaMesa([0, 1, 2], 1)` → `[0, 2, 2]`
  - S05: `entrarNaMesa([0, 3, 3], 1)` → `[0, 3, 3]` (a mesa 2 está cheia, nada muda)
  - índice que não existe (`-1`, `3`, `1.5`, `'0'`) → uma cópia igual
  - mesas inválidas (`[4, 0]`) → lança erro
- **Por quê:** RN-05, "Botão + não excede 3".

```js
const novas = [...mesas] // cópia: a lista original continua igual
```

Os três pontos (`...`, o *spread*) copiam a lista. A função muda a cópia e devolve a cópia.

#### `sairDaMesa(mesas, indice)`

O botão **"−"**: uma pessoa sai da mesa. Igual à `entrarNaMesa`, mas tira 1, só se a mesa tiver pelo menos 1.

- **Exemplo:** `sairDaMesa([0, 1, 2], 2)` → `[0, 1, 1]`; `sairDaMesa([0, 1, 2], 0)` → `[0, 1, 2]` (a mesa 1 já está vazia, nunca fica negativa).
- **Por quê:** RN-05, "botão − não reduz abaixo de 0".

**Por que as duas devolvem uma lista nova (e não mudam a lista recebida):** no React, o `useState` só desenha a tela de novo quando recebe um valor **novo**. Se a função mudasse a mesma lista, o React compararia a lista com ela mesma, acharia que nada mudou e não atualizaria o card. Devolver uma cópia também evita que uma parte do programa mude, sem querer, os dados de outra.

#### O teste: `web/src/domain/ocupacao.test.js` (39 testes)

O exemplo `[1, 1, 1]` do §4.2; a sala vazia e a cheia; a sala grande de 4 mesas; a validação (mesa com 4, negativa, 1,5, texto, lista vazia, algo que não é lista, `Symbol`...); as mensagens exatas; todas as contas lançando erro com mesas inválidas; e os botões (mesa cheia, mesa vazia, índice inválido, a lista original sem mudar).

---

### 2.3 `web/src/domain/limiares.js`

O topo do arquivo diz: **"PROVISÓRIO — proposta da parte web, aguardando a aprovação do grupo (tabela única para Edge, Python, Matemática e Web)"**. Esses números ainda não são critério aprovado: não vão para slide nem para o README como se fossem oficiais.

Este arquivo **só guarda números**. A conta que usa os números está no `classificacao.js`.

#### `LIMIARES`

Para cada indicador (temperatura, luz, ruído e ocupação), sete campos:

| Campo | Serve para |
|---|---|
| `unidade` | a unidade dos números (`'°C'`, `'lux_estimado'`, `'dB_simulados'`, `'%'`) |
| `limiteBaixo`, `limiteAlto` | a **faixa**: onde o valor está (`baixo`, `medio`, `alto`) |
| `criticoAbaixo`, `atencaoAbaixo`, `atencaoAcima`, `criticoAcima` | a **severidade**: se a sala está boa para usar (`adequado`, `atencao`, `critico`) |

`null` quer dizer "este lado não dá problema".

Os números (PROVISÓRIOS):

| Indicador | limiteBaixo | limiteAlto | criticoAbaixo | atencaoAbaixo | atencaoAcima | criticoAcima |
|---|---:|---:|---:|---:|---:|---:|
| temperatura (°C) | 21 | 26 | 18 | 21 | 25 | 26 |
| luz (lux estimado) | 300 | 750 | 200 | 300 | 2000 | 3000 |
| ruído (dB simulados) | 40 | 55 | null | null | 45 | 65 |
| ocupação (%) | 35 | 70 | null | null | 50 | 90 |

**De onde vem cada um** (o comentário no código cita a fonte):

- **Temperatura:** a NR-17 (item 17.8.4.2: 18 a 25 °C em ambiente climatizado) e a NBR 16401-2:2008 (zonas de conforto de 21 a 26 °C, lida numa fonte secundária, porque a norma é paga). A ideia: onde as duas concordam (21 a 25 °C) é **adequado**; onde só uma atende é **atenção**; onde nenhuma atende é **crítico**.
- **Luz:** a NHO 11 da Fundacentro, para onde a NR-17 (item 17.8.3) manda: tarefa contínua, no mínimo 200 lux; sala de aula, 300 lux. Para luz demais, as normas não dão máximo; foi usado o UDI (Mardaljevic): 2000 lux e, numa revisão do próprio autor, cerca de 3000. A confiança desse lado é baixa.
- **Ruído:** a NBR 10152 (biblioteca: até 45 dB é o "aceitável") e a NR-17, item 17.8.4.1.2 (até 65 dB(A)). São **dB simulados**, não dB(A) medido. Confiança baixa.
- **Ocupação:** **critério do grupo, sem norma.** Atenção acima de 50 %, porque a sala já "parece cheia" (Williams, 1996, citando um estudo de biblioteca); crítico acima de 90 %, praticamente lotada.

**Por que o ruído e a ocupação têm `null` embaixo:** pouco barulho e sala vazia não são problema. Já a temperatura e a luz têm limite embaixo, porque **frio e escuro demais também são ruins** (RN-09: "baixo" não quer dizer "bom").

#### `RUIDO_DB_MIN` e `RUIDO_DB_MAX`

```js
export const RUIDO_DB_MIN = 30
export const RUIDO_DB_MAX = 80
```

A escala do potenciômetro: no começo do curso dele, 30 dB simulados; no fim, 80. Critério do grupo, sem norma, PROVISÓRIO. São usados no índice de ruído (no `classificacao.js`) e na faixa de leitura possível (abaixo).

#### `LEITURA_POSSIVEL`

```js
temperatura: { minimo: -40, maximo: 80 },
luz:         { minimo: 0,   maximo: 100000 },
ruido:       { minimo: RUIDO_DB_MIN, maximo: RUIDO_DB_MAX },
```

A faixa de valores que cada sensor **consegue** dar (PROVISÓRIO). Um valor fora dela não é leitura, é **erro de leitura** (CONTEXTO, §5.4), e o `normalizar.js` troca por `null`. As duas pontas contam como dentro.

- Temperatura: −40 a 80 °C é a faixa do DHT22 pelo datasheet do fabricante. O comentário avisa que **não foi conferida no Wokwi** (a página do Wokwi não diz a faixa) e que o Edge confirma.
- Luz: não existe luz negativa; o máximo é o maior valor da tabela do fotorresistor do Wokwi (100.000 lux, sol direto).
- Ruído: a própria escala do potenciômetro, 30 a 80.

#### O teste: `web/src/domain/limiares.test.js` (20 testes)

Não confere número por número (isso fica nas bordas do `classificacao.test.js`). Confere se a tabela **faz sentido**: os quatro indicadores e as unidades; `limiteBaixo ≤ limiteAlto`; os limites de severidade em ordem; ruído e ocupação com `null` embaixo; temperatura e luz com limite embaixo (RN-09); a ocupação entre 0 e 100 %; os limites do ruído dentro da escala; e todos os limiares dentro da `LEITURA_POSSIVEL`. Assim, se o grupo mudar um número e alguém digitar errado, o teste avisa.

---

### 2.4 `web/src/domain/classificacao.js`

Classifica as leituras (CONTEXTO, §5.2, RN-08 e RN-09). A ideia central são **três coisas diferentes, que não se misturam** (§5.2):

1. o **valor** (ex.: 18 °C);
2. a **faixa**, onde o valor está na escala: `baixo`, `medio` ou `alto`. **Não diz se é bom.**
3. a **severidade**, se a sala está boa para usar: `adequado`, `atencao` ou `critico`.

Sem leitura válida, não há classificação: o valor e a faixa ficam `null` e a severidade fica **`'invalido'`**, um quarto valor que leva a sala para `'falha'`.

#### As funções internas

Não são exportadas, só ajudam:

- **`ehNumero(valor)`:** `true` só se for do tipo `number` e finito. Texto (`'22'`), `null`, `NaN` e infinito dão `false`.
- **`limiaresDe(indicador)`:** pega os limiares do indicador. Um nome que não existe (`'umidade'`) **lança erro**, porque é erro de quem programou. O `Object.hasOwn` impede que `'toString'` (um nome que todo objeto do JavaScript tem) seja aceito como indicador.
- **`ficouAbaixo(valor, limite)`:** `true` se o limite não é `null` **e** o valor é **menor** que ele.
- **`ficouAcima(valor, limite)`:** `true` se o limite não é `null` **e** o valor é **maior** que ele.

#### `classificarFaixa(indicador, valor)`

- **Recebe:** o nome do indicador (`'temperatura'`, `'luz'`, `'ruido'` ou `'ocupacao'`) e o valor.
- **Devolve:** `'baixo'`, `'medio'`, `'alto'`, ou `null` se o valor não for um número válido. Lança erro se o indicador não existir.
- **A regra:** `baixo` se `valor < limiteBaixo`; `alto` se `valor > limiteAlto`; senão `medio`.
- **Exemplos:**
  - S03, temperatura 18 → 18 < 21 → **`'baixo'`**
  - S09, temperatura 28 → 28 > 26 → **`'alto'`**
  - S03, luz 920 → 920 > 750 → **`'alto'`**

#### `classificarSeveridade(indicador, valor)`

- **Recebe:** o indicador e o valor.
- **Devolve:** `'adequado'`, `'atencao'`, `'critico'`, ou `'invalido'` se o valor não for um número válido. Lança erro se o indicador não existir.
- **A regra, nesta ordem:**
  1. passou de um limite **crítico** (abaixo ou acima)? → `'critico'`;
  2. senão, passou de um limite de **atenção**? → `'atencao'`;
  3. senão → `'adequado'`.
- **Por que o crítico vem primeiro:** um valor muito baixo passa dos dois limites (do crítico e do de atenção). Olhando o crítico antes, ele fica com o pior dos dois.
- **As comparações são estritas (`<` e `>`):** o número do próprio limite fica do lado de dentro.
- **Exemplos:**
  - 17,9 °C → 17,9 < 18 → **`'critico'`**
  - S03, 18 °C → 18 não é menor que 18, mas é menor que 21 → **`'atencao'`**
  - S08, 25 °C → não passou de nada → **`'adequado'`**
  - 26 °C → 26 > 25, mas não é maior que 26 → **`'atencao'`**
  - S06, luz 180 → 180 < 200 → **`'critico'`**
  - S03, luz 920 → **`'adequado'`** (faixa alta, mas boa para usar)
  - S04, ruído 46 → 46 > 45 → **`'atencao'`**
  - S08, ocupação 50 % → 50 não é maior que 50 → **`'adequado'`**
  - S03, ocupação 100 % → 100 > 90 → **`'critico'`**

#### `indiceRuido(db)`

- **Recebe:** o ruído em dB simulados.
- **Devolve:** um número **inteiro de 0 a 100** (100 = mais barulhento), ou `null` se o valor não for um número válido.
- **A conta** (CONTEXTO, §5.3):

```js
Math.round(100 * (db - 30) / (80 - 30))   // = 2 × (dB − 30)
// depois, prende entre 0 e 100
```

- **Exemplos:** S02, 42 dB → 2 × 12 = **24**. S07, 39 dB → **18**. S03, 71 dB → **82**. S01 do exemplo, 54 dB → **48**. 20 dB → **0** (abaixo da escala, fica preso no 0).
- **O arredondamento:** o `Math.round` arredonda o meio para cima: 30,25 dB → 0,5 → **1**. Isso importa para o grupo (ver as perguntas).
- **Cuidado:** o dB é **logarítmico** (+10 dB = 10 vezes mais intensidade), e o índice é linear **em dB**. Índice 60 **não** é "o dobro de barulho" do índice 30. Por isso ele se chama "intensidade do ruído", e não "qualidade para estudar" (§5.3).

#### `estadoGeral(severidades, statusDispositivo)`

A mesma regra dos LEDs do Wokwi (RN-08), com a falha à parte.

- **Recebe:** a lista das severidades dos indicadores e o status do dispositivo (o da sala normalizada; `null` nas salas demo).
- **Devolve:** `'falha'`, `'vermelho'`, `'amarelo'` ou `'verde'`.
- **A ordem:**
  1. **`'falha'`:** o status existe e não é `'ok'` (o ESP32 avisou um erro, como `'offline'`, ou a web marcou `'sem_leitura'` ou `'dados_invalidos'`); **ou** a lista está vazia; **ou** alguma severidade é `'invalido'` ou desconhecida;
  2. **`'vermelho'`:** pelo menos um `'critico'`;
  3. **`'amarelo'`:** nenhum crítico e pelo menos um `'atencao'`;
  4. **`'verde'`:** todos `'adequado'`.
- **Exemplos:**
  - S03 `['atencao', 'adequado', 'critico', 'critico']` → **`'vermelho'`**
  - `['adequado', 'atencao', 'adequado', 'adequado']` com `'ok'` → **`'amarelo'`**
  - tudo `'adequado'` com `'offline'` → **`'falha'`**
  - `['adequado', 'invalido', 'adequado', 'adequado']` → **`'falha'`**
- **Por que a falha vem primeiro:** a sala **nunca** pode ficar verde por falta de leitura (§5.2: "não mostrar verde por falta de leitura").
- O status precisa ser exatamente `'ok'`: `'OK'` ou `''` também dão falha.
- A **idade** da leitura não entra aqui. O aviso "Desatualizado" é outra função (`leituraDesatualizada`, no `atualizacao.js`).

#### As funções internas da sala

- **`classificarIndicador(indicador, valor)`:** junta `{ valor, faixa, severidade }`. Valor que não é número volta como `null`.
- **`classificarLuz(luz)`:** só classifica se a unidade for `'lux_estimado'`, a mesma dos limiares. Com outra unidade (ex.: `'indice'`), comparar com limites em lux daria um resultado errado, então vira `'invalido'`.
- **`classificarOcupacao(mesas)`:** usa o `resumoOcupacao` do `ocupacao.js` e classifica pela **taxa**. Mesas inválidas não lançam erro aqui: viram tudo `null` e `'invalido'`.

#### `classificarSala(sala)`

- **Recebe:** a sala normalizada (a que sai do `normalizar.js`).
- **Devolve:** `{ temperatura, luz, ruido, ocupacao, estado }`. Cada indicador traz `{ valor, faixa, severidade }`; a luz traz também a unidade; o ruído traz o `indice`; a ocupação traz o resumo no lugar do valor.
- **Nunca lança erro:** o que falta vira `'invalido'`, e a sala fica em `'falha'`.
- **Exemplo**, a S03 (**[Dado fictício]**):

```js
temperatura: { valor: 18, faixa: 'baixo', severidade: 'atencao' }
luz:   { valor: 920, faixa: 'alto', severidade: 'adequado', ... }
ruido: { valor: 71, faixa: 'alto', severidade: 'critico', indice: 82 }
ocupacao: { total: 6, capacidade: 6, vagas: 0, mesasVazias: 0,
            taxa: 100, faixa: 'alto', severidade: 'critico' }
estado: 'vermelho'
```

- **Quem confere se o valor é possível** (ex.: ruído de −20 dB) é o `normalizar.js`, antes. Aqui o valor só é comparado com os limiares.

#### O teste: `web/src/domain/classificacao.test.js` (106 testes)

- **As bordas** de cada limite, dos dois lados (ex.: 17,9 / 18 / 20,9 / 21 / 25 / 25,1 / 26 / 26,1 °C). Os mesmos casos servem para o grupo testar se o C++ e o Python dão o mesmo resultado.
- Os valores inválidos (`null`, `NaN`, infinito, texto).
- O índice de ruído, com o arredondamento do meio.
- Os 4 estados e a prioridade da falha.
- A sala inteira: o exemplo da S01 (amarelo, por causa do ruído), frio demais e escuro demais (vermelho), status `'offline'`, mesas inválidas, luz em outra unidade.
- **As 8 salas demo**, uma por uma, contra a tabela de conferência feita à mão: **2 verdes, 3 amarelas e 3 vermelhas**.

---

### 2.5 `web/src/domain/atualizacao.js`

A hora da leitura: se a data é válida e se a leitura já está velha (CONTEXTO, §6.5; RN-11). A hora atual vem de quem chama a função (o hook vai usar `Date.now()`), para os testes poderem escolher a hora.

#### `FORMATO_DATA_ISO`

Uma **expressão regular** (um molde de texto) da data completa, como o Supabase manda: o dia, a letra `T`, a hora com segundos e o fuso. Exemplo: `'2026-11-08T14:32:00Z'` (o `Z` quer dizer UTC). A fração do segundo é opcional.

#### `lerDataIso(texto)`

- **Recebe:** a data em texto (o `updated_at` do Supabase).
- **Devolve:** os milissegundos desde 1970 (como o `Date.parse`), ou `null` se não for uma data completa.
- **Exemplos:**
  - `'2026-11-08T14:32:00Z'` → `1794148320000`
  - `'2026-11-08T11:32:00-03:00'` (horário de Brasília) → `1794148320000`, o mesmo instante
  - `'2026-11-08T14:32:00.123456+00:00'` (microssegundos, como o Postgres) → `1794148320123`
  - `'2026-11-08'` (sem hora) → `null`; `'99'` → `null`
- **Por que não usar o `Date.parse` direto:** o `Date.parse` do Chrome aceita `"0"` (ano 2000) e `"99"` (1999) como data. Um texto fora do padrão pode ser lido de um jeito em cada navegador.
- **Por que corta para 3 casas:** o JavaScript lê exatamente 3 casas depois do ponto (milissegundos), e o Postgres manda 6. Ficam as 3 primeiras (`.123456` → `123`; `.5` → `500`).

#### `leituraDesatualizada(atualizadoEm, agora, limiteSegundos)`

- **Recebe:** a hora da leitura, a hora atual (em milissegundos) e o limite em segundos.
- **Devolve:** `true` se a leitura está velha (ou se não dá para saber); `false` se está em dia.
- **Exemplo** (com o limite de **30 s, só um exemplo dos testes**, não o número do grupo), leitura às 14:32:00:
  - às 14:32:10 → `false`
  - às 14:32:30 → `false` (exatamente no limite ainda vale: a comparação é estrita)
  - às 14:32:31 → `true`
  - sem data, ou sem limite → `true`
- **Na dúvida, diz que está desatualizada:** sem data válida, sem limite, sem a hora atual, ou com a data mais longe **no futuro** que o próprio limite (relógio errado). Um relógio só alguns segundos adiantado não é problema.
- **Ela não muda o estado da sala.** A RN-11 diz para manter a última leitura **com o aviso**. No ranking, a S01 desatualizada continua, com o aviso e 15 pontos a menos (proposta **PROVISÓRIA**, 3.2).
- **O limite de verdade** (`STALE_AFTER_SECONDS`) hoje é o `LIMITE_DESATUALIZADO_SEGUNDOS = 30` do `services/telemetria.js` (3.6), **PROVISÓRIO**: precisa ser maior que o intervalo de envio do ESP32, que o Edge define.

#### O teste: `web/src/domain/atualizacao.test.js` (32 testes)

Os 6 formatos aceitos (com o instante conferido por `Date.UTC`), os 12 recusados (`"0"`, `"99"`, só o dia, sem fuso, mês 13...) e os casos da `leituraDesatualizada`: recente, no limite, passou do limite, uma leitura de 2001, relógio adiantado, data em 2099, sem data, limite ausente, zero, negativo, em texto ou `NaN`, e sem a hora atual.

---

### 2.6 `web/src/domain/normalizar.js`

Transforma as leituras na **sala normalizada** (o formato único do TECHNICAL_ARCHITECTURE.md, §3). Toda sala, venha do Supabase (a S01) ou do `data/` (S02 a S09), sai com os mesmos campos e passa pelas mesmas conferências.

Quem **busca** a linha no Supabase (ou no mock) é o `services/` (W6); aqui só se arruma o que chegou.

**A regra principal: nunca inventar leitura.** O que não for válido vira `null` (nunca `0`), e a sala avisa no `statusDispositivo`. Além dos status que o ESP32 manda (`'ok'`, `'sensor_error'`, `'offline'`), a web cria dois:

- **`'sem_leitura'`:** ainda não chegou nenhuma linha da S01;
- **`'dados_invalidos'`:** chegou, mas algum campo não é válido.

Nenhuma função daqui lança erro.

#### Os nomes da tabela viram os nomes da sala

A tabela `room_telemetry` (CONTEXTO, §6.3) usa nomes em inglês. O `normalizarTelemetria` troca:

| Coluna do Supabase | Campo da sala normalizada |
|---|---|
| `occupancy_by_table` | `mesas` |
| `temperature_c` | `temperaturaC` |
| `light_value` + `light_unit` | `luz: { valor, unidade }` |
| `noise_db_simulated` | `ruidoDb` |
| `device_status` | `statusDispositivo` |
| `updated_at` | `atualizadoEm` |

O `id`, o `nome` e o `porte` vêm sempre do `data/salas.js`; a linha só traz a leitura.

#### As funções internas

- **`FORMATO_NUMERO`** = `/^-?\d+(\.\d+)?$/`: o número escrito do jeito simples: o sinal de menos (se tiver), dígitos e, se tiver, o ponto e mais dígitos (`"22.8"`, `"-3"`, `"54"`).
- **`paraNumero(valor)`:** aceita o número `22.8` e o texto `"22.8"` (com espaços em volta). Devolve `null` para o resto: `""`, `"abc"`, `"22,8"` (vírgula), `"0x16"` (hexadecimal), `"2.28e1"` (notação científica), `null`, `NaN`, infinito, `true`. Ele é mais rígido que o `Number()` do JavaScript, que aceitaria `"0x16"` como 22.
- **`lerNaFaixa(valor, faixa)`:** usa o `paraNumero` e confere a `LEITURA_POSSIVEL`. Fora dela → `null`.
- **`lerMesas(valor, quantidadeMesas)`:** aceita a lista `[1, 2, 0]` ou o texto JSON `"[1,2,0]"`. Devolve `null` se não der uma lista válida (cada mesa de 0 a 3) ou se o número de mesas for diferente do da sala (a S01 tem 3, CONTEXTO, §10.2).
- **`lerStatus(valor)`:** um texto que não esteja vazio; senão `null`.
- **`lerLeituras(dados, quantidadeMesas)`:** lê as quatro leituras do mesmo jeito, para a S01 e para as demo. A luz só vale em `'lux_estimado'`: o CONTEXTO (§6.3) também prevê `'indice'`, mas não há limiares para ele.
- **`algumaLeituraNula(leituras)`:** `true` se algum campo ficou `null`.
- **`semLeituras()`:** tudo `null`. É uma função (e não uma constante) para cada sala ganhar o seu próprio objeto da luz.
- **`dadosDaSala(meta)`:** o `id`, o `nome` e o `porte`. Usa o `??`: `a ?? b` quer dizer "use `a`; se `a` for `null` ou `undefined`, use `b`". Assim o que falta sai `null`, nunca `undefined`.

#### `normalizarTelemetria(linha, metaSala, origem = 'iot')`

- **Recebe:**
  - `linha`: **uma** linha do Supabase (o `resposta[0]`, não a lista inteira), ou `null`/`undefined` se ainda não chegou nada;
  - `metaSala`: a sala do `data/salas.js` (`id`, `nome`, `porte`, `quantidadeMesas`);
  - `origem`: `'iot'` (o padrão, o Supabase) ou `'mock'` (a leitura inventada do modo mock).
- **Devolve:** a sala normalizada.
- **O caminho:**
  1. sem linha → tudo `null` e `'sem_leitura'`;
  2. não é um objeto, é uma lista, a sala não tem `id`, ou o `room_id` é de outra sala → tudo `null` e `'dados_invalidos'`;
  3. senão, lê cada campo; o que não valer vira `null`;
  4. a data só fica se o `lerDataIso` aceitar;
  5. se algum campo ficou `null` (ou falta a data, ou falta o status) e o ESP32 disse `'ok'` (ou não disse nada), o status vira `'dados_invalidos'`. Se o próprio ESP32 mandou um erro (`'offline'`, `'sensor_error'`), o erro dele fica, porque diz mais.
- **Exemplo**, a linha do CONTEXTO, §6.3 (**[Dado fictício]**):

```js
// entra (do Supabase)
{ room_id: 'S01', occupancy_by_table: [1, 2, 0],
  temperature_c: 22.8, light_value: 410,
  light_unit: 'lux_estimado', noise_db_simulated: 54,
  device_status: 'ok', updated_at: '2026-11-08T14:32:00Z' }

// sai (a sala normalizada)
{ id: 'S01', nome: 'Sala de Estudo 01', porte: 'media',
  mesas: [1, 2, 0], temperaturaC: 22.8,
  luz: { valor: 410, unidade: 'lux_estimado' }, ruidoDb: 54,
  origem: 'iot', statusDispositivo: 'ok',
  atualizadoEm: '2026-11-08T14:32:00Z' }
```

- **O que muda com uma linha diferente** (o resto igual ao exemplo):

| A linha trouxe | Resultado |
|---|---|
| `light_value: ' 410 '` (texto com espaços) | luz 410, status `'ok'` |
| `occupancy_by_table: '[1,2,0]'` (texto JSON) | mesas `[1, 2, 0]`, status `'ok'` |
| `temperature_c: '22,8'` ou `'0x16'` | temperatura `null`, `'dados_invalidos'` |
| `noise_db_simulated: 20` (abaixo de 30) | ruído `null`, `'dados_invalidos'` |
| `light_unit: 'indice'` | unidade `null`, `'dados_invalidos'` |
| `occupancy_by_table: [1, 2]` (2 mesas; a S01 tem 3) | mesas `null`, `'dados_invalidos'` |
| sem `updated_at` | data `null`, `'dados_invalidos'` |
| `room_id: 'S02'` | tudo `null`, `'dados_invalidos'` |
| `device_status: 'offline'` e temperatura `null` | temperatura `null`, status `'offline'` |

- **A origem:** só sai `'iot'` quando pedem `'iot'` (ou não dizem nada). Qualquer outro valor (`'mock'`, `'IOT'`, `''`, `null`) sai `'mock'`. Na dúvida, a tela nunca diz que uma leitura inventada veio do Wokwi (RN-10).

#### `montarSalaDemo(metaSala, leitura)`

- **Recebe:** a sala do `data/` e a leitura fictícia dela (do `LEITURAS_DEMO`).
- **Devolve:** a sala normalizada, com `origem: 'demo'` e `atualizadoEm: null`. O `statusDispositivo` é `null` (sala demo não tem dispositivo), ou `'dados_invalidos'` se a leitura fictícia estiver errada.
- **Exemplo**, a S02:

```js
{ id: 'S02', nome: 'Sala de Estudo 02', porte: 'pequena',
  mesas: [0, 2], temperaturaC: 22,
  luz: { valor: 410, unidade: 'lux_estimado' }, ruidoDb: 42,
  origem: 'demo', statusDispositivo: null, atualizadoEm: null }
```

- **Por que passa pelas mesmas conferências da S01:** se alguém editar o `LEITURAS_DEMO` com um erro (3 mesas numa sala grande, luz negativa), a sala cai em `'falha'` com o motivo, em vez de mostrar uma capacidade errada em silêncio.
- **Sai copiada:** mudar as mesas da sala montada não muda o `data/salas.js`.

#### `montarSalas(linhaS01, origemS01 = 'iot')`

- **Recebe:** a linha da S01 (o `resposta[0]`, ou `null` se ainda não chegou) e a origem dela.
- **Devolve:** as **nove** salas normalizadas, na ordem S01 a S09.
- **Como:** percorre o `SALAS` com `.map`. Para a sala com `origem: 'iot'` (a S01), usa o `normalizarTelemetria`; para as outras oito, o `montarSalaDemo`.
- **Exemplo:** `montarSalas(null)` → a S01 sai com tudo `null` e `'sem_leitura'` (e, classificada, fica em `'falha'`); as outras oito saem com as leituras fictícias.
- **Por quê:** a leitura da S01 **nunca é inventada**. Sem linha, a tela mostra que não há leitura.
- **Na W6 ficou assim:** quem chama é o `hooks/useSalas.js` (3.10), a cada desenho: `montarSalas(linha, 'mock')` no modo de demonstração e `montarSalas(linha, 'iot')` no Supabase.

#### O teste: `web/src/domain/normalizar.test.js` (103 testes)

O exemplo do §6.3; números e listas em texto; o que vira `null` (temperatura vazia, `"22,8"`, `NaN`, mesas fora de 0 a 3, quantidade errada de mesas, JSON quebrado, luz negativa, unidade errada, hexadecimal, notação científica, datas incompletas); a leitura fora da faixa do sensor; a origem; a prioridade do status do ESP32; sem linha e linha errada (inclusive a lista inteira do Supabase, quando falta pegar o `[0]`); as salas demo, com leitura errada; e as nove salas juntas, do Supabase até o estado (o exemplo da S01 sai amarelo).

---

### 2.7 As nove salas, do começo ao fim

O que o `montarSalas` + `classificarSala` dá hoje, com os limiares **PROVISÓRIOS** e os seeds **[Dado fictício]** (a S01 com o exemplo do §6.3):

| Sala | Ocupação | Taxa | Temp. | Luz | Ruído (índice) | Estado |
|---|---|---:|---|---|---|---|
| S01 | `[1,2,0]`: 3 de 9, 1 mesa vazia | 33 % | 22,8 adequado | 410 adequado | 54 atenção (48) | **amarelo** |
| S02 | `[0,2]`: 2 de 6, 1 vazia | 33 % | 22 adequado | 410 adequado | 42 adequado (24) | **verde** |
| S03 | `[3,3]`: 6 de 6 | 100 % crítico | 18 atenção | 920 adequado | 71 crítico (82) | **vermelho** |
| S04 | `[1,1,1]`: 3 de 9 | 33 % | 21 adequado | 500 adequado | 46 atenção (32) | **amarelo** |
| S05 | `[0,3,3]`: 6 de 9, 1 vazia | 67 % atenção | 24 adequado | 350 adequado | 57 atenção (54) | **amarelo** |
| S06 | `[2,2,1]`: 5 de 9 | 56 % atenção | 19 atenção | 180 crítico | 61 atenção (62) | **vermelho** |
| S07 | `[0,0,1]`: 1 de 9, 2 vazias | 11 % | 23 adequado | 450 adequado | 39 adequado (18) | **verde** |
| S08 | `[3,2,1,0]`: 6 de 12, 1 vazia | 50 % | 25 adequado | 600 adequado | 53 atenção (46) | **amarelo** |
| S09 | `[3,3,3,2]`: 11 de 12 | 92 % crítico | 28 crítico | 760 adequado | 68 crítico (76) | **vermelho** |

Sem a linha da S01 (`montarSalas(null)`), a S01 fica em **falha** (`'sem_leitura'`), e as outras oito não mudam.

---

### 2.8 Como os testes foram feitos

**Um teste unitário** é um pedaço de código que chama **uma** função com um valor conhecido e confere se o resultado é o esperado. Se alguém mudar a função e quebrar a regra, o teste falha e avisa.

```js
it('sala cheia [3, 3, 3]: taxa 100', () => {
  expect(resumoOcupacao([3, 3, 3]).taxa).toBe(100)
})
```

- `describe('...', ...)` agrupa testes de um mesmo assunto.
- `it('...', ...)` é um teste, com a frase do que ele confere.
- `expect(x).toBe(y)` diz: "espero que `x` seja `y`". O `toEqual` compara listas e objetos pelo conteúdo; o `toThrow` espera um erro.
- `it.each([...])` roda o mesmo teste com vários valores (ex.: todas as bordas de um limite).

**O Vitest** é o programa que acha os arquivos `.test.js`, roda cada teste e mostra quantos passaram. No `npm test`, ele roda uma vez; no `npm run test:watch`, roda de novo a cada arquivo salvo.

**Como a W2 foi feita (TDD):** primeiro o teste, vendo ele **falhar** (vermelho); depois o código mínimo para ele **passar** (verde); depois a limpeza. Uma fatia de cada vez.

**Os números no fim da W2:** 7 arquivos de teste e **318 testes**, todos passando (os de agora estão em 3.16):

| Arquivo | Testes |
|---|---:|
| `services/configuracao.test.js` | 8 |
| `data/salas.test.js` | 10 |
| `domain/ocupacao.test.js` | 39 |
| `domain/limiares.test.js` | 20 |
| `domain/classificacao.test.js` | 106 |
| `domain/atualizacao.test.js` | 32 |
| `domain/normalizar.test.js` | 103 |

O Vitest não aparece nas aulas. Ele confere as regras a cada mudança e não aparece no site.

---

### Perguntas que o professor pode fazer (Parte 2)

**Por que o `domain/` não usa React?**
Porque são regras puras: recebem números e devolvem números. Sem React, dá para testar sem navegador e usar a mesma regra no card, no filtro e no ranking. É a separação que o edital pede (p. 42).

**Por que o `entrarNaMesa` devolve um array novo?**
Porque o `useState` do React só atualiza a tela quando recebe um valor novo. Se a função mudasse a mesma lista, o React acharia que nada mudou. A cópia também protege a lista original.

**Qual a diferença entre faixa e severidade?**
A faixa diz onde o valor está (baixo, médio, alto). A severidade diz se a sala está boa para usar (adequado, atenção, crítico). Exemplo: a S03 tem 920 lux, faixa **alta**, severidade **adequada** (CONTEXTO, §5.2).

**Por que a S01 não tem dado fixo?**
Porque ela mostra a última leitura do Wokwi pelo Supabase (CONTEXTO, §7.6). Um número fixo seria um dado inventado passando por leitura do sensor. Sem leitura, ela aparece como "sem leitura", em falha.

**O que é um teste unitário e o que o Vitest faz?**
Um teste unitário chama uma função com um valor conhecido e confere o resultado. O Vitest acha os arquivos `.test.js`, roda todos e diz quantos passaram.

**Por que frio também alerta? "Baixo" não é bom?**
Não. A RN-09 diz que temperatura e luz baixas demais também são ruins. Por isso esses dois indicadores têm limites embaixo (18 °C, 200 lux).

**Por que 18 °C é atenção e não crítico?**
Porque as comparações são estritas (`<` e `>`): o número do próprio limite fica do lado de dentro. Crítico é **abaixo** de 18.

**Por que o ruído e a ocupação têm `null` embaixo?**
Porque pouco barulho e sala vazia não são problema. `null` quer dizer "este lado não alerta".

**Por que a falha vem antes do vermelho?**
Para a sala nunca ficar verde (nem vermelha) por falta de leitura. Sem dado confiável, o certo é dizer "falha" (CONTEXTO, §5.2).

**Esses limiares são oficiais?**
Não. São uma **proposta** da parte web, com fontes (NR-17, NHO 11, NBR 10152, NBR 16401-2), **provisória** até o grupo aprovar. A ocupação nem tem norma: é critério do grupo.

**O índice de ruído 60 é o dobro do 30?**
Não. O dB é logarítmico (+10 dB = 10 vezes a intensidade), e o índice é só uma régua linear de 30 a 80 dB. Por isso ele se chama "intensidade do ruído".

**Por que o índice é arredondado com `Math.round`?**
Para dar sempre um número inteiro de 0 a 100. O `Math.round` arredonda o meio para cima (0,5 → 1), igual ao `round()` do C++ para números positivos. O `round()` do Python arredonda para o par (0,5 → 0), então o Python precisa de `math.floor(x + 0.5)` para dar o mesmo resultado.

**Por que o valor errado vira `null` e não `0`?**
Porque `0` é um valor: 0 dB, 0 pessoas. Trocar um erro por `0` mostraria uma sala vazia ou silenciosa que não existe. O `null` diz "não sei", e a sala vai para falha.

**Por que o total e as vagas não vêm do banco?**
Porque são derivados: dá para calcular das mesas. Se o banco guardasse o total, ele poderia ficar diferente da soma das mesas (CONTEXTO, §6.3, e RN-03).

**Por que as contas lançam erro, mas a `classificarSala` não?**
As contas lançam erro para nenhuma devolver um número errado em silêncio. A `classificarSala` valida antes e transforma o problema em `'invalido'`, porque a tela não pode quebrar por causa de uma leitura ruim.

**Por que o `normalizar` aceita `"22.8"` mas não `"22,8"`?**
O Supabase manda o número com ponto. A vírgula é o jeito brasileiro de escrever, mas o JavaScript não lê `"22,8"` como 22,8. Aceitar um formato só evita confusão.

**Por que existe o `lerDataIso` se o JavaScript já tem o `Date.parse`?**
Porque o `Date.parse` aceita textos como `"99"` (vira o ano 1999). O `lerDataIso` só aceita a data completa, com hora e fuso.

**O que quer dizer `a ?? b` e o `...`?**
`a ?? b`: use `a`; se ele for `null` ou `undefined`, use `b`. Os três pontos (`...`, o *spread*) copiam os itens de uma lista ou os campos de um objeto para outro.

**Por que o `normalizar.js` importa o `data/salas.js`, se o `domain/` é puro?**
O `data/salas.js` só tem dados, nenhuma função, e não usa rede nem `localStorage`. O `domain/` continua puro. É o único import de fora do `domain/`, e só para o `montarSalas` saber quais são as nove salas.

**O que é a origem `'mock'`?**
É a leitura de demonstração da S01, usada quando não há Supabase. Ela sai rotulada como `'mock'` para a tela nunca dizer que veio do Wokwi (RN-10).

---

## Parte 3 — A lógica das telas (W4, W5 e W6)

Esta parte explica o que fica **por trás** das telas: os favoritos e as listas (W4, o CRUD), os filtros e os atalhos com o ranking (W5) e a S01 pela API, com o polling e o modo de demonstração (W6). Entra também o login fictício, que a tela de entrada usa. São arquivos novos nas três camadas: `domain/` (as regras), `services/` (o acesso aos dados) e `hooks/` (o estado e os efeitos). **Os componentes de tela entram na Parte 4.**

### 3.0 Como os arquivos da Parte 3 se ligam

```text
domain/filtros.js          ← limiares.js
domain/ranking.js          ← limiares.js
domain/colecoes.js         (não importa nada)
domain/sessao.js           (não importa nada)
domain/formatar.js         (não importa nada)

services/telemetria.js     ← services/configuracao.js
services/colecoesLocais.js ← domain/colecoes.js
services/sessaoDemo.js     (não importa nada)

hooks/useSalas.js          ← domain/normalizar, classificacao, atualizacao;
                             services/configuracao, telemetria
hooks/useColecoes.js       ← data/salas, domain/colecoes, services/colecoesLocais
hooks/useFiltros.js        ← domain/filtros, ranking
hooks/useSessaoDemo.js     ← domain/sessao, services/sessaoDemo
```

A seta do mapa continua valendo: `components → hooks → (services, domain) → data`. O `domain/` continua puro: nenhum arquivo dele usa React, `fetch`, `localStorage`, `sessionStorage`, `window` ou `document` (conferido com `grep`; está no IMPLEMENTATION_STATUS.md). Os `services/` não usam React.

**O caminho de um dado, agora completo:**

```text
Supabase (a linha da S01)  ou  o simulador (modo mock)
   → services/telemetria.js   buscarLeituraS01: a linha crua
   → hooks/useSalas.js        guarda a linha; pede de novo a cada 5 s
   → domain/normalizar.js     montarSalas: as nove salas normalizadas
   → domain/classificacao.js  classificarSala: faixas, severidades, estado
   → hooks/useFiltros.js      filtrarItens e depois ranquearItens
   → as telas (Parte 4)

localStorage   ↔ services/colecoesLocais.js ↔ hooks/useColecoes.js   (favoritos e listas)
sessionStorage ↔ services/sessaoDemo.js     ↔ hooks/useSessaoDemo.js  (o login fictício)
```

**A palavra mais importante da Parte 3: o item.** É como o `useSalas` entrega cada sala para os filtros, para o ranking e para as telas:

```js
{ sala, classificacao, desatualizada }
// sala:          a sala normalizada (normalizar.js)
// classificacao: o resultado do classificarSala (classificacao.js)
// desatualizada: true se a leitura está velha (atualizacao.js)
```

Os filtros e o ranking recebem uma lista de itens e devolvem uma lista **nova** de itens.

---

### 3.1 `web/src/domain/filtros.js`

Os filtros manuais do painel (CONTEXTO, §7.4; RN-06 e RN-14). Aqui só se decide se cada sala passa; quem guarda o que a pessoa escolheu é o hook `useFiltros` (3.12).

#### `FILTROS_VAZIOS`

```js
{ ocupacaoMin: null, ocupacaoMax: null,
  temperaturaMin: null, temperaturaMax: null,
  luzMin: null, luzMax: null,
  ruidoMin: null, ruidoMax: null,
  exigirMesaLivre: false, somenteFavoritas: false }
```

Nenhum filtro ligado. São 8 **limites** (um mínimo e um máximo para cada indicador) e 2 **opções** (as caixas de marcar). `null` quer dizer "sem limite". As unidades: ocupação em **pessoas na sala** (o total, não a taxa), temperatura em °C, luz em lux estimado e ruído em dB simulados. O objeto é congelado (`Object.freeze`): ninguém muda o "vazio" sem querer.

#### As funções internas

- **`ehLimite(valor)`:** um limite só vale se for um número finito. `null`, `undefined`, `NaN` e qualquer texto (até `'20'`) querem dizer "sem limite". O `0` é um limite de verdade.
- **`passaNoIntervalo(valor, minimo, maximo)`:** confere com as **duas bordas** dentro (`>=` e `<=`, RN-14). Sem mínimo e sem máximo, passa tudo (até `null`). Com algum limite ligado, um valor `null` **não** passa: não dá para dizer que está dentro. Se a pessoa digitar ao contrário (mínimo 6, máximo 3), os dois são trocados.
- **`luzEmLux(luz)`:** a luz só é comparada se estiver em `'lux_estimado'`; em outra unidade, conta como "a sala não tem o valor".

#### `valorDoFiltro(campo, valor)`

- **Recebe:** o nome do filtro (um dos do `FILTROS_VAZIOS`) e o que veio do campo da tela: o `evento.target.value`, que é **texto**, ou o `evento.target.checked`, nas caixas.
- **Devolve:** nos limites, o número ou `null`; nas opções, `true` ou `false`. Lança erro se o campo não existir.
- **Exemplos** (conferidos rodando o código):

| Campo e valor | Resultado | Por quê |
|---|---|---|
| `ruidoMax`, `''` (campo apagado) | `null` | sem limite |
| `ruidoMax`, `'45'` | `45` | |
| `temperaturaMin`, `'22,5'` ou `'22.5'` | `22.5` | a vírgula é o jeito brasileiro |
| `luzMin`, `'1.000'` | `1000` | o ponto seguido de 3 dígitos separa os milhares |
| `ocupacaoMin`, `'0'` | `0` | o 0 é um limite de verdade |
| `ocupacaoMin`, `'  '` ou `'abc'` | `null` | não é número |
| `exigirMesaLivre`, `true` | `true` | |
| `exigirMesaLivre`, `'true'` | `false` | só o `true` de verdade liga |
| `'umidade'`, `'3'` | erro "Filtro desconhecido: ..." | erro de quem programou |

- **Por que não usar só o `Number()`:** o `Number('')` e o `Number('  ')` dão **0**, e o 0 é um limite: apagar o campo ligaria um filtro "ocupação mínima 0" sem a pessoa pedir. Por isso o texto é conferido antes, com uma expressão regular (o mesmo formato simples do `normalizar.js`, mais a vírgula).
- **Por que `'1.000'` vira mil:** na luz, que vai até 100.000 lux, quem digita "1.000" quer dizer mil. Lido como decimal, viraria 1, e o filtro faria o contrário do que a pessoa pediu, sem avisar. O ponto seguido de 1, 2 ou 4 dígitos (`'22.5'`, `'22.50'`) continua sendo a casa decimal.

#### `contarFiltrosAtivos(filtros)`

- **Recebe:** os filtros. **Devolve:** quantos estão ligados, de 0 a 10 (o número que aparece no botão dos filtros).
- **Exemplo:** `{ ocupacaoMin: 0, ruidoMax: 45, exigirMesaLivre: true, luzMin: '20' }` → **3**. O `0` conta; o texto `'20'` não (não é número).

#### `itemPassaNosFiltros(item, filtros, favoritos = [])`

- **Recebe:** um item, os filtros e a lista dos ids favoritos.
- **Devolve:** `true` se a sala passa em **todos** os filtros ligados.
- **De onde vêm os valores:** da classificação (`ocupacao.total`, `temperatura.valor`, `luz.valor`, `ruido.valor`), onde uma leitura com problema já virou `null`.
- **`exigirMesaLivre`:** pede pelo menos uma mesa com **0** pessoas. Mesa com 1 ou 2 pessoas não conta (RN-06).
- **`somenteFavoritas`:** deixa só as salas cujo id está nos favoritos.
- **A S01 sem leitura:** sem nenhum filtro, ela aparece (com o aviso de falha). Com qualquer filtro de valor ligado, ela não passa.

#### `filtrarItens(itens, filtros, favoritos = [])`

- **Recebe:** a lista de itens, os filtros e os favoritos. **Devolve:** uma **lista nova** só com os que passam, na mesma ordem.
- **Exemplos** com os seeds **[Dado fictício]** e a S01 sem leitura (conferidos rodando o código):

| Filtro | Passam |
|---|---|
| nenhum | as nove, S01 a S09 |
| ocupação de 3 a 6 pessoas (o T-11) | S03 (6), S04 (3), S05 (6), S06 (5), S08 (6) |
| ocupação exatamente 3 (mínimo 3 e máximo 3) | S04 |
| ocupação de 6 a 3 (digitado ao contrário) | as mesmas do 3 a 6 |
| pelo menos uma mesa totalmente livre | S02, S05, S07, S08 |
| ruído até 45 dB simulados | S02 (42), S07 (39) |
| temperatura de 21 a 25 °C | S02, S04, S05, S07, S08 |
| somente favoritas, com os favoritos `['S01', 'S07']` | S01, S07 |

- **Por que as bordas contam:** a RN-14 pede intervalos **inclusivos**: "entre 3 e 6" inclui a sala com 3 e a com 6 pessoas.

#### O teste: `web/src/domain/filtros.test.js` (62 testes)

O `FILTROS_VAZIOS`; a contagem dos ativos; as nove salas com cada filtro do painel (os exemplos acima); a mesa totalmente livre; a sala sem o valor; os favoritos; e o `valorDoFiltro` com texto vazio, só espaços, vírgula, ponto, milhar, notação científica, hexadecimal, `'Infinity'`, as caixas e o campo que não existe.

---

### 3.2 `web/src/domain/ranking.js`

Os três atalhos e o ranking (CONTEXTO, §7.5; RN-06 e RN-15). Para cada atalho, três passos:

1. **Elimina** quem não serve. Essa sala não ganha nota.
2. **Pontua** as outras de 0 a 100: cada indicador vale um peso, e a sala ganha o peso inteiro, a metade ou nada, pela severidade do `classificacao.js`.
3. **Ordena** da maior nota para a menor, com um desempate fixo.

É só conta, sem sorteio: a mesma entrada dá sempre a mesma ordem (RN-15: rankings "determinísticos, explicáveis").

#### `ATIVIDADES`

Os três atalhos, na ordem da tela: `{ id: 'sozinho', nome: 'Estudar sozinho' }`, `{ id: 'grupo', nome: 'Trabalho em grupo' }` e `{ id: 'video', nome: 'Gravar vídeo' }`. Cada um tem também um `resumo` curto para a tela (ex.: "Precisa de uma mesa totalmente livre").

#### `PESOS` (PROVISÓRIO)

Quanto cada indicador vale em cada atalho. Os pesos de cada atalho **somam 100**, e por isso a nota vai de 0 a 100.

| Atalho | Ruído | Temperatura | Luz | Ocupação | Mesas livres |
|---|---:|---:|---:|---:|---:|
| Estudar sozinho | 40 | 20 | 20 | 20 | — |
| Trabalho em grupo | 20 | 10 | 10 | 25 | 35 |
| Gravar vídeo | 45 | 10 | 30 | 15 | — |

O comentário no código diz: **PROVISÓRIO**, proposta da parte web; o CONTEXTO, §7.5, deixa os pesos "a definir" pelo grupo, e as notas não podem ser apresentadas como se fossem cientificamente calibradas. Os números ficam também no REGRAS_E_LIMIARES.md, §4.

**Por que esses pesos:** cada atalho pesa mais o que o CONTEXTO, §7.5, diz que ele prefere. Sozinho: o silêncio primeiro. Grupo: a mesa totalmente livre e a sala vazia primeiro. Vídeo: o ruído e a luz.

#### As constantes internas (todas PROVISÓRIAS)

- **`PARTE_DO_PESO`** = `{ adequado: 1, atencao: 0.5, critico: 0 }`: adequado ganha o peso inteiro, atenção a metade, crítico nada. Sem leitura (`'invalido'`), nada.
- **`MESAS_LIVRES_PARA_O_PESO_INTEIRO`** = `2`: no grupo, 1 mesa vazia vale a metade do peso; 2 ou mais, o peso inteiro.
- **`PONTOS_A_MENOS_SE_DESATUALIZADA`** = `15`: a sala com a leitura velha continua no ranking, com aviso, mas perde 15 pontos, porque não é a medição de agora (o CONTEXTO, §7.5, pede para decidir isso).

#### Passo 1: as eliminações (`motivoDaEliminacao`, interna)

Nesta ordem; a primeira que pegar é a que aparece na tela:

| Regra | Vale para | Frase na tela |
|---|---|---|
| o estado não é verde, amarelo nem vermelho (é `'falha'`) | os três | "Sem leitura confiável" |
| nenhum lugar vago | sozinho e vídeo | "Sala lotada" |
| nenhuma mesa com 0 pessoas (RN-06) | grupo | "Nenhuma mesa totalmente livre" |
| ruído crítico | vídeo | "Barulhenta demais para gravar" |

Por causa da ordem, a S03 no vídeo sai como "Sala lotada": ela também é barulhenta, mas a lotação vem antes. A comparação `!(ocupacao.vagas >= 1)` também pega o `null` e o `undefined`: sem número, não dá para dizer que há lugar.

#### Passo 2: a nota (`calcularPontuacao`, interna)

Soma os pontos de cada indicador e arredonda com `Math.round`:

- ruído, temperatura e luz: **peso × parte do peso** (1, 0,5 ou 0, pela severidade);
- ocupação: **peso × vagas ÷ capacidade** (sala vazia ganha o peso inteiro; sala cheia, nada);
- mesas livres (só no grupo): **peso × (mesas vazias, no máximo 2) ÷ 2**;
- se a leitura está desatualizada, tira 15 (nunca abaixo de 0).

**Exemplo feito à mão**, a S07 no "Estudar sozinho" (**[Dado fictício]**: `[0, 0, 1]`, 23 °C, 450 lux, 39 dB):

```text
ruído 39 dB, adequado          40 × 1      = 40
temperatura 23 °C, adequado    20 × 1      = 20
luz 450 lux, adequado          20 × 1      = 20
ocupação: 8 vagas de 9         20 × 8 ÷ 9  = 17,78
                               soma 97,78 → Math.round → 98
```

A mesma S07 no "Trabalho em grupo": mesas livres 35 × 2 ÷ 2 = 35; ocupação 25 × 8 ÷ 9 = 22,22; ruído 20; temperatura 10; luz 10 → 97,22 → **97**.

**Por que vagas ÷ capacidade, e não a taxa:** dá o mesmo que (1 − taxa ÷ 100), mas parte de números inteiros. O computador guarda uma taxa como 16,666...% só aproximada, e a conta com ela pode errar na última casa: 15 × (1 − 16,666.../100) dá 12,499999999999998, e não 12,5. Uma nota que terminasse em ,5 arredondaria para baixo.

#### Os motivos (as frases do "por quê")

Cada sala que entra recebe **4 frases curtas**, do indicador que mais pesa para o que menos pesa:

| Atalho | As 4 frases, nesta ordem |
|---|---|
| Estudar sozinho | ruído, vagas, temperatura, luz |
| Trabalho em grupo | mesas livres, ocupação, ruído, temperatura (a luz, com o mesmo peso da temperatura, fica de fora para caber em 4) |
| Gravar vídeo | ruído, luz, vagas, temperatura |

As frases mudam com a severidade e com o lado (RN-09: frio e escuro também são ruins): "Silenciosa / Um pouco barulhenta / Barulhenta (N dB simulados)", "Temperatura confortável / Um pouco fria (ou quente) / Fria (ou Quente) demais (N °C)", "Boa iluminação / Pouca luz (ou Luz forte) / Escura (ou Clara) demais (N lux estimado)". Os números saem com vírgula (`'22,8'`). Na sala desatualizada, "Leitura desatualizada" vem **primeiro** e entra no lugar da última frase.

#### `avaliarItem(item, atividadeId)`

- **Recebe:** um item e o id do atalho (`'sozinho'`, `'grupo'` ou `'video'`).
- **Devolve:** `{ elegivel, pontuacao, motivos, eliminadaPor }`. A sala eliminada sai com `pontuacao: null`, `motivos: []` e o porquê em `eliminadaPor`. Lança erro se o atalho não existir (`'festa'`): é erro de quem programou, como o `limiaresDe` do `classificacao.js`.
- **Exemplos** (conferidos rodando o código):

```js
avaliarItem(S07, 'sozinho')
// { elegivel: true, pontuacao: 98, eliminadaPor: null,
//   motivos: ['Silenciosa (39 dB simulados)', '8 lugares vagos',
//             'Temperatura confortável (23 °C)', 'Boa iluminação (450 lux estimado)'] }

avaliarItem(S07, 'grupo').motivos
// ['2 mesas totalmente livres', '1 de 9 lugares ocupados',
//  'Silenciosa (39 dB simulados)', 'Temperatura confortável (23 °C)']

avaliarItem(S06, 'sozinho')   // nota 39
// motivos: ['Um pouco barulhenta (61 dB simulados)', '4 lugares vagos',
//           'Um pouco fria (19 °C)', 'Escura demais (180 lux estimado)']

avaliarItem(S04, 'grupo')
// { elegivel: false, pontuacao: null, motivos: [],
//   eliminadaPor: 'Nenhuma mesa totalmente livre' }
```

A S04 (`[1, 1, 1]`) tem 6 lugares vagos, mas espalhados em mesas com gente: não serve para grupo (RN-06).

- **A S01 desatualizada** (o exemplo do §6.3 visto 60 s depois do `updated_at`, com o limite de 30 s): no "Estudar sozinho", a nota cai de 73 para **58**, e os motivos começam com "Leitura desatualizada".

#### O desempate (`compararElegiveis`, interna)

Na mesma nota, nesta ordem: **menor taxa de ocupação**; depois **mais mesas totalmente livres**; por fim o **menor id** (`'S01'` antes de `'S02'`). Assim nunca sobra empate entre duas salas diferentes.

**Exemplo:** com a S01 do §6.3, no "Estudar sozinho", a S01 e a S04 empatam com **73** e com a mesma taxa (3 de 9). A S01 tem 1 mesa vazia, a S04 nenhuma: a S01 fica em 3º e a S04 em 4º.

A comparação usa `<` e `>` (a função interna `compararValores`), e não `a − b`: um valor que faltar nunca vira `NaN` e bagunça a ordem. Os ids são comparados como texto, do mesmo jeito em todo navegador (sem o `localeCompare`, que depende do idioma).

#### `ranquearItens(itens, atividadeId)`

- **Recebe:** a lista de itens (já filtrada) e o id do atalho, ou `null` se a pessoa não escolheu nenhum.
- **Devolve:** uma **lista nova** de `{ ...item, avaliacao, posicao }`:
  - **sem atalho:** a ordem de entrada (S01 a S09), com `avaliacao: null` e `posicao: null`;
  - **com atalho:** primeiro as elegíveis, da maior nota para a menor, com a posição 1, 2, 3...; depois as que saíram, por id, com `posicao: null`.
- Confere o atalho antes, mesmo com a lista vazia. Não muda a lista recebida (o `filter` cria uma lista nova antes do `sort`).

**As notas de hoje**, com os pesos **PROVISÓRIOS**, os seeds **[Dado fictício]** e a S01 sem leitura:

| Atalho | A ordem (nota) | Saem |
|---|---|---|
| Estudar sozinho | 1º S07 (98), 2º S02 (93), 3º S04 (73), 4º S08 (70), 5º S05 (67), 6º S06 (39), 7º S09 (22) | S01 (Sem leitura confiável), S03 (Sala lotada) |
| Trabalho em grupo | 1º S07 (97), 2º S02 (74), 3º S08 (60), 4º S05 (56) | S01 (Sem leitura confiável); S03, S04, S06 e S09 (Nenhuma mesa totalmente livre) |
| Gravar vídeo | 1º S07 (98), 2º S02 (95), 3º S04 (73), 4º S08 (70), 5º S05 (68), 6º S06 (34) | S01 (Sem leitura confiável), S03 (Sala lotada), S09 (Barulhenta demais para gravar) |

Com a S01 do exemplo do §6.3 (leitura em dia), ela entra em 3º nos três: 73 no sozinho, 64 no grupo e 73 no vídeo.

#### O teste: `web/src/domain/ranking.test.js` (79 testes)

Os três atalhos e os pesos (cada atalho soma 100); cada atalho com as salas demo, com as notas **calculadas à mão** num comentário ao lado de cada caso; as eliminações e a ordem delas; os motivos; a desatualizada; a ordem sem atalho; o desempate em cada nível; a mesma ordem com a entrada invertida ou misturada (RN-15); e o atalho desconhecido.

---

### 3.3 `web/src/domain/colecoes.js`

As **regras do CRUD** dos favoritos e das listas (CONTEXTO, §7.7; RN-12). Aqui não se lê nem se grava nada: só se calcula a **versão nova** das preferências. Quem grava é o `services/colecoesLocais.js` (3.7); quem guarda no estado é o `useColecoes` (3.11).

**A regra principal: nunca mudar o que foi recebido.** Cada função devolve um objeto novo, pelo mesmo motivo do `entrarNaMesa` (2.2): o React só desenha de novo quando recebe um valor novo.

O formato é o do CONTEXTO, §7.7, com os nomes em inglês do JSON salvo:

```js
{ schema_version: 1,
  favorites: ['S01', 'S07'],
  lists: [{ id: '...', name: 'Para trabalho em grupo', room_ids: ['S02', 'S07', 'S08'] }] }
```

#### `PREFERENCIAS_VAZIAS` e `NOME_LISTA_MAX`

- **`PREFERENCIAS_VAZIAS`:** versão 1, sem favoritos e sem listas. Congelada também por dentro: um `push` nela estragaria o "vazio" de todo mundo.
- **`NOME_LISTA_MAX = 40`:** o tamanho máximo do nome de uma lista, para caber na tela (escolha da parte web).

#### `formatoConhecido(bruto)`

- **Recebe:** o que foi lido do `localStorage`, já passado pelo `JSON.parse`. **Devolve:** `true` só se for um objeto com `schema_version === 1` (o número).
- **Exemplo:** `{ schema_version: 2 }` → `false`; `{ schema_version: '1' }` (texto) → `false`.
- **Por quê:** outra versão do formato pode querer dizer outra coisa. Quem lê usa esta função para **avisar** a pessoa, em vez de começar do zero em silêncio.

#### `sanearPreferencias(bruto, idsValidos)`

- **Recebe:** o que foi lido e a lista dos ids das salas que existem (`SALAS.map((sala) => sala.id)`).
- **Devolve:** preferências válidas. Lixo (`null`, texto, lista, outra versão) vira o vazio, sem lançar erro. Só lança erro se o `idsValidos` não for uma lista: sem ela, todos os favoritos seriam apagados sem aviso.
- **O que ele arruma:**
  - nos favoritos e nas salas de cada lista, ficam só os ids que existem, sem repetir;
  - a lista sem `id` em texto ou sem nome some; com `id` repetido, fica a primeira;
  - um `room_ids` que não é uma lista vira `[]` (a lista continua);
  - os campos fora do formato (ex.: `cor`) são descartados;
  - o nome sai limpo, com no máximo 40 caracteres e sem repetir o de outra lista (o repetido ganha " (2)", " (3)"...).
- **Exemplo** (conferido rodando o código):

```js
sanearPreferencias({
  schema_version: 1,
  favorites: ['S07', 'S99', 'S07', 3],
  lists: [
    { id: 'a', name: 'Grupo', room_ids: ['S02', 'S10'], cor: 'azul' },
    { id: 'b', name: '  grupo  ', room_ids: 'S02' },
    { id: '', name: 'Sem id' },
  ],
}, idsDasNoveSalas)
// { schema_version: 1, favorites: ['S07'],
//   lists: [{ id: 'a', name: 'Grupo', room_ids: ['S02'] },
//           { id: 'b', name: 'grupo (2)', room_ids: [] }] }
```

#### O nome da lista: três cuidados

As funções internas (`semInvisiveis`, `temAlgoVisivel`, `caracteres`, `limparNome`, `nomeParaComparar` e `nomeSemRepetir`) cuidam de três casos que a pessoa não vê:

- **Caracteres invisíveis.** Um nome colado de outro lugar pode trazer o espaço de largura zero (U+200B), o *word joiner* (U+2060) ou o BOM (U+FEFF). Eles saem do nome. Um nome só com invisíveis conta como vazio.
- **Emojis.** O `texto.length` do JavaScript conta um emoji como 2 (ele guarda o emoji em duas metades), e o `slice` pode cortar entre as duas, deixando um "�". O `Array.from(texto)` separa pelos caracteres de verdade: um emoji conta como 1.
- **Maiúsculas e espaços.** "Grupo" e "  grupo  " são o mesmo nome: a comparação tira os espaços em volta e passa para minúsculas.

#### `alternarFavorito(prefs, salaId)`

- **Recebe:** as preferências e o id da sala. **Devolve:** as preferências novas: favorita se ainda não era (vai para o fim), desfavorita se já era.
- **Exemplo:** a partir do vazio, `'S07'` → `favorites: ['S07']`; depois `'S01'` → `['S07', 'S01']`; depois `'S07'` de novo → `['S01']`.

#### `validarNomeLista(prefs, nome, ignorarListaId = null)`

- **Recebe:** as preferências, o nome digitado e, ao renomear, o id da própria lista (que não conta como repetida).
- **Devolve:** `{ ok, nome, erro }`, com o nome já limpo.

| Nome digitado | `erro` |
|---|---|
| `'   '` (só espaços) | "Dê um nome para a lista." |
| 41 letras | "Use até 40 caracteres." |
| `'para TRABALHO em grupo'`, já existindo "Para trabalho em grupo" | "Já existe uma lista com esse nome." |
| `'  Para trabalho em grupo  '`, sem outra igual | `null` (ok), com o nome `'Para trabalho em grupo'` |

#### `criarLista(prefs, nome, novoId)`

- **Recebe:** as preferências, o nome e o id da lista nova (o hook gera com `crypto.randomUUID()`).
- **Devolve:** `{ prefs, erro }`. Deu certo: a lista nova, vazia, no fim, e `erro: null`. Deu errado: as **mesmas** preferências recebidas e a mensagem (assim o hook não grava nada). Um id vazio ou repetido dá "Não foi possível criar a lista. Tente de novo."
- **Exemplo:** `criarLista(prefs, '  Para trabalho em grupo  ', 'id-1')` → `lists: [{ id: 'id-1', name: 'Para trabalho em grupo', room_ids: [] }]`, `erro: null`.

#### `renomearLista(prefs, listaId, nome)`

- **Devolve:** `{ prefs, erro }`. Confere primeiro se a lista existe ("Lista não encontrada.") e depois o nome, ignorando a própria lista: dá para trocar só as maiúsculas ("grupo" → "Grupo"). A lista fica no mesmo lugar e com as mesmas salas.

#### `excluirLista(prefs, listaId)`

- **Devolve:** as preferências sem aquela lista. Os favoritos não mudam. A confirmação ("Tem certeza?") é da tela, antes de chamar.

#### `adicionarSalaNaLista(prefs, listaId, salaId)` e `removerSalaDaLista(prefs, listaId, salaId)`

- **Devolvem:** as preferências novas. Adicionar põe a sala no fim, **sem duplicar**: `'S02'`, `'S07'` e `'S07'` de novo dão `room_ids: ['S02', 'S07']` (o T-16). Remover tira a sala; se ela não estava lá, nada muda.

**As quatro letras do CRUD:**

| Letra | Onde |
|---|---|
| **C**reate (criar) | `criarLista`, `adicionarSalaNaLista` e `alternarFavorito` (favoritar) |
| **R**ead (consultar) | as listas e os favoritos lidos pelo `lerPreferencias` (3.7) e devolvidos pelo `useColecoes` (3.11) |
| **U**pdate (atualizar) | `renomearLista` |
| **D**elete (excluir) | `excluirLista`, `removerSalaDaLista` e `alternarFavorito` (desfavoritar) |

#### O teste: `web/src/domain/colecoes.test.js` (90 testes)

O vazio congelado; o saneamento (versões, lixo, ids que não existem, repetidos, nomes com invisíveis, emojis, cortes e nomes repetidos); o `formatoConhecido`; e cada função do CRUD, inclusive que a entrada nunca muda e que tudo funciona a partir do `PREFERENCIAS_VAZIAS` congelado.

---

### 3.4 `web/src/domain/sessao.js`

O login **fictício** (CONTEXTO, §3.1, item 13, e §6.4; RN-13). O topo do arquivo diz: **"isto NÃO é segurança"**.

#### `CREDENCIAIS_DEMO` (PROVISÓRIO)

```js
{ matricula: 'RM000000', senha: 'salas2026' }
```

As mesmas para todo mundo. A matrícula é claramente falsa: nunca o RM de um aluno de verdade. **PROVISÓRIO:** ainda não foram combinadas com o grupo. A tela de entrada mostra as duas, porque é uma demonstração.

#### `conferirCredenciais(matricula, senha)`

- **Recebe:** o que foi digitado nos dois campos. **Devolve:** `{ ok, erro }`.
- **A matrícula** tem os espaços cortados e é comparada em maiúsculas. **A senha** é comparada exatamente como foi digitada, mas uma senha só com espaços conta como vazia.

| Matrícula, senha | Resultado |
|---|---|
| `'RM000000'`, `'salas2026'` | `{ ok: true, erro: null }` |
| `' rm000000 '`, `'salas2026'` | `{ ok: true, erro: null }` |
| `''`, `''` ou `'RM000000'`, `'   '` | "Preencha a matrícula e a senha." |
| `'RM000000'`, `' salas2026'` (espaço na frente) | "Matrícula ou senha incorreta. Use o acesso de demonstração." |
| `'RM123456'`, `'salas2026'` | a mesma mensagem |

#### O teste: `web/src/domain/sessao.test.js` (18 testes)

As credenciais, as maiúsculas e os espaços da matrícula, a senha exata, os campos vazios e os valores que não são texto (`null`, número).

---

### 3.5 `web/src/domain/formatar.js`

Como os números e as horas aparecem na tela, no jeito brasileiro. Foi feito junto com as telas, que o usam (Parte 4).

- **`formatarNumero(valor, casas = 1)`:** `22.8` → `'22,8'`; `410` → `'410'`; sem valor → `'—'`.
- **`formatarPorcento(valor)`:** `33.33` → `'33%'`.
- **`formatarHora(ms, comSegundos)`:** a hora no fuso do navegador; `'2026-11-08T14:32:05Z'` em Brasília → `'11:32:05'`.
- **`contar(quantidade, singular, plural)`:** `contar(1, 'mesa', 'mesas')` → `'1 mesa'`; com 2 → `'2 mesas'`.
- **`NOME_FAIXA`, `NOME_SEVERIDADE`, `NOME_ESTADO` e `NOME_PORTE`:** as palavras da tela para cada valor do domínio (ex.: `'atencao'` → "atenção"; `'falha'` → "Sem leitura").

O teste, `formatar.test.js`, tem 6 testes.

---

### 3.6 `web/src/services/telemetria.js`

A leitura da S01, de dois jeitos (CONTEXTO, §6.3): no **Supabase** (a linha que o ESP32 do Wokwi atualiza) ou no **modo de demonstração** (um simulador, sem rede). Ele só busca a **linha crua**, no formato da tabela `room_telemetry`; quem confere e arruma os valores é o `normalizar.js` (2.6). **A web só lê:** nunca escreve no Supabase.

**Antes, três palavras:**

- **`fetch`:** a função do navegador que faz um pedido HTTP (como na aula 14). Ela devolve uma **Promise**: um "vale" de um valor que vai chegar depois.
- **`async` / `await`:** o `await` espera a Promise sem travar a tela. Só pode ser usado dentro de uma função `async`, que também devolve uma Promise.
- **`AbortController`:** um "botão de cancelar" um pedido. O `controlador.signal` vai junto no `fetch`; o `controlador.abort()` cancela, e o `fetch` lança um erro com o nome `'AbortError'`.

#### As constantes (as três PROVISÓRIAS)

| Constante | Valor | Para quê |
|---|---:|---|
| `INTERVALO_ATUALIZACAO_MS` | 5000 (5 s) | de quanto em quanto tempo a web pede a leitura. PROVISÓRIO: depende do intervalo de envio do ESP32, que o Edge ainda não definiu |
| `LIMITE_DESATUALIZADO_SEGUNDOS` | 30 | depois de quantos segundos sem leitura nova a S01 mostra "Desatualizado" (o `STALE_AFTER_SECONDS` do CONTEXTO, §6.5). PROVISÓRIO: tem de ser maior que o intervalo de envio do ESP32 |
| `TEMPO_LIMITE_PEDIDO_MS` | 15000 (15 s) | quanto o hook espera um pedido antes de desistir. PROVISÓRIO: três intervalos de hoje; ninguém mediu a rede da FIAP |

O teste confere a **relação** entre elas (o limite e o tempo limite são maiores que o intervalo), em vez de repetir os números.

#### `buscarLeituraSupabase({ supabaseUrl, supabaseChave, signal })`

- **Recebe:** a URL do projeto, a chave **publicável** e, se quiser, o `signal` para cancelar.
- **Devolve** (é `async`): a linha da S01 (o objeto, não a lista), ou `null` se a tabela não tiver a S01.
- **O pedido:**

```text
GET https://<projeto>.supabase.co/rest/v1/room_telemetry?room_id=eq.S01&select=*
apikey: <chave publicável>
Authorization: Bearer <chave publicável>
```

- `room_id=eq.S01` é o filtro da API do Supabase ("room_id igual a S01"); por isso a resposta é uma **lista** com 0 ou 1 linha.
- `cache: 'no-store'`: a cada pedido, a leitura mais nova, nunca uma cópia guardada pelo navegador.
- A URL pode vir com o `/rest/v1/` que a página do Supabase mostra: a função interna `urlDoProjeto` tira as barras e o `/rest/v1` do fim. Sem isso, o pedido iria para `.../rest/v1/rest/v1/...` e daria um 404 que não explica nada.
- **Os erros** (todos em português, para a tela mostrar como vierem):

| O que aconteceu | O que a função faz |
|---|---|
| a chave é secreta (`sb_secret_...` ou um JWT com `service_role`) | lança "A chave do Supabase é SECRETA e não pode ficar no navegador. Use a chave publicável." **e nem faz o pedido** (é a segunda proteção; a primeira é o `lerConfiguracao`) |
| sem internet ou URL errada (o `fetch` falha) | lança "Não foi possível falar com a API. Confira a internet e a URL do Supabase." (o erro original fica no `cause`, para o console) |
| HTTP 401, 404, 500... | lança "A API respondeu com erro (HTTP 500)." |
| o corpo não é JSON, ou não é uma lista | lança "A API respondeu num formato inesperado." |
| a lista veio vazia | devolve `null` |
| o pedido foi cancelado pelo `signal` | lança o `AbortError` como veio, para o hook reconhecer |

#### O roteiro da demonstração e `criarSimuladorS01()`

No modo `mock`, não há Supabase: a S01 mostra um **roteiro fixo de 9 leituras inventadas**, que não vêm do Wokwi nem de sensor nenhum. Cada passo muda **um** valor do passo anterior, para a tela nunca dar um salto:

| Passo | Mesas | Temp. °C | Luz | Ruído | Estado | O que acontece |
|---:|---|---:|---:|---:|---|---|
| 1 | `[1, 0, 0]` | 22,5 | 450 | 38 | verde | sala calma |
| 2 | `[1, 1, 0]` | 22,5 | 450 | 38 | verde | uma pessoa senta na mesa 2 |
| 3 | `[1, 1, 0]` | 22,5 | 450 | 55 | amarelo | começa uma conversa |
| 4 | `[1, 1, 0]` | 23,5 | 450 | 55 | amarelo | a sala esquenta um pouco |
| 5 | `[1, 1, 0]` | 23,5 | 450 | 70 | vermelho | a conversa fica alta (ruído crítico) |
| 6 | `[1, 1, 0]` | 23,5 | 450 | 38 | verde | pedem silêncio |
| 7 | `[1, 1, 0]` | 23,5 | 250 | 38 | amarelo | fim de tarde: a luz cai |
| 8 | `[1, 0, 0]` | 23,5 | 250 | 38 | amarelo | a pessoa da mesa 2 vai embora |
| 9 | `[1, 0, 0]` | 23,5 | 450 | 38 | verde | acendem a luz |

Depois do 9, volta ao 1 (a temperatura volta a 22,5 °C). Com uma leitura a cada 5 s, uma volta leva 45 s. Os estados saem dos limiares **PROVISÓRIOS**. **Por que 9 e não 8:** com 8 passos não dá para os quatro indicadores mudarem, o ruído passar por atenção e por crítico e nenhum passo se repetir.

- **`criarSimuladorS01()`** **devolve** `{ proximaLeitura(agoraMs) }`. Cada chamada devolve o próximo passo, no formato da `room_telemetry`, com o `updated_at` = a hora recebida e `device_status: 'ok'`. O passo 1: `{ room_id: 'S01', occupancy_by_table: [1, 0, 0], temperature_c: 22.5, light_value: 450, light_unit: 'lux_estimado', noise_db_simulated: 38, device_status: 'ok', updated_at: '2026-11-08T14:32:00.000Z' }`.
- **Cada simulador guarda o seu passo** numa variável de dentro da função (`let passo = 0`): a `proximaLeitura` "lembra" dela entre uma chamada e outra (isso se chama *closure*). Dois simuladores andam separados.
- **Sai uma cópia nova a cada leitura:** mexer na linha recebida não estraga o roteiro.
- **Sem uma hora válida** (ou com uma que o `Date` não aceita, como `1e20`), usa o `Date.now()`: o `new Date(NaN).toISOString()` lançaria erro.
- **Na tela, a S01 do mock sai com `origem: 'mock'`**, nunca `'iot'` (RN-10): a tela diz que é demonstração.

#### `buscarLeituraS01(config, { signal, agoraMs, simulador } = {})`

- **Recebe:** a configuração (o que o `lerConfiguracao` devolve) e as opções: o `signal` (só o Supabase usa), a hora (só o mock usa) e o simulador (obrigatório no mock).
- **Devolve** (é `async`): a linha da S01, ou `null`.
- **Como decide:** só `'supabase'` vai à rede; **qualquer outro modo é a demonstração**. Na dúvida, nunca usa a rede. No mock sem simulador, lança um erro que diz o que passar.
- **Por que uma função só para os dois modos:** o hook não precisa saber de onde vem a leitura. Trocar o modo é trocar a variável `VITE_TELEMETRIA_MODO` no `.env.local`, sem mexer no código.

#### O teste: `web/src/services/telemetria.test.js` (42 testes)

O `fetch` é trocado por um falso (`vi.stubGlobal('fetch', ...)`), que devolve um `Response` de verdade do Node; o `vi.unstubAllGlobals()` devolve o `fetch` original depois de cada teste. Confere: a URL e os cabeçalhos; as URLs com `/rest/v1/`, barras e espaços; a lista com uma linha e a vazia; cada erro da tabela; a chave secreta (sem nenhum pedido); o cancelamento; o simulador (o formato, as cópias, a volta ao começo, a hora inválida); os estados do roteiro, passando cada linha pelo `normalizarTelemetria` e pelo `classificarSala` **de verdade** (se alguém mudar um limiar PROVISÓRIO e o roteiro deixar de passar pelos três estados, o teste avisa); e a relação entre as constantes.

---

### 3.7 `web/src/services/colecoesLocais.js`

Lê e grava os favoritos e as listas no `localStorage` (CONTEXTO, §7.7). **Só no navegador de quem usa:** nada vai para o Supabase. Outro navegador (ou outro perfil) tem as suas próprias listas, e limpar os dados do navegador apaga tudo (o T-15).

O armazenamento chega **como parâmetro** (no app, o `window.localStorage`), pelo mesmo motivo do `lerConfiguracao` receber o ambiente: o teste passa um falso.

#### `CHAVE_PREFERENCIAS`

```js
export const CHAVE_PREFERENCIAS = 'citizentech_user_preferences_v1'
```

A chave sugerida pelo CONTEXTO, §7.7. O `_v1` é a versão do formato.

#### `lerPreferencias(armazenamento, idsValidos)`

- **Recebe:** o armazenamento e os ids das salas que existem. **Devolve:** `{ prefs, aviso }`.
- **Nunca quebra a tela** e **só lê** (o que estava salvo não muda):

| O que está salvo | `prefs` | `aviso` |
|---|---|---|
| nada (o `getItem` devolve `null`) | o vazio | `null` (não é erro: a pessoa nunca salvou) |
| `{"schema_version":1,"favorites":["S07"],"lists":[]}` | `favorites: ['S07']` | `null` |
| `{quebrado` (JSON quebrado) | o vazio | "Não foi possível ler suas listas salvas; começamos do zero." |
| `{"schema_version":2}` (outro formato) | o vazio | o mesmo aviso |
| o navegador bloqueia (o `getItem` lança erro) | o vazio | o mesmo aviso |

- **Como:** o `getItem` e o `JSON.parse` ficam dentro de um `try/catch`. O `sanearPreferencias` fica **fora** do `try`, de propósito: um erro de programação (esquecer o `idsValidos`) tem de aparecer, e não virar só um aviso.
- **Por que avisar no formato desconhecido:** sem o aviso, a pessoa perderia as listas sem saber, porque na primeira mudança o hook gravaria o vazio por cima.

#### `salvarPreferencias(armazenamento, prefs)`

- **Recebe:** o armazenamento e as preferências. **Devolve:** `true` se gravou; `false` se o navegador recusou (cheio ou bloqueado), sem lançar erro.
- **Como:** `armazenamento.setItem(CHAVE_PREFERENCIAS, JSON.stringify(prefs))`, dentro de um `try/catch`. Exemplo: grava o texto `{"schema_version":1,"favorites":["S07"],"lists":[]}`.

#### O teste: `web/src/services/colecoesLocais.test.js` (24 testes)

Com um armazenamento **falso** feito à mão: um objeto com `getItem` e `setItem` sobre um `Map`, que guarda texto e devolve `null` para a chave que não existe, como o `localStorage`; e outro que lança `DOMException` (`SecurityError` ao ler, `QuotaExceededError` ao gravar). Confere cada linha da tabela acima, que ler não grava nada e que gravar e ler de volta dá o mesmo.

---

### 3.8 `web/src/services/sessaoDemo.js`

Guarda a sessão do login fictício no `sessionStorage` (RN-13). O `sessionStorage` é como o `localStorage`, mas **some ao fechar a aba**: cada aba entra de novo. Quem confere a matrícula e a senha é o `domain/sessao.js`; aqui só se guarda.

- **`CHAVE_SESSAO`** = `'citizentech_sessao_demo'`.
- **`lerSessao(armazenamento)`:** **devolve** a matrícula de quem entrou nesta aba, ou `null` (ninguém entrou, o JSON está quebrado, o formato não serve ou o navegador bloqueou).
- **`salvarSessao(armazenamento, matricula)`:** grava `{"matricula":"RM000000"}`. **Devolve** `true` ou `false`.
- **`apagarSessao(armazenamento)`:** apaga só a chave da sessão (o "Sair"); as listas ficam. **Devolve** `true` ou `false`.

**Nenhuma das três lança erro:** com o armazenamento bloqueado, a pessoa entra do mesmo jeito; só não continua dentro ao recarregar a página.

O teste, `sessaoDemo.test.js`, tem 10 testes, com o mesmo tipo de armazenamento falso.

---

### 3.9 Antes dos hooks: o que é um custom hook

Um **hook** é uma função do React que começa com `use`. Os da aula são o `useState` (guarda um valor e desenha a tela de novo quando ele muda) e o `useEffect` (roda um código **depois** de a tela ser desenhada, como ligar um timer ou ouvir um evento).

Um **custom hook** é uma função nossa, que também começa com `use`, usa esses hooks e devolve o que a tela precisa: os dados e as funções para mudar os dados. Ele tira o estado e os efeitos de dentro do componente, que fica só com o desenho. O edital diz que os custom hooks servem "para separar a lógica de negócio e o gerenciamento de estado da camada visual" (p. 42). É o mesmo jeito do `useLocalStorage` e do `useTasks` das aulas.

**Os três jeitos de usar os hooks que aparecem nesta parte:**

```js
// 1. useState com uma função inicial: a função roda só no primeiro desenho.
const [config] = useState(() => lerConfiguracao(import.meta.env))

// 2. useEffect com a lista de dependências e o return que desfaz.
useEffect(() => {
  const timer = setInterval(buscar, 5000) // liga
  return () => clearInterval(timer)       // desliga: quando a tela sai ou antes de rodar de novo
}, [config])                               // roda de novo só quando o config mudar

// 3. useRef: uma "caixa" que guarda um valor entre os desenhos, sem desenhar de novo.
const maisNova = useRef(prefs)
maisNova.current = novas
```

**As regras que o lint confere** (o ESLint com o plugin dos hooks, 3.15):

- os hooks são chamados sempre no topo da função, nunca dentro de um `if`;
- **nada de mudar o estado direto no corpo do `useEffect`** (um `set...` logo de cara): o estado só muda depois de um `await`, dentro de um timer ou dentro de um evento;
- **nada de ler um `ref` no desenho:** o `ref` só é lido nas ações (os cliques) e nos efeitos;
- **nada de `Date.now()` no desenho:** a hora entra pela função inicial do `useState` ou pelos timers.

**Por que os hooks não têm teste no projeto:** testar um hook precisa de uma biblioteca (como a *Testing Library*), que a turma não viu. As regras que os hooks usam já estão testadas no `domain/` e nos `services/`; nos hooks fica só a ligação. Como eles foram conferidos está em 3.16.

---

### 3.10 `web/src/hooks/useSalas.js`

As nove salas prontas para a tela, com a S01 sempre atualizada (o **polling**: perguntar de novo, de tempos em tempos). É aqui que a aplicação **consome a API externa**.

- **Recebe:** nada.
- **Devolve:**

| Campo | O que é |
|---|---|
| `itens` | as nove salas, na ordem S01 a S09, cada uma como `{ sala, classificacao, desatualizada }` |
| `carregando` | `true` só até a primeira resposta (ou até o primeiro pedido passar do tempo limite) |
| `erro` | a mensagem da última falha, ou `null`. Os dados de antes continuam |
| `modo` | `'mock'` ou `'supabase'` |
| `aviso` | o aviso do `lerConfiguracao` (ex.: "Faltam VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY; usando o mock."), ou `null` |
| `ultimaBusca` | a hora (em ms) da última resposta que chegou, ou `null` |
| `atualizarAgora` | uma função: busca de novo na hora |

#### Os estados

- **`config` e `simulador`:** no `useState` com função inicial. A configuração é lida **uma vez**, e o simulador é **um só** (o roteiro anda a cada busca). Ficam estáveis sem precisar de `ref`.
- **`linha`:** a última linha da S01 que chegou (`null` antes da primeira).
- **`carregando`, `erro` e `ultimaBusca`.**
- **`agora`:** a hora usada para o "Desatualizado".
- **`pedidosManuais`:** um contador dos cliques em "atualizar agora".

#### O primeiro efeito: a busca e o polling

```js
// React Hook useEffect: executa quando a tela abre (e de novo a cada "atualizar agora") e por
// isso agenda a primeira busca da S01 e liga o setInterval das próximas. O return desliga tudo
// quando a tela sai: para os timers e cancela o pedido que ainda não voltou (AbortController).
```

Dentro dele fica a função `async buscar()`:

1. **Um pedido por vez.** Se o anterior ainda não voltou, esta vez é pulada (sem cancelar o anterior).
2. Cria um `AbortController` e um `setTimeout` de **15 s** (`TEMPO_LIMITE_PEDIDO_MS`) que cancela o pedido se ele demorar.
3. `await buscarLeituraS01(config, { signal, agoraMs: Date.now(), simulador })`.
4. **Só depois do `await`** muda o estado:
   - chegou uma linha → `setLinha(linha)` e `setErro(null)`;
   - chegou a lista vazia (`null`) → a linha antiga **continua** (RN-11) e aparece o erro "A API não devolveu a leitura da S01 (a linha não existe ou não está liberada para leitura)."; no Supabase, isso acontece quando a linha não existe ou quando a RLS não deixa a chave publicável ler (ele responde 200 com `[]`, e não um erro);
   - deu erro → a linha antiga **continua** e aparece a mensagem do erro;
   - passou de 15 s → "A API demorou mais de 15 segundos para responder." (e a `ultimaBusca` não muda, porque não chegou resposta nenhuma).
5. Em toda resposta: `ultimaBusca` e `agora` recebem a hora da resposta, e `carregando` vira `false`.

Depois de definir o `buscar`, o efeito liga os dois timers e devolve a função que desliga tudo:

```js
const primeiraBusca = setTimeout(buscar, 0)
const timer = setInterval(buscar, INTERVALO_ATUALIZACAO_MS)

return () => {
  ligado = false              // nenhuma resposta atrasada muda mais a tela
  clearTimeout(primeiraBusca)
  clearInterval(timer)        // para o polling
  if (pedidoEmAndamento !== null) {
    pedidoEmAndamento.abort() // cancela o pedido que está no caminho
  }
}
```

- **Por que `setInterval`:** a API REST do Supabase não avisa quando a linha muda; quem quer a leitura nova tem de perguntar. O `setInterval` pergunta a cada 5 s.
- **Como ele para:** o `return` do `useEffect` roda quando a tela sai (a pessoa clica em "Sair" e o painel some) ou antes de o efeito rodar de novo (o "atualizar agora"). Ele faz o `clearInterval`, o `clearTimeout` e o `abort()`. Sem isso, o timer continuaria pedindo dados para uma tela que não existe mais.
- **A variável `ligado`:** uma resposta que chega **depois** de a tela sair não pode mudar o estado. O `return` põe `ligado = false`, e o `buscar` confere antes de cada `set...`.
- **Por que a primeira busca vai num `setTimeout(buscar, 0)`, e não direto:** em desenvolvimento, o `<StrictMode>` (1.3) roda o efeito, desfaz e roda de novo, na mesma hora. Chamada direto, a busca descartada já andaria um passo do roteiro, e a tela começaria no passo 2; no Supabase, seriam dois GET. Com o timer, o `return` do primeiro efeito limpa a busca antes de ela rodar.
- **Por que o tempo limite (15 s) é maior que o intervalo (5 s):** numa rede lenta que funciona (a resposta leva 6 s, por exemplo), o pedido não pode ser cancelado só porque chegou a hora do próximo; senão, nenhuma resposta chegaria nunca.

#### O segundo efeito: o relógio do "Desatualizado"

```js
// React Hook useEffect: executa quando chega outra linha da S01 e por isso liga o relógio que,
// a cada segundo, confere se o selo "Desatualizado" de alguma sala mudou. O "agora" só anda
// quando o selo muda: com o mesmo valor, o React não desenha a página inteira de novo à toa.
```

A cada 1 s (`INTERVALO_RELOGIO_MS`), ele compara os selos de antes com os de agora, e só muda o `agora` se algum selo mudou. Assim, com o painel parado, a página **não** é desenhada de novo a cada segundo, e o selo aparece na hora certa: 30 s depois do `updated_at`.

#### `atualizarAgora()`

Soma 1 no `pedidosManuais`, que está nas dependências do primeiro efeito. O efeito recomeça: cancela o pedido no caminho (sem mostrar erro), busca na hora e recomeça a contagem do intervalo.

#### Os itens, a cada desenho

```js
const salas = montarSalas(linha, origemDaS01)   // origemDaS01: 'mock' no mock, 'iot' no Supabase
const selos = marcarDesatualizadas(salas, agora)
const itens = salas.map((sala, indice) => ({
  sala,
  classificacao: classificarSala(sala),
  desatualizada: selos[indice],
}))
```

- As salas são **montadas a cada desenho**, e não guardadas: o "Desatualizado" acompanha o `agora` e nunca fica velho.
- A função interna `marcarDesatualizadas` usa o `leituraDesatualizada` (2.5) com o limite de 30 s. As salas demo nunca ficam desatualizadas (`origem: 'demo'`: dados fixos, sem hora).
- A S01 ainda sem leitura sai com `desatualizada: true` (o `leituraDesatualizada` diz "na dúvida, está velha"), mas a tela mostra antes o status de sem leitura.

**Exemplo, no modo mock:** a tela abre e, logo em seguida, a S01 mostra o passo 1 do roteiro (verde). Aos 5 s, o passo 2; aos 10 s, o passo 3 (amarelo, ruído 55); aos 20 s, o passo 5 (vermelho, ruído 70)... Aos 45 s, volta ao passo 1. No mock, a S01 nunca fica desatualizada, porque cada leitura chega com a hora de agora.

**Exemplo, no Supabase, com o Wokwi parado (o T-10):** a última linha continua na tela; 30 s depois do `updated_at` dela, a S01 ganha o selo "Desatualizado", e no ranking perde 15 pontos e mostra "Leitura desatualizada".

---

### 3.11 `web/src/hooks/useColecoes.js`

Os favoritos e as listas (o CRUD), guardados só neste navegador. As regras vêm do `domain/colecoes.js` (importado como `regras`); a leitura e a gravação, do `services/colecoesLocais.js`. Aqui só fica o estado.

- **Recebe:** nada.
- **Devolve:** `{ favoritos, listas, aviso, ehFavorita, alternarFavorito, criarLista, renomearLista, excluirLista, adicionarSala, removerSala }`. Os `favoritos` e as `listas` vêm das preferências; o `aviso` é o do `lerPreferencias`.

| Função | Recebe | Devolve |
|---|---|---|
| `ehFavorita(salaId)` | o id da sala | `true` ou `false` |
| `alternarFavorito(salaId)` | o id da sala | nada |
| `criarLista(nome)` | o nome | `{ ok, erro, id }` (o `id` da lista nova, ou `null` no erro) |
| `renomearLista(listaId, nome)` | o id e o nome novo | `{ ok, erro }` |
| `excluirLista(listaId)` | o id | nada |
| `adicionarSala(listaId, salaId)` e `removerSala(listaId, salaId)` | o id da lista e o da sala | nada |

#### Ler uma vez

```js
// React Hook useState: a função inicial roda só na primeira vez, e por isso o localStorage é
// lido uma vez só (como no useLocalStorage da aula). Guarda também o aviso da leitura.
const [leitura] = useState(() => lerPreferencias(pegarLocalStorage(), IDS_DAS_SALAS))
const [prefs, setPrefs] = useState(leitura.prefs)
```

A função interna `pegarLocalStorage()` existe porque, **só de pegar** o `window.localStorage`, o navegador pode lançar erro, quando bloqueia os dados do site. Aí ela devolve `null`, e o service já trata o `null` (lê o vazio com aviso; na gravação, devolve `false`). O hook só **entrega** o `localStorage` ao service; quem lê e grava é o service.

#### Gravar a cada mudança

```js
// React Hook useEffect: executa depois de cada mudança das preferências e por isso grava a
// versão nova no localStorage. Enquanto nada mudou, não grava: assim um texto salvo quebrado
// continua lá (dá para recuperar à mão) até a pessoa mexer nas listas.
```

O efeito compara `prefs === leitura.prefs`: enquanto é exatamente o que foi lido, não grava. Isso funciona também com o `StrictMode` rodando o efeito duas vezes.

#### A versão mais nova (o `useRef`)

As ações calculam a partir de `maisNova.current`, e não do `prefs`. **Por quê:** a tela pode fazer duas ações no mesmo clique. O "Criar e adicionar" chama `criarLista('Grupo')` e logo depois `adicionarSala(id, 'S07')`. O `prefs` do `useState` só muda no **próximo desenho**; partindo dele, a segunda ação não veria a lista que a primeira acabou de criar, e a lista sumiria. O `ref` muda **na hora**. Toda mudança passa pela função interna `aplicar(novas)`, que atualiza o `ref` e chama o `setPrefs`. O `ref` nunca é lido no desenho: `favoritos`, `listas` e `ehFavorita` vêm do `prefs`.

#### Duas abas abertas

```js
// React Hook useEffect: executa uma vez, quando a tela abre, e por isso passa a escutar o
// evento 'storage', que o navegador dispara nesta aba quando OUTRA aba grava no localStorage.
```

Sem isso, cada aba gravaria a sua versão por cima da outra, e a última a gravar apagaria o que a outra fez. Quando a outra aba grava, esta lê de novo e se atualiza. Se não der para ler o que a outra gravou (veio um aviso), esta aba fica como está, em vez de trocar tudo pelo vazio. O `return` para de escutar quando a tela sai.

#### O id da lista nova

`crypto.randomUUID()`, um id único como `'93c4c33c-ad69-4192-81f9-90f5ea0a49b1'`, como o CONTEXTO, §7.7, sugere. Ele só existe em página segura (`https` ou `localhost`); aberta pelo IP da rede (ex.: `http://192.168.0.10:5173`, para testar no celular), ele não existe. Aí o id sai da hora e de um sorteio: `` `lista-${Date.now()}-${Math.random().toString(36).slice(2)}` ``. O `domain/` ainda recusa um id repetido.

---

### 3.12 `web/src/hooks/useFiltros.js`

Os filtros e o atalho escolhidos, e as salas que sobram, já na ordem do ranking (CONTEXTO, §7.4 e §7.5).

- **Recebe:** os `itens` (do `useSalas`) e os `favoritos` (do `useColecoes`).
- **Devolve:** `{ filtros, alterarFiltro, limparFiltros, atividade, escolherAtividade, totalAtivos, resultado }`.

| Campo | O que é |
|---|---|
| `filtros` | os filtros de agora, no formato do `FILTROS_VAZIOS` |
| `alterarFiltro(campo, valor)` | muda um filtro, passando o valor do campo pelo `valorDoFiltro` (`''` vira `null`; `'20'` vira 20). Um campo que não existe lança erro no clique |
| `limparFiltros()` | volta ao `FILTROS_VAZIOS` (o T-13: as nove voltam) |
| `atividade` | o id do atalho, ou `null` ("Todas as salas") |
| `escolherAtividade(id)` | escolhe o atalho; `null` volta para "Todas as salas". Um id desconhecido lança erro no clique e não muda nada |
| `totalAtivos` | o `contarFiltrosAtivos(filtros)` |
| `resultado` | `ranquearItens(filtrarItens(itens, filtros, favoritos), atividade)` |

- **Primeiro filtra, depois ranqueia:** o ranking só ordena as salas que sobraram dos filtros.
- **Por que o `resultado` não fica num `useState`:** ele é **calculado a cada desenho**. Guardado, ficaria velho quando chegasse uma leitura nova da S01 ou mudasse um favorito. São nove salas: a conta é rápida.
- **Por que o atalho desconhecido lança erro no clique:** guardado no estado, ele faria o `ranquearItens` lançar erro no desenho e derrubaria a tela inteira.

**Exemplo** (conferido rodando as funções do `domain/`): `escolherAtividade('grupo')`, `alterarFiltro('exigirMesaLivre', true)` e `alterarFiltro('ruidoMax', '55')`, com a S01 sem leitura → o `resultado` começa com S07 (1º, 97), S02 (2º, 74) e S08 (3º, 60). A S05 saiu no filtro (ruído 57); a S01 também (sem leitura, não passa num filtro de valor). O `totalAtivos` é 2.

---

### 3.13 `web/src/hooks/useSessaoDemo.js`

A sessão do login fictício.

- **Recebe:** nada. **Devolve:** `{ logado, matricula, entrar, sair }`.
- **Ler uma vez:** `useState(() => lerSessao(pegarSessionStorage()))`. Quem recarrega a página continua dentro, até fechar a aba.
- **`entrar(matricula, senha)`:** chama o `conferirCredenciais`. Se não conferir, devolve o `{ ok: false, erro }` para a tela mostrar. Se conferir, guarda a matrícula do jeito que foi aceita (`' rm000000 '` vira `'RM000000'`), grava a sessão e muda o estado. Se o navegador recusar a gravação, a pessoa entra do mesmo jeito.
- **`sair()`:** apaga a sessão e volta para a tela de entrada. As listas e os favoritos ficam (são do navegador, não da sessão).
- **Por que a gravação é no clique, e não num `useEffect`:** são só duas ações (entrar e sair); gravar na própria ação é mais simples e não precisa de efeito.

---

### 3.14 Como os quatro hooks se juntam

```jsx
// App.jsx: só decide qual tela mostrar
const sessao = useSessaoDemo()
if (!sessao.logado) return <TelaLogin ... onEntrar={sessao.entrar} />
return <PaginaPainel matricula={sessao.matricula} onSair={sessao.sair} />

// pages/PaginaPainel.jsx
const salas = useSalas()
const colecoes = useColecoes()
const filtros = useFiltros(salas.itens, colecoes.favoritos)
```

O `useFiltros` recebe o que os outros dois devolvem: as salas (com a S01 sempre atualizada) e os favoritos (para o "somente favoritas"). Quando a pessoa clica em "Sair", a `PaginaPainel` some, e o `return` do efeito do `useSalas` para o polling. Como cada componente usa esses dados está na Parte 4.

---

### 3.15 O lint agora é o ESLint

Na W1, o lint era o oxlint (1.1). Agora é o **ESLint**: o `npm run lint` roda `eslint .`, com a configuração no `web/eslint.config.js`:

- **`js.configs.recommended`:** os erros comuns do JavaScript (uma variável que não existe, uma que não é usada...);
- **`reactHooks.configs.flat.recommended`** (o `eslint-plugin-react-hooks`, versão 7): as regras dos hooks de 3.9. Elas são estritas: um `set...` direto no corpo de um `useEffect` dá o erro "Calling setState synchronously within an effect", e ler um `ref` no desenho dá "Cannot access refs during render";
- **`reactRefresh.configs.vite`:** confere se os componentes continuam recarregando sozinhos no `npm run dev`.

É por causa dessas regras que, nos hooks, o estado só muda depois do `await` ou dentro dos timers, a hora entra pela função inicial do `useState` e o `ref` só é lido nas ações.

---

### 3.16 Como os testes desta parte foram feitos

Do mesmo jeito da Parte 2 (2.8): TDD, primeiro o teste, vendo falhar, e depois o código. Duas coisas novas:

- **Os falsos.** Os `services/` falam com o navegador (o `fetch`, o `localStorage`), que não existe no Node. Por isso os testes passam objetos **falsos** com as mesmas funções: um armazenamento com `getItem` e `setItem` sobre um `Map`, e um `fetch` trocado com o `vi.stubGlobal`. É por isso que os services recebem o armazenamento como parâmetro.
- **As notas do ranking foram calculadas à mão**, num comentário ao lado de cada caso, para o teste não repetir a conta do código (se repetisse, um erro na conta passaria nos dois).

**Os números de hoje:** 15 arquivos de teste e **649 testes**, todos passando:

| Arquivo | Testes | Explicado em |
|---|---:|---|
| `data/salas.test.js` | 10 | 2.1 |
| `domain/ocupacao.test.js` | 39 | 2.2 |
| `domain/limiares.test.js` | 20 | 2.3 |
| `domain/classificacao.test.js` | 106 | 2.4 |
| `domain/atualizacao.test.js` | 32 | 2.5 |
| `domain/normalizar.test.js` | 103 | 2.6 |
| `domain/filtros.test.js` | 62 | 3.1 |
| `domain/ranking.test.js` | 79 | 3.2 |
| `domain/colecoes.test.js` | 90 | 3.3 |
| `domain/sessao.test.js` | 18 | 3.4 |
| `domain/formatar.test.js` | 6 | 3.5 |
| `services/configuracao.test.js` | 8 | 1.8 |
| `services/telemetria.test.js` | 42 | 3.6 |
| `services/colecoesLocais.test.js` | 24 | 3.7 |
| `services/sessaoDemo.test.js` | 10 | 3.8 |

**Os hooks** não têm teste no projeto (3.9). Eles foram conferidos **fora do projeto**, com um React de mentira (um `useState`, um `useEffect` e um `useRef` mínimos), o relógio falso do Vitest e os hooks de verdade. O `useSalas` e o `useColecoes`: 14 verificações, todas passando (a primeira leitura com o `StrictMode`, a API lenta, o tempo limite, a lista vazia, o relógio do selo, o "atualizar agora", sair no meio de um pedido, as duas abas e o "Criar e adicionar"). O `useSessaoDemo` (entrar, recarregar, sair, armazenamento bloqueado) e o `useFiltros` (o texto vira número, o ranking, o atalho e o filtro desconhecidos, o limpar): 3 casos de uma conferência anterior, passando. Essas conferências não entram no `npm test`.

---

### Perguntas que o professor pode fazer (Parte 3)

**O que é um custom hook e por que vocês fizeram 4?**
É uma função nossa que começa com `use`, usa o `useState` e o `useEffect` e devolve os dados e as funções que a tela precisa. Ela tira o estado e os efeitos do componente, que fica só com o desenho (p. 42). O edital pede no mínimo 2; fizemos 4 porque cada um tem um assunto só: `useSalas` (a API e o polling), `useColecoes` (o CRUD local), `useFiltros` (os filtros e o ranking) e `useSessaoDemo` (o login fictício). O `App` só precisa do login, então usa só o `useSessaoDemo`.

**Onde está o CRUD?**
Nas listas e nos favoritos, em três camadas: as regras no `domain/colecoes.js` (criar, consultar, renomear, excluir, adicionar e remover sala, favoritar), a gravação no `services/colecoesLocais.js` (`localStorage`, com `JSON.stringify` e `JSON.parse` em `try/catch`) e o estado no `hooks/useColecoes.js`. Tudo só no navegador (RN-12; CONTEXTO, §3.3 e §7.7, pela orientação docente relatada). As telas que usam estão na Parte 4.

**Onde vocês consomem a API externa?**
No `services/telemetria.js`, na `buscarLeituraSupabase`: um `fetch` com `GET` na API REST do Supabase (`/rest/v1/room_telemetry?room_id=eq.S01`), com `async/await`. O `useSalas` chama isso a cada 5 s. A web só lê; quem escreve é o ESP32 do Wokwi. Sem o Supabase configurado, entra o modo de demonstração, sem rede.

**Por que o polling usa `setInterval` e como ele para?**
A API REST não avisa quando a linha muda: a web tem de perguntar, e o `setInterval` pergunta a cada 5 s. Ele para no `return` do `useEffect`, que roda quando a tela sai (ex.: "Sair") ou antes de o efeito rodar de novo: `clearInterval`, `clearTimeout` e `abort()` do pedido que estava no caminho.

**O que acontece se a API cair?**
A tela não quebra e não inventa nada (RN-11): a S01 continua com a última leitura que chegou, e aparece a mensagem do erro ("Não foi possível falar com a API...", "A API respondeu com erro (HTTP 500).", "A API demorou mais de 15 segundos para responder."). Trinta segundos depois da hora da última leitura, ela ganha o selo "Desatualizado" e perde 15 pontos no ranking. Se nunca chegou leitura nenhuma, a S01 fica sem leitura (falha) e sai do ranking. O polling continua tentando, e a primeira resposta boa tira o erro.

**Como o ranking decide a ordem?**
Em três passos. Elimina quem não serve: sem leitura confiável; lotada, no sozinho e no vídeo; sem mesa totalmente livre, no grupo; ruído crítico, no vídeo. Dá uma nota de 0 a 100 pelos pesos de cada atalho (o peso inteiro, a metade ou nada, pela severidade; a ocupação pelas vagas). E ordena da maior nota para a menor. No empate: menor taxa de ocupação, depois mais mesas vazias, depois o menor id. É só conta: a mesma entrada dá sempre a mesma ordem (RN-15).

**Por que o login não é seguro e tudo bem?**
A matrícula e a senha estão escritas no código que vai para o navegador: qualquer um vê pelo F12, e a sessão pode ser escrita à mão no `sessionStorage`. Tudo bem porque não há nada a proteger: o CONTEXTO (§6.4 e RN-13) pede um login **demonstrativo**, igual para todos, sem cadastro e sem ligação com a FIAP; os dados das salas são fictícios ou simulados; e as listas ficam no navegador de cada um. O que protege a tabela do Supabase é a chave publicável com a RLS, não o login.

**Os pesos do ranking são oficiais?**
Não. São uma proposta da parte web, marcada como **PROVISÓRIA** no código: o CONTEXTO, §7.5, deixa os pesos "a definir" pelo grupo. Cada atalho pesa mais o que o §7.5 diz que ele prefere (sozinho: silêncio; grupo: mesa livre e sala vazia; vídeo: ruído e luz).

**Por que a S01 desatualizada não sai do ranking?**
A RN-11 manda manter a última leitura, com o aviso. Ela continua, mas com "Leitura desatualizada" na primeira frase e 15 pontos a menos (PROVISÓRIO), porque não é a medição de agora.

**Para que serve o `return` dentro do `useEffect`?**
É a "faxina": desfaz o que o efeito ligou (os timers, o pedido, o ouvinte do evento `storage`). O React chama quando a tela sai ou antes de rodar o efeito de novo.

**O que é o `AbortController`?**
Um "botão de cancelar" um `fetch`. O `signal` vai junto no pedido; o `abort()` cancela. Ele serve para não deixar um pedido pendurado quando a tela sai e para desistir de um pedido que passou de 15 s.

**Por que a primeira busca vai num `setTimeout` de 0?**
Por causa do `StrictMode`, que em desenvolvimento roda o efeito, desfaz e roda de novo. Com o timer, a busca do efeito desfeito é limpa antes de rodar: o roteiro da demonstração começa no passo 1, e o Supabase não recebe dois GET.

**O modo mock finge ser o Wokwi?**
Não. É um roteiro de 9 leituras inventadas, para a S01 mudar quando não há Supabase. A sala sai com `origem: 'mock'`, e a tela diz que é demonstração (RN-10).

**Por que o `localStorage` para as listas e o `sessionStorage` para o login?**
O `localStorage` fica guardado mesmo fechando o navegador: as listas têm de durar (CONTEXTO, §7.2, item 8). O `sessionStorage` some ao fechar a aba: o login de demonstração não precisa durar.

**E se o JSON salvo estiver quebrado?**
O `lerPreferencias` não quebra a tela: devolve as listas vazias e o aviso "Não foi possível ler suas listas salvas; começamos do zero.". E o hook não grava nada por cima até a pessoa mexer, para o texto quebrado ainda poder ser recuperado.

**Por que o `useColecoes` usa um `useRef`?**
Porque a tela pode fazer duas ações no mesmo clique (criar a lista e já adicionar a sala). O estado do `useState` só muda no próximo desenho; o `ref` muda na hora, e a segunda ação vê a primeira.

**Por que o resultado dos filtros não fica num `useState`?**
Porque ele depende de coisas que mudam sozinhas (a leitura da S01, os favoritos). Calculado a cada desenho, nunca fica velho.

**Por que `fetch`, e não uma biblioteca do Supabase ou o `axios`?**
É uma chamada só, de leitura. O `fetch` com `async/await` é o que a turma viu (aula 14) e mostra o consumo da API às claras, sem esconder nada numa biblioteca.

**Por que `cache: 'no-store'`?**
Para o navegador nunca devolver uma cópia guardada de uma resposta antiga: cada pergunta do polling quer a leitura de agora.

**No filtro de luz, `'1.000'` vira 1 ou 1000?**
1000. No Brasil, o ponto seguido de três dígitos separa os milhares, e o `valorDoFiltro` trata isso. Ele também trata o `''` (o campo apagado), que viraria 0 com o `Number('')` e ligaria um filtro sem a pessoa pedir.

---

## Parte 4 — As telas (W3, e as telas da W4 a W6)

As telas são a camada de **apresentação**. A regra de ouro desta parte: **nenhum componente fala com a API nem com o `localStorage`**. Quem busca e guarda dados são os hooks (Parte 3); os componentes só recebem o que vão mostrar (as *props*) e avisam quando o usuário faz algo (as funções `on...`). É isso que o edital chama de "separar a lógica de negócio e o acesso aos dados da camada visual" (p. 42).

### O visual: um painel de embarque

A ideia do visual é o **painel de embarque** de aeroporto ou rodoviária: cada sala é uma linha que se lê de relance, como um voo. Por isso:

- o fundo é azul-noite, e as salas ficam em "placas" foscas;
- o código da sala (S01), a posição no ranking (1º) e o relógio aparecem em **palhetas**: cada caractere numa plaquinha com uma junta no meio, como as letras que viram nos painéis antigos;
- quando um valor muda (a S01 recebe leitura nova, a posição no ranking muda), ele **vira a palheta** (uma animação curta);
- a cor só aparece onde carrega um significado: **amarelo só na melhor sala**; verde, laranja e vermelho só na situação (adequado, atenção, crítico), e sempre junto de uma palavra e de um ícone, para quem não enxerga bem as cores.

Os nomes das cores ficam no `src/index.css`, num bloco `@theme` do Tailwind:

```css
@theme {
  --color-noite: oklch(0.165 0.026 258);   /* o fundo */
  --color-placa: oklch(0.235 0.024 258);   /* a placa de cada sala */
  --color-tinta: oklch(0.955 0.012 85);    /* o texto principal */
  --color-melhor: oklch(0.88 0.165 95);    /* o amarelo da melhor sala */
  --color-ok: oklch(0.8 0.15 152);         /* verde: adequado */
  /* ... */
}
```

Com isso, o Tailwind cria classes com esses nomes: `bg-noite`, `text-tinta`, `bg-melhor`, `text-ok`. O formato `oklch(claridade croma matiz)` deixa o contraste previsível: duas cores com a mesma claridade têm o mesmo "peso" na tela.

As fontes são a **Barlow Condensed** (a letra do painel) e a **Barlow Semi Condensed** (o texto), instaladas pelo `@fontsource` e importadas no `main.jsx`. Ficam dentro do projeto: o site não depende de nenhum servidor de fontes.

### O caminho das telas

```text
main.jsx → App.jsx ─┬─ (sem login) → TelaLogin
                    └─ (com login) → pages/PaginaPainel ─┬─ CabecalhoPainel (Relogio)
                                                        ├─ SeletorAtividade
                                                        ├─ BarraFiltros + PainelFiltros
                                                        ├─ QuadroSalas ─ LinhaSala (×9)
                                                        │      ├─ SeloOrigem, SeloSituacao, MapaMesas
                                                        │      ├─ Leitura (×3), BotaoFavorito
                                                        │      └─ SeletorListas (quando aberto)
                                                        ├─ EstadoVazio (quando nada passa nos filtros)
                                                        ├─ PainelListas
                                                        └─ Rodape
Todos usam o Icone e o TextoPalheta.
```

São **18 arquivos de componente, com 22 componentes** ao todo, contando os pequenos de dentro dos arquivos, como o `CampoNumero`, o `CartaoLista` e o `BotaoAcao` (o edital pede 8).

### `App.jsx`

Só decide qual tela mostrar. Usa o hook `useSessaoDemo`: sem login, mostra a `TelaLogin`; com login, a `PaginaPainel`.

```jsx
const App = () => {
  const sessao = useSessaoDemo()
  if (!sessao.logado) {
    return <TelaLogin credenciaisDemo={CREDENCIAIS_DEMO} onEntrar={sessao.entrar} />
  }
  return <PaginaPainel matricula={sessao.matricula} onSair={sessao.sair} />
}
```

### `pages/PaginaPainel.jsx`

É a única tela que junta os hooks: `useSalas` (as nove salas e a S01 atualizando), `useColecoes` (favoritos e listas) e `useFiltros` (filtros, atividade e ranking). Depois, passa para cada componente só a parte que ele precisa.

Dois estados próprios:

- `filtrosAbertos` (um `useState` de verdadeiro ou falso): abre e fecha os campos dos filtros;
- `versaoOrdem`: conta quantas vezes a atividade mudou. A partir da primeira troca, as linhas do painel entram animadas, uma a uma. No carregamento, nada se mexe, porque animação na abertura só atrasa quem tem pressa.

Ela também mostra o "carregando" (quatro placas pulsando) enquanto a primeira leitura não chega, o `EstadoVazio` quando os filtros não deixam nenhuma sala, e o aviso de erro da API, que diz que a S01 continua com a última leitura recebida (RN-11).

### `TelaLogin.jsx`

O formulário de entrada **de demonstração**. Guarda o que o usuário digita com `useState` (`matricula`, `senha`, `erro`). Ao enviar, chama `onEntrar(matricula, senha)`, que vem do hook; se a resposta for `{ ok: false, erro }`, mostra o erro com `role="alert"` (o leitor de tela anuncia na hora).

A matrícula e a senha fictícias aparecem na própria tela, com o botão **"Preencher para mim"**, porque o login só existe para a demonstração. O texto diz isso com todas as letras: "Não há cadastro nem segurança real" (RN-13).

O título "PAINEL DE SALAS" é feito de palhetas: cada letra num `<span className="palheta">`. Para o leitor de tela não soletrar letra por letra, as palhetas têm `aria-hidden` e o `<h1>` tem `aria-label="Painel de Salas"`.

### `CabecalhoPainel.jsx` e `Relogio.jsx`

O cabeçalho mostra o nome, o relógio, a matrícula de demonstração, o atalho "Minhas listas" (um link `#minhas-listas` que desce até a seção) e o "Sair".

O `Relogio` tem o seu próprio `useEffect`:

```jsx
useEffect(() => {
  const timer = setInterval(() => setAgora(Date.now()), 1000)
  return () => clearInterval(timer)
}, [])
```

O `[]` no fim faz o efeito rodar uma vez só, quando o relógio aparece. O `return` desliga o timer quando o relógio sai da tela; sem ele, um timer ficaria rodando à toa. O relógio existe para o estudante comparar a hora agora com a hora da última leitura da S01.

### `SeletorAtividade.jsx`

Os quatro botões: "Todas as salas", "Estudar sozinho", "Trabalho em grupo" e "Gravar vídeo". Recebe a lista de atividades (do `domain/ranking.js`), a escolhida e a função `onEscolher`. O botão escolhido tem `aria-pressed="true"`, que conta ao leitor de tela qual está ligado. Embaixo, uma frase diz a regra da atividade; no grupo: "Mesa com alguém sentado não conta, mesmo com cadeira vaga" (RN-06).

### `PainelFiltros.jsx` (com a `BarraFiltros`)

São dois componentes no mesmo arquivo:

- `BarraFiltros`: o botão "Filtros" (com o número de filtros ligados), o "N de 9 salas" e o "Limpar filtros". Fica na mesma linha dos botões de atividade;
- `PainelFiltros`: os campos. São quatro intervalos (pessoas, temperatura, luz e ruído), cada um com "de" e "até", e duas caixas de marcar ("Pelo menos 1 mesa totalmente livre" e "Só as favoritas").

Cada campo chama `onAlterar(campo, valor)` a cada tecla. Quem transforma o texto em número (ou em "sem limite", quando fica vazio) é o hook `useFiltros`, não a tela. Os limites são **inclusivos**: "de 3 até 6" aceita 3 e 6 (RN-14). Cada grupo de campos é um `<fieldset>` com `<legend>`, que é o jeito certo de agrupar campos para o leitor de tela.

### `QuadroSalas.jsx` e `gradePainel.js`

O quadro desenha o cabeçalho das colunas e a lista das salas. Com uma atividade escolhida, separa **as que servem** (em ordem de ranking, num `<ol>`, lista numerada) **das que não servem**, que ficam embaixo com o título "Não servem para trabalho em grupo · 4 salas". Assim nenhuma sala some sem explicação.

O `gradePainel.js` guarda as colunas do painel largo, a partir de 1280 px. Há duas grades: com a coluna da posição (quando há ranking) e sem ela. O cabeçalho e as linhas usam a mesma grade, então nunca desalinham. As classes ficam escritas por inteiro porque o Tailwind só gera as classes que encontra escritas no código.

### `LinhaSala.jsx`, a peça principal

Uma sala inteira, sem precisar clicar (RF-02 a RF-06): o código em palhetas, o nome, o porte, a origem do dado, as mesas, os lugares vagos, as três leituras, a situação e os botões.

- **No celular** ela é um cartão empilhado. Ela usa uma grade de 3 colunas: a posição, a sala e a situação em cima; depois as mesas, com os botões ao lado; depois as três leituras lado a lado.
- **A partir de 1280 px** ela é uma faixa só do painel. As três leituras viram colunas com o truque `xl:contents` (o `display: contents` faz a caixa de fora "sumir" e os filhos virarem colunas da grade de fora). As colunas são separadas por réguas de 1 pixel, como num painel de verdade.

Ela também mostra:

- a **marca de favorita**: uma palheta com estrela ao lado do código, além do botão marcado;
- o **porquê do ranking**: "Melhor agora", os motivos (por exemplo "2 mesas totalmente livres" ou "Silenciosa (39 dB simulados)") e a pontuação; ou "Não serve: Nenhuma mesa totalmente livre";
- o `SeletorListas`, quando o botão de lista é apertado. Ele abre dentro da própria linha, sem janela por cima.

O único estado próprio é `mostrarListas` (abre e fecha o seletor de listas).

### `MapaMesas.jsx`

O mapa das mesas, inspirado no mapa de assentos do cinema. Cada mesa é um bloco com 3 quadradinhos: cheio é lugar ocupado, vazado é lugar vago. A mesa **totalmente livre** ganha a borda verde e a palavra "livre": é a única que serve para trabalho em grupo. Para o leitor de tela, a lista tem um `aria-label` com tudo por extenso: "3 mesas, 2 pessoas sentadas, 1 mesa totalmente livre. Mesa 1: 1 de 3; ...".

### `Leitura.jsx`

Uma leitura do ambiente, usada 3 vezes por sala: temperatura, luz e ruído. Mostra o valor (com vírgula: `formatarNumero` do `domain/formatar.js`), a unidade ("°C", "lux est.", "dB sim."), a **severidade** (adequado, atenção, crítico) com ícone e cor, e a **faixa** (baixo, médio, alto). Faixa e severidade são separadas de propósito (CONTEXTO §5.2): uma sala a 18 °C fica na faixa "baixo" e na severidade "atenção", porque baixo não quer dizer bom. No ruído aparece também o índice de 0 a 100.

### `SeloSituacao.jsx` e `SeloOrigem.jsx`

- `SeloSituacao`: a situação geral (Adequada, Atenção, Crítica, Sem leitura), pela mesma regra dos LEDs do circuito (RN-08), numa palheta com cor, ícone e palavra.
- `SeloOrigem`: de onde vem o dado e se ele está fresco. A S01 mostra "IoT simulado" (ou "Simulação local", enquanto o Wokwi não está ligado) e "Atualizado às 14:32:05". Ela troca para "Desatualizado · última leitura às ..." quando a leitura fica velha, e mostra "Dispositivo offline" ou "Aguardando a primeira leitura" quando não há leitura boa. As outras salas mostram "Dados demonstrativos". É o RF-06: ninguém confunde dado fictício com medição.

### `TextoPalheta.jsx`

O texto que "vira a palheta" quando muda. O truque está em comparar o texto novo com o anterior **durante o render**, guardando o anterior num `useState`:

```jsx
const [anterior, setAnterior] = useState(texto)
const [viradas, setViradas] = useState(0)
if (texto !== anterior) {
  setAnterior(texto)
  setViradas(viradas + 1)
}
return <span key={viradas} className={viradas > 0 ? 'virando' : ''}>{texto}</span>
```

É o jeito que a documentação do React recomenda para "ajustar um estado quando uma prop muda", sem `useEffect`. A `key` nova faz o React desenhar o `<span>` de novo, e o CSS (`.virando`, no `index.css`) roda a animação outra vez. No primeiro desenho, `viradas` é 0 e não há animação.

### `BotaoFavorito.jsx`, `SeletorListas.jsx` e `PainelListas.jsx`, as telas do CRUD

- `BotaoFavorito`: a estrela. Usa `aria-pressed` para dizer se está marcada, e o rótulo muda: "Favoritar Sala de Estudo 07" ou "Tirar Sala de Estudo 07 dos favoritos".
- `SeletorListas`: dentro da linha da sala. Uma caixa de marcar por lista (marcar põe a sala na lista, desmarcar tira) e um campo para **criar uma lista nova já com a sala dentro**.
- `PainelListas`: a seção "Minhas listas", com as favoritas, o campo "Nova lista" e as listas. Cada lista pode ser **renomeada** (o nome vira um campo, com "Salvar" e "Cancelar") e **excluída**. A exclusão pede confirmação ali mesmo ("Excluir a lista 'X'? As salas não somem do painel."), sem janela por cima. Dá também para tirar uma sala da lista.

Juntas, elas fazem o **CRUD completo** no `localStorage`: criar, ver, renomear e excluir listas, e pôr e tirar salas. As mensagens de erro ("Já existe uma lista com esse nome.") vêm do `domain/colecoes.js` e aparecem com `role="alert"`.

### `EstadoVazio.jsx`, `Rodape.jsx` e `Icone.jsx`

- `EstadoVazio`: quando os filtros não deixam nenhuma sala, ensina o próximo passo e oferece o "Limpar filtros" (RF-14).
- `Rodape`: diz, sem letra miúda escondida, o que é simulado (a S01, os dB, a luz estimada) e o que é fictício (S02 a S09).
- `Icone`: todos os ícones, desenhados à mão em SVG, com o mesmo traço. Recebe `nome`, `tamanho`, `preenchido` e `rotulo`. Sem `rotulo`, o ícone é decoração e fica escondido do leitor de tela (`aria-hidden`); com `rotulo`, ele vira uma imagem com nome.

### A acessibilidade, em resumo

- O estado nunca é só cor: sempre há palavra e ícone (RNF-02).
- Todo campo tem `<label>`, e os erros usam `role="alert"`.
- O foco do teclado aparece sempre, com uma borda clara (`:focus-visible` no `index.css`).
- Os botões que ligam e desligam usam `aria-pressed`, e os que abrem algo usam `aria-expanded`.
- As animações desligam sozinhas para quem pediu menos movimento no sistema (`prefers-reduced-motion`).
- O layout funciona de 360 px, no celular, até telas largas (RNF-01).

### Perguntas que o professor pode fazer (Parte 4)

**Quantos componentes vocês têm, e onde estão?** 22 componentes em 18 arquivos de `src/components/`, mais a página `src/pages/PaginaPainel.jsx`. O edital pede no mínimo 8.

**Onde vocês usam `useState` e `useEffect`?** O `useState` está em vários componentes (`TelaLogin`, `LinhaSala`, `PainelListas`, `PainelFiltros`...) e nos hooks. O `useEffect` está no `Relogio` (o `setInterval` com a limpeza no `return`) e nos hooks `useSalas` (a busca da S01 de tempos em tempos) e `useColecoes` (salvar no `localStorage` a cada mudança).

**Por que os componentes não chamam a API direto?** Para separar as camadas (edital, p. 42). O componente só desenha. Se a API mudar, só o `services/` e o hook mudam, e a tela fica igual.

**O que é uma "prop"?** É o que o componente pai passa para o filho, como os parâmetros de uma função. Exemplo: `<Leitura unidade="°C" indicador={temperatura} />`.

**Por que a tela muda sozinha quando a S01 recebe leitura nova?** O `useSalas` guarda a leitura num `useState`. Quando o estado muda, o React desenha de novo os componentes que dependem dele. Ninguém precisa recarregar a página (RNF-07).

**Como funciona o responsivo?** Com as classes do Tailwind com prefixo: `sm:` a partir de 640 px e `xl:` a partir de 1280 px. Sem prefixo, a classe vale para o celular. A mesma `LinhaSala` vira cartão no celular e faixa de painel no computador.

**O que acontece se eu escolher "Trabalho em grupo"?** O `SeletorAtividade` chama `onEscolher('grupo')`. O `useFiltros` refaz o ranking (o `ranquearItens` do domínio), o `QuadroSalas` separa as que servem das que não servem, e as linhas entram animadas.

**Por que o painel é escuro?** Porque o visual é o de um painel de embarque, que é escuro. E o contraste foi calculado: o texto principal sobre o fundo dá 16,9 para 1, e a combinação mais fraca da tela (o texto terciário sobre a placa mais clara) dá 5,16 para 1. A regra de acessibilidade (WCAG) pede pelo menos 4,5 para 1.

## Como rodar e testar

Todos os comandos rodam dentro da pasta `web/`:

```bash
cd web
npm install        # só na primeira vez: baixa as bibliotecas
npm run dev        # abre a aplicação (o Vite mostra o endereço)
npm test           # roda os 649 testes uma vez
npm run test:watch # roda os testes a cada arquivo salvo
npm run lint       # o ESLint: erros comuns e as regras dos hooks
npm run build      # gera a versão final em dist/
npm run preview    # abre a versão do dist/
```

**O que você deve ver** (resultado de 08/11/2026, às 03:16):

```text
npm test      → Test Files  15 passed (15)
                Tests  649 passed (649)
npm run lint  → > eslint .   (nenhum aviso, saída 0)
npm run build → ✓ 62 modules transformed ... ✓ built
```

Sem o `.env.local`, o `npm run dev` abre no **modo de demonstração**: a S01 segue o roteiro de 3.6, sem internet.

**Para conferir uma função na mão**, sem abrir a tela, dá para rodar o Node direto na pasta `web/`:

```bash
node --input-type=module -e "
import { resumoOcupacao } from './src/domain/ocupacao.js'
console.log(resumoOcupacao([1, 1, 1]))"
```

Sai um objeto com `total: 3`, `capacidade: 9`, `vagas: 6`, `mesasVazias: 0` e `taxa: 33.333333333333336` (o Node mostra um campo por linha).

O ranking do "Trabalho em grupo", com as salas demo e a S01 sem leitura:

```bash
node --input-type=module -e "
import { montarSalas } from './src/domain/normalizar.js'
import { classificarSala } from './src/domain/classificacao.js'
import { ranquearItens } from './src/domain/ranking.js'
const itens = montarSalas(null).map((sala) => ({ sala, classificacao: classificarSala(sala), desatualizada: false }))
console.log(ranquearItens(itens, 'grupo').map((i) => i.sala.id + ' ' + (i.avaliacao.pontuacao ?? i.avaliacao.eliminadaPor)))"
```

Sai `'S07 97'`, `'S02 74'`, `'S08 60'`, `'S05 56'`, `'S01 Sem leitura confiável'` e as quatro sem mesa livre (`'S03 Nenhuma mesa totalmente livre'`, S04, S06 e S09).

**O que ainda não existe ou não foi conferido** (para não dizer que existe): o modo `supabase` contra um projeto de verdade (ele só foi testado com um `fetch` falso; o projeto, a tabela e a RLS no Supabase ainda não foram feitos), a prova com o Wokwi (T-09 e T-10) e o deploy. Os componentes de tela existem e entram na Parte 4.
