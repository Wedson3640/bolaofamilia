export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[290px]">
      {/* Frame do celular */}
      <div className="relative rounded-[2.8rem] border-[6px] border-[#1a1a2e] bg-[#0d1117] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1a1a2e] rounded-b-2xl z-10" />

        {/* Tela do app */}
        <div className="bg-[#0d1117] text-white text-[11px] pt-8 pb-4 min-h-[520px] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-400 rounded-lg flex items-center justify-center text-[#050816] text-xs font-black">B</div>
              <div>
                <p className="font-black text-xs leading-tight">Bolão da Família</p>
                <p className="text-[9px] text-slate-400 leading-tight">Copa 2026</p>
              </div>
            </div>
            <div className="text-slate-400 text-base">🔔</div>
          </div>

          {/* Status chips */}
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="flex items-center gap-1 bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              Bolão ativo
            </span>
            <span className="flex items-center gap-1 bg-white/5 border border-white/10 text-slate-300 text-[9px] px-2 py-0.5 rounded-full">
              👥 24 participantes
            </span>
          </div>

          {/* Próximo jogo */}
          <div className="mx-3 rounded-2xl bg-white/[0.05] border border-white/10 p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-wide">Próximo jogo</span>
              <span className="text-[8px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded-full font-bold">Grupo D</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              {/* Brasil */}
              <div className="flex flex-col items-center gap-1 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/w40/br.png" alt="Brasil" className="w-9 h-6 rounded object-cover shadow" />
                <span className="font-black text-[9px]">Brasil</span>
              </div>

              {/* VS + data */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-black text-slate-400">X</span>
                <div className="text-center text-[8px] text-slate-400 leading-tight">
                  <div>19/06 • 21:30</div>
                </div>
              </div>

              {/* Haiti */}
              <div className="flex flex-col items-center gap-1 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/w40/ht.png" alt="Haiti" className="w-9 h-6 rounded object-cover shadow" />
                <span className="font-black text-[9px]">Haiti</span>
              </div>
            </div>
          </div>

          {/* Seu palpite */}
          <div className="mx-3 rounded-2xl bg-white/[0.05] border border-white/10 p-3 mb-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-wide mb-2">Seu palpite</p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] text-slate-400">Brasil</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-400/20 border-2 border-emerald-400/50 flex items-center justify-center font-black text-emerald-300 text-sm">2</div>
              </div>
              <span className="text-slate-500 font-black text-sm pb-1">X</span>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] text-slate-400">Haiti</span>
                <div className="w-8 h-8 rounded-xl bg-blue-400/10 border-2 border-blue-400/30 flex items-center justify-center font-black text-blue-300 text-sm">1</div>
              </div>
            </div>
            <button className="w-full mt-2 bg-emerald-400 text-[#050816] font-black text-[9px] py-1.5 rounded-xl">
              Confirmar palpite
            </button>
          </div>

          {/* Ranking */}
          <div className="mx-3 rounded-2xl bg-white/[0.05] border border-white/10 p-3 flex-1">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-wide mb-2">Ranking em tempo real</p>
            {[
              { pos: "🥇", nome: "Maria Silva",    pts: "38 pts" },
              { pos: "🥈", nome: "João Santos",    pts: "35 pts" },
              { pos: "🥉", nome: "Pedro Oliveira", pts: "32 pts" },
              { pos: "4°", nome: "Ana Paula",      pts: "28 pts" },
            ].map((p) => (
              <div key={p.nome} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px]">{p.pos}</span>
                  <span className="text-[9px] text-slate-300">{p.nome}</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-300">{p.pts}</span>
              </div>
            ))}
            <div className="mt-1.5 text-center text-[8px] text-emerald-400 font-bold border border-white/10 rounded-lg py-1">
              Ver ranking completo
            </div>
          </div>

          {/* Nav bar */}
          <div className="mt-2 mx-2 rounded-2xl bg-[#1a1a2e] border border-white/10 px-2 py-2 flex items-center justify-around">
            {[
              { icon: "⚽", label: "Jogos" },
              { icon: "📋", label: "Palpites" },
              { icon: "🏆", label: "Ranking" },
              { icon: "👥", label: "Participantes" },
              { icon: "⚙️", label: "Admin" },
            ].map((n) => (
              <div key={n.label} className="flex flex-col items-center gap-0.5">
                <span className="text-[10px]">{n.icon}</span>
                <span className="text-[7px] text-slate-400">{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reflexo/sombra embaixo */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-emerald-400/20 blur-xl rounded-full" />
    </div>
  );
}
