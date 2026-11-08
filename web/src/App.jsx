import TelaLogin from './components/TelaLogin.jsx'
import PaginaPainel from './pages/PaginaPainel.jsx'
import { CREDENCIAIS_DEMO } from './domain/sessao.js'
import { useSessaoDemo } from './hooks/useSessaoDemo.js'

// O App só decide qual tela mostrar: a entrada de demonstração ou o painel das salas.
const App = () => {
  const sessao = useSessaoDemo()

  if (!sessao.logado) {
    return <TelaLogin credenciaisDemo={CREDENCIAIS_DEMO} onEntrar={sessao.entrar} />
  }

  return <PaginaPainel matricula={sessao.matricula} onSair={sessao.sair} />
}

export default App
