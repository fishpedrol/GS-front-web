import { useEffect, useState } from 'react'
import { leituraDesatualizada } from '../domain/atualizacao.js'
import { classificarSala } from '../domain/classificacao.js'
import { montarSalas } from '../domain/normalizar.js'
import { lerConfiguracao } from '../services/configuracao.js'
import {
  INTERVALO_ATUALIZACAO_MS,
  LIMITE_DESATUALIZADO_SEGUNDOS,
  TEMPO_LIMITE_PEDIDO_MS,
  buscarLeituraS01,
  criarSimuladorS01,
} from '../services/telemetria.js'

// As nove salas do painel. A S01 é buscada (no Supabase ou no simulador de demonstração) assim
// que a tela abre e a cada INTERVALO_ATUALIZACAO_MS; as outras oito são fixas (data/salas.js).
// Regra principal (RN-11): nunca inventar leitura. Se uma busca falhar, ou se a API responder
// sem a linha da S01, a S01 continua com a última linha recebida e a tela mostra o erro.

// De quanto em quanto tempo o relógio confere se o selo "Desatualizado" mudou, mesmo sem
// leitura nova. Um segundo basta: o limite é contado em segundos.
const INTERVALO_RELOGIO_MS = 1000

// O pedido que passa do TEMPO_LIMITE_PEDIDO_MS é cancelado (ver o services/telemetria.js).
const ERRO_DEMOROU = `A API demorou mais de ${TEMPO_LIMITE_PEDIDO_MS / 1000} segundos para responder.`
// A API respondeu, mas a lista veio vazia. No Supabase isso acontece quando a linha da S01 não
// existe ou quando o RLS não deixa a chave publicável ler a tabela (ele responde 200 com [], e não um erro).
const ERRO_SEM_LINHA = 'A API não devolveu a leitura da S01 (a linha não existe ou não está liberada para leitura).'
// Os erros do services/telemetria.js já vêm em português; este é só para um erro sem mensagem.
const ERRO_SEM_MENSAGEM = 'Não foi possível buscar a leitura da S01.'

// Para cada sala, diz se a leitura está velha no momento dado (o selo "Desatualizado").
// As salas demo têm dados fixos, sem hora: nunca ficam desatualizadas.
function marcarDesatualizadas(salas, momento) {
  return salas.map((sala) =>
    sala.origem === 'demo' ? false : leituraDesatualizada(sala.atualizadoEm, momento, LIMITE_DESATUALIZADO_SEGUNDOS),
  )
}

// Diz se, de um momento para o outro, o selo de alguma sala mudou.
function mudouAlgumSelo(salas, antes, depois) {
  const selosAntes = marcarDesatualizadas(salas, antes)
  const selosDepois = marcarDesatualizadas(salas, depois)
  return selosAntes.some((selo, indice) => selo !== selosDepois[indice])
}

/**
 * As nove salas prontas para a tela, com a S01 sempre atualizada (polling).
 * @returns {{ itens: { sala: object, classificacao: object, desatualizada: boolean }[], carregando: boolean,
 *   erro: string|null, modo: 'mock'|'supabase', aviso: string|null, ultimaBusca: number|null,
 *   atualizarAgora: () => void }} os itens na ordem S01 a S09; carregando só até a primeira resposta
 *   (ou até o primeiro pedido passar do tempo limite); erro é a última falha (os dados de antes
 *   continuam); ultimaBusca é a hora (ms) da última resposta (um pedido cancelado não conta)
 */
