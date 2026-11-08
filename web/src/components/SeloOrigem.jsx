import Icone from './Icone.jsx'
import { formatarHora } from '../domain/formatar.js'
import { lerDataIso } from '../domain/atualizacao.js'

// De onde vem o dado da sala. Fica sempre à vista: ninguém pode achar que dado fictício é medição.
const ORIGEM = {
  iot: { icone: 'antena', texto: 'IoT simulado', cor: 'text-tinta' },
  mock: { icone: 'antena', texto: 'Simulação local', cor: 'text-tinta-2' },
  demo: { icone: 'arquivo', texto: 'Dados demonstrativos', cor: 'text-tinta-3' },
}

// O que dizer quando a S01 não tem uma leitura boa.
const STATUS = {
  sem_leitura: 'Aguardando a primeira leitura',
  dados_invalidos: 'Leitura recebida com dados inválidos',
  offline: 'Dispositivo offline',
  sensor_error: 'Falha no sensor',
}

/**
 * A origem e o frescor do dado de uma sala.
 * @param {{ sala: object, desatualizada: boolean, erroApi?: string|null }} props
 */
const SeloOrigem = ({ sala, desatualizada, erroApi = null }) => {
  const origem = ORIGEM[sala.origem] || ORIGEM.demo
  const ehAoVivo = sala.origem === 'iot' || sala.origem === 'mock'
  const hora = formatarHora(lerDataIso(sala.atualizadoEm), true)
  const statusRuim = sala.statusDispositivo && sala.statusDispositivo !== 'ok'

  let frescor = null
  if (ehAoVivo) {
    if (statusRuim) {
      frescor = (
        <span className="inline-flex items-center gap-1 text-falha">
          <Icone nome="semLeitura" tamanho={14} />
          {STATUS[sala.statusDispositivo] || 'Sem leitura confiável'}
        </span>
      )
    } else if (desatualizada) {
      frescor = (
        <span className="inline-flex items-center gap-1 text-atencao">
          <Icone nome="relogio" tamanho={14} />
          Desatualizado · última leitura às {hora}
        </span>
      )
    } else {
      frescor = (
        <span className="numeros inline-flex items-center gap-1 text-tinta-2">
          <Icone nome="relogio" tamanho={14} />
          Atualizado às {hora}
        </span>
      )
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
      <span className={`inline-flex items-center gap-1 ${origem.cor}`}>
        <Icone nome={origem.icone} tamanho={14} />
        {origem.texto}
      </span>
      {frescor}
      {ehAoVivo && erroApi && (
        <span className="inline-flex items-center gap-1 text-atencao">
          <Icone nome="alerta" tamanho={14} />
          API sem resposta agora
        </span>
      )}
    </div>
  )
}

export default SeloOrigem
