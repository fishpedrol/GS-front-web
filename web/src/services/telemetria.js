// A leitura da sala S01: no Supabase (a linha que o ESP32 do Wokwi atualiza) ou no modo de
// DEMONSTRAÇÃO (o simulador abaixo, sem rede). Só busca a linha crua, no formato da tabela
// room_telemetry (CONTEXTO, §6.3); quem confere e arruma os valores é o domain/normalizar.js.
// A web só LÊ: nunca escreve no Supabase (quem escreve é o ESP32).

import { ehChaveSecreta } from './configuracao.js'

/** De quanto em quanto tempo a web pede a leitura da S01, em milissegundos. */
export const INTERVALO_ATUALIZACAO_MS = 5000 // PROVISÓRIO: depende do intervalo de envio do ESP32 (ainda não definido pelo Edge)

/** Depois de quantos segundos sem leitura nova a S01 mostra "Desatualizado" (o STALE_AFTER_SECONDS do CONTEXTO, §6.5). */
export const LIMITE_DESATUALIZADO_SEGUNDOS = 30 // PROVISÓRIO: tem de ser maior que o intervalo de envio do ESP32, ainda não definido

/**
 * Quanto tempo o hook espera a resposta de um pedido antes de desistir, em milissegundos.
 * É maior que o INTERVALO_ATUALIZACAO_MS de propósito: numa rede lenta que funciona (ex.: a
 * resposta leva 6 s), o pedido não pode ser cancelado só porque chegou a hora do próximo.
 */
export const TEMPO_LIMITE_PEDIDO_MS = 15000 // PROVISÓRIO: três intervalos de hoje; sem medida da rede da FIAP nem do celular na apresentação

// Mensagens de erro em português, para a tela poder mostrar como vierem.
const ERRO_FORMATO = 'A API respondeu num formato inesperado.'
const ERRO_CONEXAO = 'Não foi possível falar com a API. Confira a internet e a URL do Supabase.'
const ERRO_CHAVE_SECRETA = 'A chave do Supabase é SECRETA e não pode ficar no navegador. Use a chave publicável.'

// A URL do projeto, sem nada no fim: tira as barras do fim e o "/rest/v1" que a página da API do
// Supabase mostra junto ("https://x.supabase.co/rest/v1/" vira "https://x.supabase.co").
// Sem isso, o pedido iria para ".../rest/v1/rest/v1/..." e voltaria um 404 que não explica nada.
function urlDoProjeto(supabaseUrl) {
  return supabaseUrl.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '').replace(/\/+$/, '')
}

// O cancelamento pelo signal (o hook cancela quando a tela sai ou quando chega a hora do
// próximo pedido) não é erro de verdade: o AbortError passa como veio, para o hook reconhecer.
function foiCancelado(erro) {
  return Boolean(erro) && erro.name === 'AbortError'
}

/**
 * Busca a linha da S01 na API REST do Supabase, com um GET (CONTEXTO, §6.3; TECHNICAL_ARCHITECTURE, §5).
 * @param {{ supabaseUrl: string, supabaseChave: string, signal?: AbortSignal }} opcoes a URL do projeto
 *   (com ou sem o "/rest/v1" do fim), a chave PUBLICÁVEL (nunca a secreta) e, se quiser, o signal
 *   de um AbortController para cancelar
 * @returns {Promise<object|null>} a linha da S01 (o objeto, não a lista), ou null se a tabela não tiver a S01
 * @throws {Error} se a chave for SECRETA (aí nem pede), se a API responder com erro HTTP, num formato que
 *   não é lista, ou se não der para conectar (o cancelamento pelo signal sai como o AbortError do próprio fetch)
 */
