// Lê a configuração do ambiente (as variáveis VITE_ do .env.local) num formato só.
// Recebe o objeto de ambiente como parâmetro para poder ser testada sem o Vite.

export const MODOS_TELEMETRIA = ['mock', 'supabase']

// As chaves secretas do Supabase dão acesso de administrador e nunca podem ir para o navegador.
// As novas começam com "sb_secret_"; as antigas são um JWT com "service_role" dentro.
export function ehChaveSecreta(chave) {
  if (!chave) return false
  if (chave.startsWith('sb_secret_')) return true
  const partes = chave.split('.')
  if (partes.length !== 3) return false
  try {
    const payload = JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.role === 'service_role'
  } catch {
    return false
  }
}

export function lerConfiguracao(ambiente = {}) {
  const modoPedido = (ambiente.VITE_TELEMETRIA_MODO || 'mock').trim().toLowerCase()
  const supabaseUrl = (ambiente.VITE_SUPABASE_URL || '').trim()
  const supabaseChave = (ambiente.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()

  if (!MODOS_TELEMETRIA.includes(modoPedido)) {
    return { modoTelemetria: 'mock', supabaseUrl: '', supabaseChave: '',
      aviso: `Modo de telemetria desconhecido ("${modoPedido}"); usando o mock.` }
  }

  if (modoPedido === 'supabase') {
    if (ehChaveSecreta(supabaseChave)) {
      return { modoTelemetria: 'mock', supabaseUrl: '', supabaseChave: '',
        aviso: 'A chave do Supabase é SECRETA e não pode ficar no navegador. Use a chave publicável.' }
    }
    if (!supabaseUrl || !supabaseChave) {
      return { modoTelemetria: 'mock', supabaseUrl: '', supabaseChave: '',
        aviso: 'Faltam VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY; usando o mock.' }
    }
    return { modoTelemetria: 'supabase', supabaseUrl, supabaseChave, aviso: null }
  }

  return { modoTelemetria: 'mock', supabaseUrl: '', supabaseChave: '', aviso: null }
}
