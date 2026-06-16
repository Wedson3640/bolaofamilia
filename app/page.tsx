import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  CircleDollarSign,
  LockKeyhole,
  MessageCircle,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { PhoneMockup } from "./components/PhoneMockup";
import { CriarAgoraButton } from "./components/CriarAgoraButton";

const domain = "bolaofamilia.online";

const resources = [
  ["Setup em menos de 5 min",   "✅", "❌"],
  ["Ranking em tempo real",     "✅", "❌"],
  ["Mobile first",              "✅", "Parcial"],
  ["Sem app para baixar",       "✅", "❌"],
  ["Compartilha no WhatsApp",   "✅", "Parcial"],
  ["Área admin protegida",      "✅", "Parcial"],
];

const steps = [
  {
    icon: CircleDollarSign,
    title: "Pague R$ 49,90",
    description: "Libere o acesso à plataforma com todos os jogos da Copa até a final.",
  },
  {
    icon: Settings,
    title: "Configure seu bolão",
    description: "Defina nome, regras, valor da premiação e pontuação do seu grupo.",
  },
  {
    icon: WalletCards,
    title: "Defina regras e PIX",
    description: "Escolha a porcentagem administrativa e cadastre sua chave PIX.",
  },
  {
    icon: MessageCircle,
    title: "Compartilhe no WhatsApp",
    description: "Envie o link nos grupos da família e comece a diversão!",
  },
];

