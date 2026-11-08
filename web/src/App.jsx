// Página provisória da fatia W1: só prova que React + Vite + Tailwind estão funcionando.
// O painel de verdade (login fictício e os nove cards) entra na próxima etapa.
function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Global Solution 2026.2 · CitizenTech
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Salas de Estudo</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          Em construção. Aqui o estudante vai ver as nove salas, com a ocupação de cada mesa,
          a temperatura, a luz e o ruído, e escolher a melhor para estudar sozinho, em grupo
          ou gravar um vídeo.
        </p>
      </div>
    </main>
  )
}

export default App
