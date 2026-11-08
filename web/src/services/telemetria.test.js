import { afterEach, describe, expect, it, vi } from 'vitest'
import { SALAS } from '../data/salas.js'
import { classificarSala } from '../domain/classificacao.js'
import { normalizarTelemetria } from '../domain/normalizar.js'
import {
  buscarLeituraS01,
  buscarLeituraSupabase,
  criarSimuladorS01,
  INTERVALO_ATUALIZACAO_MS,
  LIMITE_DESATUALIZADO_SEGUNDOS,
  TEMPO_LIMITE_PEDIDO_MS,
} from './telemetria.js'

// A linha da tabela room_telemetry com o exemplo FICTÍCIO do CONTEXTO, §6.3.
const LINHA_S01 = {
  room_id: 'S01',
  occupancy_by_table: [1, 2, 0],
  temperature_c: 22.8,
  light_value: 410,
  light_unit: 'lux_estimado',
  noise_db_simulated: 54,
  device_status: 'ok',
  updated_at: '2026-11-08T14:32:00Z',
}

const CONFIG_SUPABASE = { supabaseUrl: 'https://exemplo.supabase.co', supabaseChave: 'sb_publishable_abc' }
const URL_ESPERADA = 'https://exemplo.supabase.co/rest/v1/room_telemetry?room_id=eq.S01&select=*'