export async function buscarLeituraSupabase({ supabaseUrl, supabaseChave, signal }) {
  // Segunda proteção (a primeira é o lerConfiguracao): a chave secreta dá acesso de administrador
  // e nunca pode sair do navegador num cabeçalho, nem num config montado à mão (CONTEXTO, §6.4).
  if (ehChaveSecreta(supabaseChave)) {
    throw new Error(ERRO_CHAVE_SECRETA)
  }
  const url = `${urlDoProjeto(supabaseUrl)}/rest/v1/room_telemetry?room_id=eq.S01&select=*`

  let resposta
  try {
    resposta = await fetch(url, {
      method: 'GET',
      // O Supabase pede a chave nos dois cabeçalhos. É a chave publicável: pode ir para o navegador.
      headers: { apikey: supabaseChave, Authorization: `Bearer ${supabaseChave}` },
      // A cada pedido queremos a leitura mais nova, nunca uma cópia guardada pelo navegador.
      cache: 'no-store',
      signal,
    })
  } catch (erro) {
    if (foiCancelado(erro)) throw erro
    // O fetch só falha assim sem rede, com a URL errada ou bloqueada. A mensagem é para a tela;
    // o erro original fica no "cause", para quem for investigar no console.
    throw new Error(ERRO_CONEXAO, { cause: erro })
  }

  if (!resposta.ok) {
    throw new Error(`A API respondeu com erro (HTTP ${resposta.status}).`)
  }

  let dados
  try {
    dados = await resposta.json()
  } catch (erro) {
    if (foiCancelado(erro)) throw erro
    throw new Error(ERRO_FORMATO, { cause: erro }) // o corpo não era JSON (ex.: uma página de erro em HTML)
  }

  // O filtro room_id=eq.S01 faz a API devolver uma LISTA com 0 ou 1 linha.
  if (!Array.isArray(dados)) {
    throw new Error(ERRO_FORMATO)
  }
  return dados.length > 0 ? dados[0] : null
}

// O ROTEIRO DA DEMONSTRAÇÃO. Estas leituras são INVENTADAS: não vêm do Wokwi nem de sensor
// nenhum. Servem para mostrar a S01 mudando quando não há Supabase (modo 'mock').
// Cada passo muda UM valor do passo anterior, e o último passo também está a uma mudança só do
// primeiro: a tela nunca dá um salto. São 9 passos (e não 8) porque, para os quatro indicadores
// mudarem e o ruído passar por atenção e por crítico, 8 passos não bastam sem repetir um passo.
// Os estados saem do limiares.js (PROVISÓRIO): se um limiar mudar, o telemetria.test.js avisa
// se o roteiro deixou de passar pelos três estados.
const ROTEIRO_DEMO = [
  // 1. Sala calma, uma pessoa na mesa 1. Tudo adequado (verde).
  { mesas: [1, 0, 0], temperaturaC: 22.5, luz: 450, ruidoDb: 38 },
  // 2. Uma pessoa senta na mesa 2. Continua verde.
  { mesas: [1, 1, 0], temperaturaC: 22.5, luz: 450, ruidoDb: 38 },
  // 3. Começa uma conversa: o ruído sobe para 55 dB, atenção (amarelo).
  { mesas: [1, 1, 0], temperaturaC: 22.5, luz: 450, ruidoDb: 55 },
  // 4. A sala esquenta um pouco: 23,5 °C, ainda adequada (continua amarelo pelo ruído).
  { mesas: [1, 1, 0], temperaturaC: 23.5, luz: 450, ruidoDb: 55 },
  // 5. A conversa fica alta: 70 dB, ruído crítico (vermelho).
  { mesas: [1, 1, 0], temperaturaC: 23.5, luz: 450, ruidoDb: 70 },
  // 6. Pedem silêncio: o ruído volta a 38 dB. Tudo adequado (verde).
  { mesas: [1, 1, 0], temperaturaC: 23.5, luz: 450, ruidoDb: 38 },
  // 7. Fim de tarde: a luz cai para 250 lux, atenção (amarelo).
  { mesas: [1, 1, 0], temperaturaC: 23.5, luz: 250, ruidoDb: 38 },
  // 8. A pessoa da mesa 2 vai embora (continua amarelo pela luz).
  { mesas: [1, 0, 0], temperaturaC: 23.5, luz: 250, ruidoDb: 38 },
  // 9. Acendem a luz: 450 lux. Tudo adequado (verde).
  { mesas: [1, 0, 0], temperaturaC: 23.5, luz: 450, ruidoDb: 38 },
  // Depois do 9, volta ao 1: a temperatura volta a 22,5 °C.
]