export function useSalas() {
  // React Hook useState: as funções iniciais rodam só na primeira vez, e por isso a configuração
  // é lida uma vez e o simulador é um só (o roteiro da demonstração anda a cada busca).
  const [config] = useState(() => lerConfiguracao(import.meta.env))
  const [simulador] = useState(() => criarSimuladorS01())
  const [linha, setLinha] = useState(null) // a última linha da S01 que chegou (null: nenhuma ainda)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [ultimaBusca, setUltimaBusca] = useState(null)
  const [agora, setAgora] = useState(() => Date.now())
  const [pedidosManuais, setPedidosManuais] = useState(0) // conta os cliques em "atualizar agora"

  const modo = config.modoTelemetria
  // A S01 do mock sai como 'mock' (simulação), nunca como 'iot' (RN-10).
  const origemDaS01 = modo === 'mock' ? 'mock' : 'iot'

  // React Hook useEffect: executa quando a tela abre (e de novo a cada "atualizar agora") e por
  // isso agenda a primeira busca da S01 e liga o setInterval das próximas. O return desliga tudo
  // quando a tela sai: para os timers e cancela o pedido que ainda não voltou (AbortController).
  useEffect(() => {
    let ligado = true // vira false no return: depois disso, nenhuma resposta muda a tela
    let pedidoEmAndamento = null // o AbortController do pedido que ainda não voltou

    async function buscar() {
      // O pedido anterior ainda não voltou: pula esta vez, sem cancelar o anterior. Quem cancela
      // um pedido que demora é o tempo limite dele, maior que o intervalo: assim, numa rede lenta
      // que funciona (a resposta leva 6 s, por exemplo), as respostas continuam chegando.
      if (pedidoEmAndamento !== null) {
        return
      }
      const controlador = new AbortController()
      pedidoEmAndamento = controlador
      const tempoLimite = setTimeout(() => controlador.abort(), TEMPO_LIMITE_PEDIDO_MS)

      // O estado só muda depois do await (quando a resposta chega), nunca na hora do efeito.
      try {
        const novaLinha = await buscarLeituraS01(config, { signal: controlador.signal, agoraMs: Date.now(), simulador })
        if (!ligado) {
          return // a tela saiu (ou foi pedido "atualizar agora") antes de a resposta chegar
        }
        if (novaLinha === null) {
          // Veio a lista vazia: null não é uma linha. A última linha continua (RN-11) e, depois
          // do limite, o leituraDesatualizada marca a S01 como "Desatualizado", sem inventar nada.
          setErro(ERRO_SEM_LINHA)
        } else {
          setLinha(novaLinha)
          setErro(null)
        }
      } catch (falha) {
        if (!ligado) {
          return // o cancelamento do return do efeito não é erro
        }
        // Com a tela aberta, o único cancelamento é o do tempo limite: o pedido demorou demais.
        // Não chegou resposta nenhuma, então a ultimaBusca não muda; a linha antiga continua (RN-11).
        if (falha && falha.name === 'AbortError') {
          setErro(ERRO_DEMOROU)
          setCarregando(false) // a tela sai do "carregando" e mostra a S01 como está, com o erro
          return
        }
        setErro(falha instanceof Error && falha.message ? falha.message : ERRO_SEM_MENSAGEM)
      } finally {
        clearTimeout(tempoLimite)
        if (pedidoEmAndamento === controlador) {
          pedidoEmAndamento = null // este voltou; o próximo pode ir
        }
      }

      // Chegou uma resposta (com a linha, com a lista vazia ou com o erro da API).
      const horaDaResposta = Date.now()
      setUltimaBusca(horaDaResposta)
      setAgora(horaDaResposta)
      setCarregando(false)
    }

    // A primeira busca vai num setTimeout de 0, e não direto aqui. Em desenvolvimento, o
    // StrictMode roda este efeito, desfaz (o return) e roda de novo, na mesma hora. Chamada
    // direto, a busca descartada já andaria um passo do roteiro da demonstração (no mock, o
    // simulador anda antes do primeiro await) e a tela começaria no passo 2; no Supabase, seriam
    // dois GET. Com o timer, o return do primeiro efeito limpa a busca antes de ela rodar.
    const primeiraBusca = setTimeout(buscar, 0)
    const timer = setInterval(buscar, INTERVALO_ATUALIZACAO_MS)

    return () => {
      ligado = false
      clearTimeout(primeiraBusca)
      clearInterval(timer)
      if (pedidoEmAndamento !== null) {
        pedidoEmAndamento.abort()
      }
    }
  }, [config, simulador, pedidosManuais])

  // React Hook useEffect: executa quando chega outra linha da S01 e por isso liga o relógio que,
  // a cada segundo, confere se o selo "Desatualizado" de alguma sala mudou. O "agora" só anda
  // quando o selo muda: com o mesmo valor, o React não desenha a página inteira de novo à toa.
  // O return desliga o relógio (quando a tela sai ou antes de ligar o da linha nova).
  useEffect(() => {
    const salas = montarSalas(linha, origemDaS01)
    const relogio = setInterval(() => {
      const momento = Date.now()
      setAgora((anterior) => (mudouAlgumSelo(salas, anterior, momento) ? momento : anterior))
    }, INTERVALO_RELOGIO_MS)
    return () => clearInterval(relogio)
  }, [linha, origemDaS01])

  // Recomeça o efeito da busca: cancela o pedido que estava no caminho, busca já e
  // recomeça a contagem do intervalo.
  const atualizarAgora = () => {
    setPedidosManuais((quantos) => quantos + 1)
  }

  // As salas são montadas a cada desenho, e não guardadas: assim o "Desatualizado" acompanha o
  // "agora" do relógio e nunca fica velho.
  const salas = montarSalas(linha, origemDaS01)
  const selos = marcarDesatualizadas(salas, agora)
  const itens = salas.map((sala, indice) => ({
    sala,
    classificacao: classificarSala(sala),
    desatualizada: selos[indice],
  }))

  return { itens, carregando, erro, modo, aviso: config.aviso, ultimaBusca, atualizarAgora }
}
