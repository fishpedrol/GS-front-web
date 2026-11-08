// O rodapé conta, sem letra miúda escondida, o que é simulado e o que é fictício.
const Rodape = () => (
  <footer className="border-t border-regua">
    <div className="mx-auto max-w-[90rem] px-4 py-6 text-sm text-tinta-3 sm:px-6">
      <p className="max-w-[75ch]">
        Protótipo acadêmico da Global Solution FIAP 2026.2. A sala S01 recebe as leituras de um ESP32{' '}
        <strong className="font-medium text-tinta-2">simulado</strong> no Wokwi; o ruído vem de um potenciômetro (dB
        simulados) e a luz é estimada. As salas S02 a S09 têm{' '}
        <strong className="font-medium text-tinta-2">dados fictícios</strong> fixos. Nada aqui é medição real de uma
        sala, e o painel não reserva lugares.
      </p>
    </div>
  </footer>
)

export default Rodape