/**
 * Cria o simulador do modo de DEMONSTRAÇÃO da S01 (sem rede; NÃO é o Wokwi).
 * Cada chamada de proximaLeitura devolve o próximo passo de um roteiro fixo, no formato da
 * tabela room_telemetry, e no fim do roteiro volta ao começo. Cada simulador tem o seu passo.
 * @returns {{ proximaLeitura: (agoraMs?: number) => object }} o simulador. proximaLeitura recebe a
 *   hora atual em milissegundos (Date.now()), que vira o updated_at; sem ela, usa a hora do relógio
 */
export function criarSimuladorS01() {
  let passo = 0 // o próximo passo do roteiro; cada simulador guarda o seu

  return {
    proximaLeitura(agoraMs) {
      const leitura = ROTEIRO_DEMO[passo]
      passo = (passo + 1) % ROTEIRO_DEMO.length // depois do último, volta ao primeiro
      // Sem uma hora válida, o new Date(...).toISOString() lançaria erro: usa a hora do relógio.
      // Válida é um número que o Date aceita: o Date só vai até 8,64e15 ms (cerca do ano 275.760),
      // e um número maior, mesmo finito, também daria a "data inválida".
      const dataRecebida = new Date(typeof agoraMs === 'number' ? agoraMs : Number.NaN)
      const hora = Number.isNaN(dataRecebida.getTime()) ? Date.now() : agoraMs
      return {
        room_id: 'S01',
        occupancy_by_table: [...leitura.mesas], // cópia: quem recebe pode mexer sem estragar o roteiro
        temperature_c: leitura.temperaturaC,
        light_value: leitura.luz,
        light_unit: 'lux_estimado',
        noise_db_simulated: leitura.ruidoDb,
        device_status: 'ok',
        updated_at: new Date(hora).toISOString(),
      }
    },
  }
}

/**
 * Busca a leitura da S01 no modo do config: no 'supabase', o GET na API; em qualquer outro
 * (o 'mock'), a próxima leitura do simulador de DEMONSTRAÇÃO, sem rede.
 * @param {{ modoTelemetria: string, supabaseUrl: string, supabaseChave: string }} config o que
 *   o lerConfiguracao (services/configuracao.js) devolve
 * @param {{ signal?: AbortSignal, agoraMs?: number, simulador?: { proximaLeitura: Function } }} [opcoes]
 *   o signal (só o Supabase usa), a hora atual (só o mock usa) e o simulador do criarSimuladorS01
 *   (obrigatório no mock; o hook cria um só e guarda, para o roteiro andar a cada chamada)
 * @returns {Promise<object|null>} a linha da S01 no formato da room_telemetry, ou null se a tabela não tiver a S01
 * @throws {Error} os erros do buscarLeituraSupabase; no mock, se faltar o simulador
 */
export async function buscarLeituraS01(config, { signal, agoraMs, simulador } = {}) {
  if (config.modoTelemetria === 'supabase') {
    return buscarLeituraSupabase({ supabaseUrl: config.supabaseUrl, supabaseChave: config.supabaseChave, signal })
  }
  // Qualquer modo que não seja 'supabase' é a demonstração: na dúvida, nunca vai à rede.
  if (!simulador) {
    throw new Error('O modo de demonstração precisa do simulador: passe o criarSimuladorS01() em "simulador".')
  }
  return simulador.proximaLeitura(agoraMs)
}
