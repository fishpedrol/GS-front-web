import { useState } from 'react'
import { FILTROS_VAZIOS, contarFiltrosAtivos, filtrarItens, valorDoFiltro } from '../domain/filtros.js'
import { ATIVIDADES, ranquearItens } from '../domain/ranking.js'

// Os filtros manuais e o atalho de atividade (CONTEXTO, §7.4 e §7.5). As regras ficam no
// domain/filtros.js e no domain/ranking.js; aqui só fica o que a pessoa escolheu.

/**
 * Os filtros e a atividade escolhidos, e as salas que sobram, já na ordem do ranking.
 * @param {{ sala: object, classificacao: object, desatualizada: boolean }[]} itens as salas do useSalas
 * @param {string[]} favoritos os ids das salas favoritas (o favoritos do useColecoes)
 * @returns {{ filtros: object, alterarFiltro: (campo: string, valor: unknown) => void, limparFiltros: () => void,
 *   atividade: string|null, escolherAtividade: (id: string|null) => void, totalAtivos: number, resultado: object[] }}
 */
export function useFiltros(itens, favoritos) {
  // React Hook useState: começa sem nenhum filtro e sem atividade (a ordem S01 a S09).
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS)
  const [atividade, setAtividade] = useState(null)

  // O campo da tela manda texto ('' quando a pessoa apaga). O valorDoFiltro transforma:
  // '' ou texto que não é número vira null ("sem limite"), e '20' vira 20.
  // Um campo que não existe lança erro aqui, no clique, e não depois, ao desenhar a tela.
  const alterarFiltro = (campo, valor) => {
    const novoValor = valorDoFiltro(campo, valor)
    setFiltros((atuais) => ({ ...atuais, [campo]: novoValor }))
  }

  const limparFiltros = () => {
    setFiltros(FILTROS_VAZIOS)
  }

  // null (ou undefined) volta para "Todas as salas". Um id que não existe lança erro aqui, no
  // clique: guardado no estado, ele faria o ranquearItens lançar erro ao desenhar a tela inteira.
  const escolherAtividade = (id) => {
    const escolhida = id ?? null
    if (escolhida !== null && !ATIVIDADES.some((opcao) => opcao.id === escolhida)) {
      throw new Error(`Atividade desconhecida: "${escolhida}". Use um dos ids do ATIVIDADES ou null.`)
    }
    setAtividade(escolhida)
  }

  // O resultado é calculado a cada desenho, e não guardado: assim nunca fica velho quando
  // chega uma leitura nova da S01 ou muda um favorito. São só nove salas: a conta é rápida.
  const resultado = ranquearItens(filtrarItens(itens, filtros, favoritos), atividade)

  return {
    filtros,
    alterarFiltro,
    limparFiltros,
    atividade,
    escolherAtividade,
    totalAtivos: contarFiltrosAtivos(filtros),
    resultado,
  }
}