// Troca o fetch do navegador por um falso, que devolve sempre a mesma resposta.
// O Response é o mesmo objeto que o fetch de verdade devolve (o Node também tem).
function fetchFalsoQueResponde(corpo, status = 200) {
  const fetchFalso = vi.fn(async () => new Response(corpo, { status }))
  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

afterEach(() => {
  vi.unstubAllGlobals() // devolve o fetch de verdade depois de cada teste
})

describe('buscarLeituraSupabase: o GET na API do Supabase', () => {
  it('pede a linha da S01 na URL certa, com a chave publicável nos dois cabeçalhos', async () => {
    const fetchFalso = fetchFalsoQueResponde(JSON.stringify([LINHA_S01]))
    await buscarLeituraSupabase(CONFIG_SUPABASE)

    expect(fetchFalso).toHaveBeenCalledTimes(1)
    const [url, opcoes] = fetchFalso.mock.calls[0]
    expect(url).toBe(URL_ESPERADA)
    expect(opcoes.method).toBe('GET')
    expect(opcoes.headers).toEqual({ apikey: 'sb_publishable_abc', Authorization: 'Bearer sb_publishable_abc' })
  })

  it('não pede uma cópia guardada pelo navegador (a leitura tem de ser a mais nova)', async () => {
    const fetchFalso = fetchFalsoQueResponde('[]')
    await buscarLeituraSupabase(CONFIG_SUPABASE)
    expect(fetchFalso.mock.calls[0][1].cache).toBe('no-store')
  })

  it('não deixa barra dupla quando a URL termina com "/"', async () => {
    const fetchFalso = fetchFalsoQueResponde('[]')
    await buscarLeituraSupabase({ ...CONFIG_SUPABASE, supabaseUrl: 'https://exemplo.supabase.co/' })
    expect(fetchFalso.mock.calls[0][0]).toBe(URL_ESPERADA)
  })

  it.each([
    ['com "/rest/v1/" (como a página da API do Supabase mostra)', 'https://exemplo.supabase.co/rest/v1/'],
    ['com "/rest/v1" sem a barra', 'https://exemplo.supabase.co/rest/v1'],
    ['com espaços em volta e barras repetidas', '  https://exemplo.supabase.co/rest/v1//  '],
  ])('a URL %s não repete o caminho', async (_descricao, supabaseUrl) => {
    const fetchFalso = fetchFalsoQueResponde('[]')
    await buscarLeituraSupabase({ ...CONFIG_SUPABASE, supabaseUrl })
    expect(fetchFalso.mock.calls[0][0]).toBe(URL_ESPERADA)
  })

  it.each([
    ['a nova (sb_secret_)', 'sb_secret_abc'],
    // Um JWT antigo com "role": "service_role" dentro (o mesmo teste do configuracao.test.js).
    ['a antiga (JWT com service_role)', `x.${btoa(JSON.stringify({ role: 'service_role' }))}.y`],
  ])('chave SECRETA (%s): lança erro e nem chega a pedir (a chave não sai do navegador)', async (_descricao, chave) => {
    const fetchFalso = fetchFalsoQueResponde('[]')
    await expect(buscarLeituraSupabase({ ...CONFIG_SUPABASE, supabaseChave: chave })).rejects.toThrow(
      'A chave do Supabase é SECRETA e não pode ficar no navegador. Use a chave publicável.',
    )
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('repassa o signal ao fetch, para o hook poder cancelar o pedido', async () => {
    const fetchFalso = fetchFalsoQueResponde('[]')
    const controle = new AbortController()
    await buscarLeituraSupabase({ ...CONFIG_SUPABASE, signal: controle.signal })
    expect(fetchFalso.mock.calls[0][1].signal).toBe(controle.signal)
  })

  it('devolve a linha da S01 (o objeto, não a lista)', async () => {
    fetchFalsoQueResponde(JSON.stringify([LINHA_S01]))
    expect(await buscarLeituraSupabase(CONFIG_SUPABASE)).toEqual(LINHA_S01)
  })

  it('devolve null quando a tabela não tem a S01 (lista vazia)', async () => {
    fetchFalsoQueResponde('[]')
    expect(await buscarLeituraSupabase(CONFIG_SUPABASE)).toBeNull()
  })

  it.each([
    [401, 'A API respondeu com erro (HTTP 401).'],
    [404, 'A API respondeu com erro (HTTP 404).'],
    [500, 'A API respondeu com erro (HTTP 500).'],
  ])('resposta com erro HTTP %i: lança um erro com o código', async (status, mensagem) => {
    fetchFalsoQueResponde(JSON.stringify({ message: 'erro' }), status)
    await expect(buscarLeituraSupabase(CONFIG_SUPABASE)).rejects.toThrow(mensagem)
  })

  it.each([
    ['um objeto no lugar da lista', JSON.stringify(LINHA_S01)],
    ['um texto que não é JSON', '<html>página de erro</html>'],
    ['null', 'null'],
  ])('resposta com %s: lança "formato inesperado"', async (_descricao, corpo) => {
    fetchFalsoQueResponde(corpo)
    await expect(buscarLeituraSupabase(CONFIG_SUPABASE)).rejects.toThrow('A API respondeu num formato inesperado.')
  })

  it('sem internet (o fetch falha): lança um erro em português, não o "Failed to fetch"', async () => {
    const erroDoFetch = new TypeError('Failed to fetch')
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw erroDoFetch
    }))
    const promessa = buscarLeituraSupabase(CONFIG_SUPABASE)
    await expect(promessa).rejects.toThrow('Não foi possível falar com a API. Confira a internet e a URL do Supabase.')
    await expect(promessa).rejects.toMatchObject({ cause: erroDoFetch }) // o original fica guardado para o console
  })

  it('pedido cancelado pelo signal: repassa o AbortError como veio, para o hook reconhecer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new DOMException('This operation was aborted', 'AbortError')
    }))
    await expect(buscarLeituraSupabase(CONFIG_SUPABASE)).rejects.toMatchObject({ name: 'AbortError' })
  })
})

// O simulador é o modo de DEMONSTRAÇÃO: uma leitura que muda, sem rede e sem o Wokwi.
const AGORA = Date.UTC(2026, 10, 8, 14, 32, 0) // 08/11/2026, 14:32:00 UTC
const META_S01 = SALAS[0]
const PASSOS_DO_ROTEIRO = 9
const CAMPOS_DA_LEITURA = ['occupancy_by_table', 'temperature_c', 'light_value', 'noise_db_simulated']

