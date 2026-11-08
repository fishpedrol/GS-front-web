// A hora da leitura: se a data é válida e se a leitura já está velha (CONTEXTO, §6.5; RN-11).
// JavaScript puro: sem React, sem rede, sem localStorage. A hora atual vem de quem chama
// (o hook usa Date.now()), para os testes poderem escolher a hora.

// A data completa, no formato que o Supabase devolve: dia, "T", hora com segundos e o fuso.
// Ex.: '2026-11-08T14:32:00Z' ou '2026-11-08T14:32:00.123456+00:00'.
// As três partes entre parênteses são: o dia e a hora, a fração do segundo (opcional) e o fuso.
const FORMATO_DATA_ISO = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

/**
 * Lê uma data completa (dia, hora e fuso). Use esta função, e não o Date.parse direto:
 * o Date.parse do Chrome aceita "0" (ano 2000) e "99" (1999) como data, e um texto fora do
 * padrão pode ser lido de um jeito em cada navegador.
 * @param {unknown} texto a data que veio (ex.: o updated_at do Supabase)
 * @returns {number|null} os milissegundos desde 1970 (como o Date.parse), ou null se não for uma data completa
 */
export function lerDataIso(texto) {
  if (typeof texto !== 'string') {
    return null
  }
  const partes = FORMATO_DATA_ISO.exec(texto)
  if (partes === null) {
    return null
  }
  const diaEHora = partes[1]
  const fracao = partes[2] || '' // ex.: '.123456', ou '' se não veio
  const fuso = partes[3]
  // O padrão do JavaScript tem exatamente 3 casas depois do ponto (milissegundos), e o
  // Postgres manda 6 (microssegundos). Ficam as 3 primeiras: '.5' vira '500', '.123456' vira '123'.
  const milesimos = (fracao.slice(1) + '000').slice(0, 3)
  const milissegundos = Date.parse(`${diaEHora}.${milesimos}${fuso}`)
  // NaN quando o formato está certo mas a data não existe (ex.: mês 13).
  return Number.isNaN(milissegundos) ? null : milissegundos
}

/**
 * Diz se a leitura está velha demais para ser mostrada como atual (o selo "Desatualizado").
 * Não muda o estado da sala: a tela continua mostrando a última leitura, com o aviso (RN-11).
 * Na dúvida, diz que está desatualizada: sem data válida, sem limite, ou com a data mais
 * longe no futuro que o próprio limite (relógio errado ou linha mexida à mão).
 * @param {string|null} atualizadoEm a hora da leitura (o atualizadoEm da sala normalizada)
 * @param {number} agora a hora atual, em milissegundos (Date.now())
 * @param {number} limiteSegundos depois de quantos segundos a leitura fica velha
 *   (o STALE_AFTER_SECONDS, ainda pendente: depende do intervalo de envio do ESP32)
 * @returns {boolean} true se está desatualizada (ou se não dá para saber)
 */
export function leituraDesatualizada(atualizadoEm, agora, limiteSegundos) {
  const horaDaLeitura = lerDataIso(atualizadoEm)
  const temAgora = typeof agora === 'number' && Number.isFinite(agora)
  const temLimite = typeof limiteSegundos === 'number' && Number.isFinite(limiteSegundos) && limiteSegundos > 0
  if (horaDaLeitura === null || !temAgora || !temLimite) {
    return true
  }
  const idade = agora - horaDaLeitura // em milissegundos; negativa se a data está no futuro
  const limite = limiteSegundos * 1000
  return idade > limite || idade < -limite
}
