import { useEffect, useRef, useState } from 'react'
import { SALAS } from '../data/salas.js'
import * as regras from '../domain/colecoes.js'
import { CHAVE_PREFERENCIAS, lerPreferencias, salvarPreferencias } from '../services/colecoesLocais.js'

// Os favoritos e as listas do estudante (CONTEXTO, §7.7; RN-12), guardados só neste navegador.
// As regras (o que muda em cada ação) ficam no domain/colecoes.js, importado como "regras";
// quem lê e grava no localStorage é o services/colecoesLocais.js. Aqui só fica o estado.

// Os ids das nove salas: só eles podem estar nos favoritos e nas listas.
const IDS_DAS_SALAS = SALAS.map((sala) => sala.id)

// Só de pegar o window.localStorage o navegador pode lançar erro (quando bloqueia os dados
// do site). Aí devolve null, e o services/colecoesLocais.js trata o null: na leitura começa
// do zero com o aviso, e na gravação devolve false, sem quebrar a tela.
function pegarLocalStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

// O id de uma lista nova. O crypto.randomUUID() só existe em página segura (https ou
// localhost): aberta pelo IP da rede (ex.: http://192.168.0.10:5173, para testar no celular),
// ele não existe. Aí o id sai da hora e de um sorteio. O id só precisa ser diferente dos outros
// deste navegador, e o domain/colecoes.js ainda recusa um id repetido.
function novoIdDeLista() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `lista-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Os favoritos e as listas (o CRUD), lidos do localStorage e gravados nele a cada mudança.
 * @returns {{ favoritos: string[], listas: { id: string, name: string, room_ids: string[] }[],
 *   aviso: string|null, ehFavorita: (salaId: string) => boolean, alternarFavorito: (salaId: string) => void,
 *   criarLista: (nome: string) => { ok: boolean, erro: string|null, id: string|null },
 *   renomearLista: (listaId: string, nome: string) => { ok: boolean, erro: string|null },
 *   excluirLista: (listaId: string) => void, adicionarSala: (listaId: string, salaId: string) => void,
 *   removerSala: (listaId: string, salaId: string) => void }}
 */
export function useColecoes() {
  // React Hook useState: a função inicial roda só na primeira vez, e por isso o localStorage é
  // lido uma vez só (como no useLocalStorage da aula). Guarda também o aviso da leitura.
  const [leitura] = useState(() => lerPreferencias(pegarLocalStorage(), IDS_DAS_SALAS))
  const [prefs, setPrefs] = useState(leitura.prefs)

  // React Hook useRef: guarda a versão mais nova das preferências, que muda NA HORA da ação, antes
  // de o React desenhar de novo (o prefs do useState só muda no próximo desenho). As ações conferem
  // e calculam a partir dela. Por quê: a tela pode fazer duas ações no mesmo clique (o "Criar e
  // adicionar" cria a lista e já põe a sala nela). Partindo do prefs, a segunda ação não veria a
  // primeira: criar duas listas "Grupo" devolveria ok nas duas (e só uma existiria), e renomear a
  // lista recém-criada daria "Lista não encontrada.". O desenho continua usando o prefs: o ref
  // nunca é lido no desenho, só nas ações e no efeito do evento 'storage'.
  const maisNova = useRef(leitura.prefs)

  // Toda mudança passa por aqui: atualiza a versão mais nova na hora e pede o desenho novo.
  const aplicar = (novas) => {
    maisNova.current = novas
    setPrefs(novas)
  }

  // React Hook useEffect: executa depois de cada mudança das preferências e por isso grava a
  // versão nova no localStorage. Enquanto nada mudou, não grava: assim um texto salvo quebrado
  // continua lá (dá para recuperar à mão) até a pessoa mexer nas listas.
  useEffect(() => {
    if (prefs === leitura.prefs) {
      return // ainda é exatamente o que foi lido
    }
    // Se o navegador recusar (cheio ou bloqueado), as listas valem até fechar a página.
    // O bloqueado já aparece no aviso da leitura; o cheio é quase impossível (são poucos bytes).
    salvarPreferencias(pegarLocalStorage(), prefs)
  }, [prefs, leitura.prefs])

  // React Hook useEffect: executa uma vez, quando a tela abre, e por isso passa a escutar o
  // evento 'storage', que o navegador dispara nesta aba quando OUTRA aba grava no localStorage.
  // Sem isso, cada aba gravaria a sua versão por cima da outra: a última a gravar apagaria o que
  // a outra fez (a lista criada sumiria, a excluída voltaria). O localStorage continua lido uma vez
  // ao abrir; depois, só quando a outra aba avisa. O return para de escutar quando a tela sai.
  useEffect(() => {
    const quandoOutraAbaGravar = (evento) => {
      // A key null quer dizer que a outra aba limpou o localStorage inteiro (localStorage.clear()).
      if (evento.key !== CHAVE_PREFERENCIAS && evento.key !== null) {
        return
      }
      const lida = lerPreferencias(pegarLocalStorage(), IDS_DAS_SALAS)
      // Se não deu para ler o que a outra aba gravou (ex.: outra versão do formato), esta aba
      // continua como está, em vez de trocar tudo pelo vazio e gravar o vazio por cima.
      if (lida.aviso !== null) {
        return
      }
      // O mesmo que o aplicar faz (escrito aqui para o efeito só usar o ref e o setPrefs, que
      // nunca mudam). Gravar o mesmo texto de volta (o efeito de cima) não dispara o 'storage'
      // na outra aba, então as duas não ficam avisando uma à outra sem parar.
      maisNova.current = lida.prefs
      setPrefs(lida.prefs)
    }
    window.addEventListener('storage', quandoOutraAbaGravar)
    return () => window.removeEventListener('storage', quandoOutraAbaGravar)
  }, [])

  const ehFavorita = (salaId) => prefs.favorites.includes(salaId)

  const alternarFavorito = (salaId) => {
    aplicar(regras.alternarFavorito(maisNova.current, salaId))
  }

  // Confere o nome na versão mais nova (para devolver o erro na hora) e cria a lista com o id já sorteado.
  const criarLista = (nome) => {
    const id = novoIdDeLista()
    const resultado = regras.criarLista(maisNova.current, nome, id)
    if (resultado.erro !== null) {
      return { ok: false, erro: resultado.erro, id: null }
    }
    aplicar(resultado.prefs)
    return { ok: true, erro: null, id }
  }

  const renomearLista = (listaId, nome) => {
    const resultado = regras.renomearLista(maisNova.current, listaId, nome)
    if (resultado.erro !== null) {
      return { ok: false, erro: resultado.erro }
    }
    aplicar(resultado.prefs)
    return { ok: true, erro: null }
  }

  const excluirLista = (listaId) => {
    aplicar(regras.excluirLista(maisNova.current, listaId))
  }

  const adicionarSala = (listaId, salaId) => {
    aplicar(regras.adicionarSalaNaLista(maisNova.current, listaId, salaId))
  }

  const removerSala = (listaId, salaId) => {
    aplicar(regras.removerSalaDaLista(maisNova.current, listaId, salaId))
  }

  return {
    favoritos: prefs.favorites,
    listas: prefs.lists,
    aviso: leitura.aviso,
    ehFavorita,
    alternarFavorito,
    criarLista,
    renomearLista,
    excluirLista,
    adicionarSala,
    removerSala,
  }
}