// Pede várias leituras seguidas, 5 segundos uma depois da outra.
function lerVarias(simulador, quantas) {
  const leituras = []
  for (let i = 0; i < quantas; i++) {
    leituras.push(simulador.proximaLeitura(AGORA + i * 5000))
  }
  return leituras
}

// A leitura sem a hora: para comparar dois passos do roteiro.
function semHora(linha) {
  const copia = { ...linha }
  delete copia.updated_at
  return copia
}

// Os campos da leitura que mudaram de uma linha para a outra.
function camposQueMudaram(antes, depois) {
  return CAMPOS_DA_LEITURA.filter((campo) => JSON.stringify(antes[campo]) !== JSON.stringify(depois[campo]))
}

describe('criarSimuladorS01: o formato da linha', () => {
  it('cada leitura tem o formato da tabela room_telemetry', () => {
    for (const linha of lerVarias(criarSimuladorS01(), 2 * PASSOS_DO_ROTEIRO)) {
      expect(linha.room_id).toBe('S01')
      expect(linha.occupancy_by_table).toHaveLength(3)
      for (const pessoas of linha.occupancy_by_table) {
        expect(Number.isInteger(pessoas) && pessoas >= 0 && pessoas <= 3).toBe(true)
      }
      expect(typeof linha.temperature_c).toBe('number')
      expect(typeof linha.light_value).toBe('number')
      expect(linha.light_unit).toBe('lux_estimado')
      expect(linha.noise_db_simulated).toBeGreaterThanOrEqual(30)
      expect(linha.noise_db_simulated).toBeLessThanOrEqual(80)
      expect(linha.device_status).toBe('ok')
    }
  })

  it('a hora da leitura é a hora recebida, no formato do Supabase', () => {
    expect(criarSimuladorS01().proximaLeitura(AGORA).updated_at).toBe('2026-11-08T14:32:00.000Z')
  })

  it('toda leitura passa pelo normalizar.js sem nenhum campo inválido', () => {
    for (const linha of lerVarias(criarSimuladorS01(), PASSOS_DO_ROTEIRO)) {
      expect(normalizarTelemetria(linha, META_S01, 'mock').statusDispositivo).toBe('ok')
    }
  })

  it('sem a hora (ou com uma hora inválida), usa a hora atual em vez de quebrar', () => {
    vi.useFakeTimers()
    vi.setSystemTime(AGORA)
    try {
      expect(criarSimuladorS01().proximaLeitura().updated_at).toBe('2026-11-08T14:32:00.000Z')
      expect(criarSimuladorS01().proximaLeitura(Number.NaN).updated_at).toBe('2026-11-08T14:32:00.000Z')
    } finally {
      vi.useRealTimers()
    }
  })

  it('uma hora finita, mas fora do que o Date aceita (mais de 8,64e15 ms), também usa a hora atual', () => {
    vi.useFakeTimers()
    vi.setSystemTime(AGORA)
    try {
      for (const hora of [1e20, -1e20, 8.64e15 + 1, '2026', null]) {
        expect(criarSimuladorS01().proximaLeitura(hora).updated_at).toBe('2026-11-08T14:32:00.000Z')
      }
      // O limite exato ainda vale: é a última data que o Date aceita.
      expect(criarSimuladorS01().proximaLeitura(8.64e15).updated_at).toBe('+275760-09-13T00:00:00.000Z')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('criarSimuladorS01: o roteiro fixo', () => {
  it('é determinístico: dois simuladores dão as mesmas leituras', () => {
    expect(lerVarias(criarSimuladorS01(), 2 * PASSOS_DO_ROTEIRO)).toEqual(lerVarias(criarSimuladorS01(), 2 * PASSOS_DO_ROTEIRO))
  })

  it('tem 9 passos diferentes e depois volta ao começo', () => {
    const leituras = lerVarias(criarSimuladorS01(), 2 * PASSOS_DO_ROTEIRO).map(semHora)
    const primeiraVolta = leituras.slice(0, PASSOS_DO_ROTEIRO)
    expect(new Set(primeiraVolta.map((linha) => JSON.stringify(linha))).size).toBe(PASSOS_DO_ROTEIRO)
    expect(leituras.slice(PASSOS_DO_ROTEIRO)).toEqual(primeiraVolta)
  })

  it('muda UM valor por vez, também na volta do último passo para o primeiro', () => {
    const leituras = lerVarias(criarSimuladorS01(), PASSOS_DO_ROTEIRO + 1)
    for (let i = 1; i < leituras.length; i++) {
      expect(camposQueMudaram(leituras[i - 1], leituras[i])).toHaveLength(1)
    }
  })

  it('quando mudam as mesas, é uma pessoa que entra ou sai de uma mesa só', () => {
    const leituras = lerVarias(criarSimuladorS01(), PASSOS_DO_ROTEIRO + 1)
    let mudancasNasMesas = 0
    for (let i = 1; i < leituras.length; i++) {
      const antes = leituras[i - 1].occupancy_by_table
      const depois = leituras[i].occupancy_by_table
      const diferencas = antes.map((pessoas, mesa) => Math.abs(depois[mesa] - pessoas)).filter((d) => d !== 0)
      if (diferencas.length > 0) {
        mudancasNasMesas = mudancasNasMesas + 1
        expect(diferencas).toEqual([1])
      }
    }
    expect(mudancasNasMesas).toBeGreaterThan(0)
  })

  it('passa pelos três estados (verde, amarelo e vermelho) e nunca cai em falha', () => {
    const estados = lerVarias(criarSimuladorS01(), PASSOS_DO_ROTEIRO).map(
      (linha) => classificarSala(normalizarTelemetria(linha, META_S01, 'mock')).estado,
    )
    expect(new Set(estados)).toEqual(new Set(['verde', 'amarelo', 'vermelho']))
  })

  it('começa com a sala adequada (verde)', () => {
    const linha = criarSimuladorS01().proximaLeitura(AGORA)
    expect(classificarSala(normalizarTelemetria(linha, META_S01, 'mock')).estado).toBe('verde')
  })

  it('cada simulador anda sozinho: pedir leitura num não avança o outro', () => {
    const primeiro = criarSimuladorS01()
    const segundo = criarSimuladorS01()
    lerVarias(primeiro, 3)
    expect(semHora(segundo.proximaLeitura(AGORA))).toEqual(semHora(criarSimuladorS01().proximaLeitura(AGORA)))
  })

  it('mexer na leitura devolvida não muda o roteiro', () => {
    const simulador = criarSimuladorS01()
    const primeira = simulador.proximaLeitura(AGORA)
    const copiaDaPrimeira = structuredClone(primeira)
    primeira.occupancy_by_table[0] = 3
    primeira.temperature_c = 99
    lerVarias(simulador, PASSOS_DO_ROTEIRO - 1) // termina a primeira volta
    expect(simulador.proximaLeitura(AGORA)).toEqual(copiaDaPrimeira)
  })
})

describe('buscarLeituraS01: escolhe entre a demonstração e o Supabase', () => {
  // O config tem o formato do lerConfiguracao (services/configuracao.js).
  const CONFIG_MOCK = { modoTelemetria: 'mock', supabaseUrl: '', supabaseChave: '', aviso: null }
  const CONFIG_SUPABASE_COMPLETO = { modoTelemetria: 'supabase', ...CONFIG_SUPABASE, aviso: null }

  it('no mock, devolve a próxima leitura do simulador, com a hora recebida, sem usar a rede', async () => {
    const fetchFalso = vi.fn()
    vi.stubGlobal('fetch', fetchFalso)
    const simulador = criarSimuladorS01()
    const linha = await buscarLeituraS01(CONFIG_MOCK, { agoraMs: AGORA, simulador })

    expect(linha).toEqual(criarSimuladorS01().proximaLeitura(AGORA))
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('no mock, cada chamada anda um passo no mesmo simulador', async () => {
    const simulador = criarSimuladorS01()
    const primeira = await buscarLeituraS01(CONFIG_MOCK, { agoraMs: AGORA, simulador })
    const segunda = await buscarLeituraS01(CONFIG_MOCK, { agoraMs: AGORA, simulador })
    const roteiro = lerVarias(criarSimuladorS01(), 2).map(semHora)
    expect([semHora(primeira), semHora(segunda)]).toEqual(roteiro)
  })

  it('no mock sem simulador, lança um erro que diz o que falta', async () => {
    await expect(buscarLeituraS01(CONFIG_MOCK, { agoraMs: AGORA })).rejects.toThrow(/simulador/)
  })

  it('no supabase, faz o GET com a URL e a chave do config e repassa o signal', async () => {
    const fetchFalso = fetchFalsoQueResponde(JSON.stringify([LINHA_S01]))
    const controle = new AbortController()
    const simulador = criarSimuladorS01()
    const linha = await buscarLeituraS01(CONFIG_SUPABASE_COMPLETO, { signal: controle.signal, agoraMs: AGORA, simulador })

    expect(linha).toEqual(LINHA_S01)
    const [url, opcoes] = fetchFalso.mock.calls[0]
    expect(url).toBe(URL_ESPERADA)
    expect(opcoes.headers.apikey).toBe('sb_publishable_abc')
    expect(opcoes.signal).toBe(controle.signal)
    // O simulador não andou: a próxima leitura dele ainda é a primeira do roteiro.
    expect(semHora(simulador.proximaLeitura(AGORA))).toEqual(semHora(criarSimuladorS01().proximaLeitura(AGORA)))
  })

  it('no supabase, funciona sem o segundo parâmetro', async () => {
    fetchFalsoQueResponde('[]')
    expect(await buscarLeituraS01(CONFIG_SUPABASE_COMPLETO)).toBeNull()
  })

  it('no supabase, o erro da API chega a quem chamou', async () => {
    fetchFalsoQueResponde('{}', 503)
    await expect(buscarLeituraS01(CONFIG_SUPABASE_COMPLETO, {})).rejects.toThrow('A API respondeu com erro (HTTP 503).')
  })

  it('no supabase com um config montado à mão com a chave SECRETA: não manda a chave', async () => {
    const fetchFalso = fetchFalsoQueResponde('[]')
    const config = { ...CONFIG_SUPABASE_COMPLETO, supabaseChave: 'sb_secret_abc' }
    await expect(buscarLeituraS01(config, {})).rejects.toThrow(/SECRETA/)
    expect(fetchFalso).not.toHaveBeenCalled()
  })
})

describe('os tempos do polling (PROVISÓRIOS: dependem do intervalo de envio do ESP32)', () => {
  it('o limite de "Desatualizado" é maior que o intervalo entre dois pedidos', () => {
    // Se fosse menor, a leitura ficaria "Desatualizado" antes mesmo do próximo pedido.
    expect(LIMITE_DESATUALIZADO_SEGUNDOS * 1000).toBeGreaterThan(INTERVALO_ATUALIZACAO_MS)
  })

  it('o intervalo é um número de milissegundos maior que zero', () => {
    expect(Number.isInteger(INTERVALO_ATUALIZACAO_MS) && INTERVALO_ATUALIZACAO_MS > 0).toBe(true)
  })

  it('o tempo limite de um pedido é maior que o intervalo (a rede lenta que funciona não perde a resposta)', () => {
    // Se fosse igual ou menor, uma API que sempre leva um pouco mais que o intervalo nunca
    // teria uma resposta aceita.
    expect(Number.isInteger(TEMPO_LIMITE_PEDIDO_MS)).toBe(true)
    expect(TEMPO_LIMITE_PEDIDO_MS).toBeGreaterThan(INTERVALO_ATUALIZACAO_MS)
  })
})