const footerFeatures = [
  { icon: "🛡️", label: "Ambiente seguro" },
  { icon: "💬", label: "Suporte humano" },
  { icon: "⚡", label: "Tempo real" },
  { icon: "🚀", label: "Plataforma leve" },
  { icon: "👨‍👩‍👧‍👦", label: "Para famílias" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <Header />

      {/* ── HERO ── */}
      <section className="hero-grid relative border-b border-white/10 overflow-hidden">
        {/* Fundo estádio */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-estadio.jpg"
            alt="Estádio"
            fill
            priority
            className="object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050816] via-[#050816]/80 to-[#050816]/40" />
        </div>

        {/* Brilhos */}
        <div className="absolute left-[-160px] top-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-[120px] z-0" />
        <div className="absolute right-[-100px] top-24 h-[400px] w-[400px] rounded-full bg-lime-400/10 blur-[140px] z-0" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24 md:px-5">

          {/* ── Texto ── */}
          <div>
            <div className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-emerald-300 md:px-4 md:py-2 md:text-sm">
              <Sparkles size={14} /> Copa 2026 • Bolão Familiar Online
            </div>

            <h1 className="text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
              Crie seu bolão da família em minutos e compartilhe no{" "}
              <span className="text-emerald-400">WhatsApp</span>
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-300 md:mt-6 md:text-xl md:leading-8">
              Organize os palpites dos jogos da Copa, acompanhe o ranking em tempo real e torça junto com sua família.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-9 md:gap-4">
              <CriarAgoraButton className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-base font-black text-[#050816] shadow-glow transition hover:-translate-y-0.5 hover:bg-emerald-300 md:px-8 md:py-4 md:text-lg">
                Criar agora 🚀 <ChevronRight size={20} />
              </CriarAgoraButton>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/10 md:px-8 md:py-4 md:text-lg"
              >
                <span className="text-emerald-400">▶</span> Como funciona
              </a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-sm font-semibold text-slate-300 md:mt-9 md:gap-3 lg:grid-cols-4">
              <MiniItem icon={Smartphone}    text="Sem app" />
              <MiniItem icon={Smartphone}    text="100% mobile" />
              <MiniItem icon={MessageCircle} text="WhatsApp" />
              <MiniItem icon={ShieldCheck}   text="Seguro" />
            </div>
          </div>

          {/* ── Celular + Taça ── */}
          <div className="relative flex items-center justify-center py-4 md:py-0">
            {/* Taça — oculta no mobile pequeno */}
            <div className="absolute right-0 top-0 hidden w-36 opacity-75 pointer-events-none select-none sm:block md:w-44 lg:w-56">
              <Image
                src="/images/taca-copa.jpg"
                alt="Taça Copa do Mundo"
                width={224}
                height={320}
                className="object-contain drop-shadow-2xl w-full h-auto"
                unoptimized
              />
            </div>
            {/* Phone mockup */}
            <div className="relative z-10 scale-90 sm:scale-100">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-12 md:px-5 md:py-20">
        <SectionTitle
          eyebrow="Como funciona"
          title="Seu bolão pronto em poucos passos"
          description="Em 4 passos simples você cria seu bolão e compartilha com a família"
        />

        <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-12 md:gap-5">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.06]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#050816]">
                  <step.icon size={22} />
                </div>
                <span className="text-3xl font-black text-white/10">0{index + 1}</span>
              </div>
              {/* Seta entre steps (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 text-emerald-400/50 font-black text-lg z-10">→</div>
              )}
              <h3 className="text-base font-black md:text-lg">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VANTAGENS ── */}
      <section id="vantagens" className="relative border-y border-white/10 overflow-hidden">
        {/* Fundo de grama */}
        <div className="absolute inset-0 z-0">
          <Image src="/images/grama.png" alt="" fill className="object-cover object-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050816]/95 via-[#050816]/80 to-[#050816]/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-5 md:py-20">
          <SectionTitle
            eyebrow="Vantagem competitiva"
            title={`Por que ${domain}?`}
            description="Tudo que você precisa para organizar seu bolão de forma simples e profissional"
          />

          {/* Cards de imagem */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10">
            {/* Família */}
            <div className="group relative h-44 overflow-hidden rounded-3xl border border-white/10 shadow-xl sm:h-52">
              <Image
                src="/images/familia.png"
                alt="Família assistindo futebol"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover object-center transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-base font-black leading-tight">👨‍👩‍👧‍👦 Para sua família</p>
                <p className="text-xs text-slate-300 mt-0.5">Diversão garantida para todos</p>
              </div>
            </div>

            {/* Taça */}
            <div className="group relative h-44 overflow-hidden rounded-3xl border border-emerald-400/20 shadow-xl bg-[#0b1a10] sm:h-52">
              <Image
                src="/images/taça.png"
                alt="Taça Copa do Mundo"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain object-center p-4 transition duration-500 group-hover:scale-105 drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-base font-black leading-tight">🏆 Copa do Mundo 2026</p>
                <p className="text-xs text-slate-300 mt-0.5">Acompanhe todos os jogos</p>
              </div>
            </div>
          </div>

          {/* Tabela — scroll horizontal no mobile */}
          <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10 shadow-2xl md:mt-8">
            <div className="min-w-[340px] overflow-hidden rounded-3xl bg-[#0b1024]/90 backdrop-blur">
              <div className="border-b border-white/10 p-4 text-center">
                <p className="text-sm font-black md:text-base">
                  Por que <span className="text-emerald-400">{domain}</span> é diferente?
                </p>
              </div>
              <table className="w-full text-xs md:text-sm">
                <thead className="border-b border-white/10 bg-emerald-400/10">
                  <tr>
                    <th className="p-3 text-left font-semibold text-slate-300">Recurso</th>
                    <th className="p-3 text-center font-black text-emerald-300">{domain}</th>
                    <th className="p-3 text-center font-semibold text-slate-500">Outros</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {resources.map(([feature, current, competitor]) => (
                    <tr key={feature} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-slate-300">{feature}</td>
                      <td className="p-3 text-center font-black text-emerald-400">{current}</td>
                      <td className="p-3 text-center text-slate-500">{competitor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-5 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
          <FeatureCard
            icon={UsersRound}
            title="Para família e amigos"
            description="Ideal para grupos de WhatsApp, família, empresa, escola, igreja ou turma do futebol."
          />
          <FeatureCard
            icon={LockKeyhole}
            title="Admin protegido"
            description="O criador gerencia participantes, confirma pagamentos e controla o bolão pelo painel."
          />
          <FeatureCard
            icon={Trophy}
            title="Ranking em tempo real"
            description="Apostas aparecem na hora. Todos acompanham quem apostou e quem já pagou."
          />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-5 md:pb-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-[#0b2e1a] via-[#0f3d20] to-[#0b2e1a] p-6 md:p-14">
          <div className="absolute right-[-60px] top-[-60px] h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute left-4 bottom-3 text-4xl opacity-20 select-none">⚽</div>
          <div className="absolute left-12 top-4 text-3xl opacity-25 select-none">🏆</div>

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between font-[family-name:var(--font-open-sans)]">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-5xl">
                Pronto para criar seu bolão?
              </h2>
              <p className="mt-4 text-3xl font-black leading-tight text-emerald-300 sm:text-4xl md:text-5xl">
                Tenha acesso a mais de<br />
                <span className="text-white">100 jogos da Copa</span>
              </p>
              <p className="mt-3 text-base font-semibold text-emerald-100/80 md:text-lg">
                para fazer seu bolão por{" "}
                <strong className="text-emerald-400">R$ 49,90</strong>
              </p>
            </div>
            <CriarAgoraButton className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-8 py-4 text-lg font-black text-[#050816] shadow-glow transition hover:scale-[1.03] hover:bg-emerald-300 sm:w-auto md:px-9 md:py-5">
              Criar agora 🚀
            </CriarAgoraButton>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-5">
          <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {footerFeatures.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-xl">{f.icon}</span>
                <span className="text-[11px] leading-tight text-slate-400">{f.label}</span>
              </div>
            ))}
          </div>
          <p className="border-t border-white/5 pt-4 text-center text-xs text-slate-600">
            © 2026 {domain} — plataforma para organização de bolões online.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ── Componentes ── */

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-5 md:py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-[#050816] md:h-11 md:w-11 md:rounded-2xl">
            <Trophy size={20} className="md:hidden" />
            <Trophy size={24} className="hidden md:block" />
          </div>
          <span className="text-lg font-black tracking-tight md:text-2xl">
            bolaofamilia<span className="text-emerald-400">.online</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-300 md:flex">
          <a className="transition-colors hover:text-white" href="#como-funciona">Como funciona</a>
          <a className="transition-colors hover:text-white" href="#vantagens">Vantagens</a>
        </nav>

        <CriarAgoraButton className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-black text-[#050816] transition hover:bg-emerald-300 md:px-5 md:py-2.5 md:text-sm">
          Criar agora 🚀
        </CriarAgoraButton>
      </div>
    </header>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-300 md:mb-3 md:text-sm md:tracking-[0.25em]">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-300 md:mt-4 md:text-lg md:leading-8">{description}</p>
    </div>
  );
}

function MiniItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-2 md:gap-2 md:px-3 md:py-2.5">
      <Icon size={14} className="shrink-0 text-emerald-300 md:hidden" />
      <Icon size={16} className="hidden shrink-0 text-emerald-300 md:block" />
      <span className="text-[11px] md:text-xs">{text}</span>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1024] p-5 transition hover:-translate-y-1 hover:border-emerald-400/40 md:p-7">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 md:mb-6 md:h-14 md:w-14">
        <Icon size={24} className="md:hidden" />
        <Icon size={28} className="hidden md:block" />
      </div>
      <h3 className="text-lg font-black md:text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300 md:mt-3 md:leading-7">{description}</p>
    </div>
  );
}
