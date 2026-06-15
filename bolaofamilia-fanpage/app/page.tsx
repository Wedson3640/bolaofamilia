import Image from "next/image";
import {
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  UsersRound,
  WalletCards,
} from "lucide-react";

const domain = "bolaofamilia.online";

const resources = [
  ["Setup em menos de 5 min", "✅", "❌"],
  ["PIX integrado", "✅", "❌"],
  ["Tabela em tempo real", "✅", "❌"],
  ["Mobile first", "✅", "Parcial"],
  ["Sem app para baixar", "✅", "❌"],
  ["Taxa admin personalizável", "✅", "❌"],
];

const steps = [
  {
    icon: CircleDollarSign,
    title: "Pague R$ 49,90",
    description:
      "Tenha acesso à plataforma para organizar seu bolão familiar durante todos os jogos da Copa.",
  },
  {
    icon: Trophy,
    title: "Configure seu bolão",
    description:
      "Escolha o nome, valor de participação, pontuação, porcentagem administrativa e regras gerais.",
  },
  {
    icon: WalletCards,
    title: "Cadastre seu PIX",
    description:
      "Configure a chave PIX para receber os pagamentos dos participantes do seu grupo.",
  },
  {
    icon: MessageCircle,
    title: "Compartilhe no WhatsApp",
    description:
      "Envie o link nos grupos da família, amigos ou empresa e acompanhe tudo pelo painel admin.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <Header />

      <section className="hero-grid relative border-b border-white/10">
        <div className="absolute left-[-160px] top-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-[120px]" />
        <div className="absolute right-[-160px] top-24 h-[520px] w-[520px] rounded-full bg-lime-400/20 blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-emerald-300">
              <Sparkles size={16} /> Copa 2026 • Bolão familiar online
            </div>

            <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Crie seu bolão da família em minutos e compartilhe no WhatsApp
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              Configure seu bolão online, receba via PIX, acompanhe a tabela em
              tempo real e transforme cada jogo da Copa em uma disputa divertida
              entre familiares e amigos.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-8 py-4 text-lg font-black text-[#050816] shadow-glow transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                Criar agora 🚀
                <ChevronRight size={22} />
              </a>

              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
              >
                Ver como funciona
              </a>
            </div>

            <div className="mt-9 grid gap-3 text-sm font-semibold text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              <MiniItem icon={Smartphone} text="Sem app para baixar" />
              <MiniItem icon={Clock3} text="Setup em 5 minutos" />
              <MiniItem icon={MessageCircle} text="Compartilhe no WhatsApp" />
              <MiniItem icon={ShieldCheck} text="Admin com senha" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[3rem] bg-emerald-400/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
              <Image
                src="/images/fanpage-bolao.png"
                alt="Preview da fanpage do Bolão Família Online"
                width={1024}
                height={1536}
                priority
                className="h-auto w-full rounded-[1.5rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-20">
        <SectionTitle
          eyebrow="Como funciona"
          title="Seu bolão pronto em poucos passos"
          description="Tudo foi pensado para celular: configurar, compartilhar, receber e acompanhar os palpites sem complicação."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.06]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-[#050816]">
                  <step.icon size={28} />
                </div>
                <span className="text-4xl font-black text-white/10">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-xl font-black">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Vantagem competitiva
            </p>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Por que {domain}?
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Uma fanpage direta para conversão: mostra preço, benefícios,
              funcionamento, diferencial contra concorrentes e chamada forte para
              cadastro.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1024] shadow-2xl">
            <table className="w-full text-left text-sm md:text-base">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Recurso</th>
                  <th className="p-4 text-emerald-300">{domain}</th>
                  <th className="p-4 text-slate-400">Concorrentes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {resources.map(([feature, current, competitor]) => (
                  <tr key={feature}>
                    <td className="p-4 font-semibold">{feature}</td>
                    <td className="p-4 font-black">{current}</td>
                    <td className="p-4 text-slate-400">{competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={UsersRound}
            title="Feito para família"
            description="Ideal para grupos de WhatsApp, família, amigos, empresa, escola, igreja ou turma do futebol."
          />
          <FeatureCard
            icon={LockKeyhole}
            title="Admin protegido"
            description="O criador define senha para acessar painel administrativo, conferir participantes e controlar regras."
          />
          <FeatureCard
            icon={Trophy}
            title="Ranking em tempo real"
            description="A cada resultado, os participantes acompanham a classificação e a disputa fica mais divertida."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-emerald-400/30 bg-gradient-to-br from-emerald-400 to-lime-300 p-8 text-[#050816] shadow-glow md:p-14">
          <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-white/30 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Pronto para criar seu bolão?
              </h2>
              <p className="mt-4 max-w-2xl text-lg font-semibold leading-8">
                Configure em minutos, compartilhe o link e torça junto com sua
                família durante toda a Copa.
              </p>
              <p className="mt-3 text-sm font-black uppercase tracking-wide">
                Acesso único por R$ 49,90
              </p>
            </div>

            <a
              href="/cadastro"
              className="inline-flex items-center justify-center rounded-full bg-[#050816] px-9 py-5 text-lg font-black text-white transition hover:scale-[1.02]"
            >
              Criar agora 🚀
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-500">
        © 2026 {domain} — plataforma para organização de bolão familiar online.
      </footer>
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#050816]">
            <Trophy size={24} />
          </div>
          <span className="text-xl font-black tracking-tight md:text-2xl">
            Bolão Família<span className="text-emerald-400">.online</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-bold text-slate-300 md:flex">
          <a className="hover:text-white" href="#como-funciona">
            Como funciona
          </a>
          <a className="hover:text-white" href="#vantagens">
            Vantagens
          </a>
        </nav>

        <a
          href="/cadastro"
          className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-black text-[#050816] transition hover:bg-emerald-300"
        >
          Criar agora 🚀
        </a>
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
      <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-slate-300">{description}</p>
    </div>
  );
}

function MiniItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <Icon size={18} className="text-emerald-300" />
      <span>{text}</span>
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
    <div className="rounded-[2rem] border border-white/10 bg-[#0b1024] p-7 transition hover:-translate-y-1 hover:border-emerald-400/40">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{description}</p>
    </div>
  );
}
