import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";

const principles = [
  {
    num: "01",
    title: "Consolidar",
    body: "Junta o que está espalhado em várias plataformas e deixa visível o que importa em um único lugar.",
  },
  {
    num: "02",
    title: "Traduzir",
    body: "Explica o que os números dizem, no seu contexto e no seu tempo, sem jargão bancário.",
  },
  {
    num: "03",
    title: "Orientar",
    body: "Indica um próximo passo claro por rodada, sem executar ordens e sem prometer retorno.",
  },
] as const;

const marqueeItems = [
  ["01", "Consolidar — tudo num lugar só"],
  ["02", "Traduzir — dados em linguagem humana"],
  ["03", "Orientar — uma ação por vez"],
  ["Regra", "O Esquilo não executa ordens, não promete retorno"],
  ["04", "Score — entenda sua maturidade financeira"],
  ["05", "Contexto — sua realidade, não média de mercado"],
  ["Foco", "Primeiro muito bom no básico — depois mais inteligente"],
] as const;

const trustCards = [
  {
    icon: "🔒",
    title: "Seus dados ficam com você",
    body: "O Esquilo não armazena PDFs nem acessa sua conta nas corretoras. Você importa, revisa e decide.",
  },
  {
    icon: "🎯",
    title: "Uma ação principal por vez",
    body: "Sem sobrecarga de recomendações. A clareza vem de prioridade, não de volume de informação.",
  },
  {
    icon: "📊",
    title: "Sem conflito de interesse",
    body: "Não vendemos produto financeiro, não somos corretora. O objetivo é a sua leitura, não a nossa comissão.",
  },
] as const;

const stats = [
  { value: "23+", label: "Plataformas suportadas" },
  { value: "1 passo", label: "Ação principal por rodada" },
  { value: "0%", label: "De ordem executada" },
  { value: "∞", label: "Clareza sem limite" },
] as const;

export function SplashPage() {
  React.useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.dataset.visible = "true");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -48px 0px",
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-dvh bg-bg-secondary text-text-primary landing-shell">
      <style>{landingCss}</style>

      <nav className="landing-nav fixed inset-x-0 top-0 z-50 h-16 border-b border-border-default/90 px-5 md:px-12 lg:px-20">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-4">
          <Link to="/" className="flex flex-1 items-center gap-3 no-underline">
            <Logo kind="simbolo" className="h-9 w-9 shrink-0" title="Esquilo Invest" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-[18px] font-extrabold tracking-[-0.5px] text-text-primary">
                Esquilo
              </span>
              <span className="font-display mt-0.5 text-[10px] font-normal uppercase tracking-[3px] text-brand-primary">
                Invest
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="inline-flex items-center rounded-[6px] border border-border-default bg-bg-surface px-5 py-2.5 text-[13px] font-semibold text-text-primary transition hover:border-brand-primary hover:bg-[#fde8dc] hover:text-brand-primary"
            >
              Criar conta
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 rounded-[6px] bg-brand-primary px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c94e15] hover:shadow-[0_6px_20px_rgba(245,106,42,0.28)]"
            >
              Entrar
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative flex min-h-svh flex-col justify-center overflow-hidden px-5 pb-16 pt-24 md:px-12 md:pb-20 lg:px-20">
          <div className="landing-orb-right" aria-hidden />
          <div className="landing-orb-left" aria-hidden />

          <div className="mx-auto w-full max-w-7xl">
            <p className="ty-label mb-5 uppercase tracking-[2.5px] text-brand-primary landing-fade-up">
              O tradutor da vida financeira aplicada
            </p>

            <h1 className="landing-hero-title landing-fade-up-delay-1 max-w-5xl font-display text-text-primary">
              Você não precisa
              <br />
              de mais dados.
              <br />
              Precisa de <span className="text-brand-primary">clareza.</span>
            </h1>

            <p className="ty-body-lg landing-fade-up-delay-2 mb-10 mt-6 max-w-[420px] text-text-secondary md:text-[17px]">
              O Esquilo organiza sua carteira, traduz o que os números dizem e aponta o próximo passo, sem economês e sem prometer mágica.
            </p>

            <div className="landing-fade-up-delay-3 mb-14 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-7 py-3.5 text-[15px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c94e15] hover:shadow-[0_8px_24px_rgba(245,106,42,0.28)]"
              >
                Entrar agora
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center rounded-lg border border-border-default bg-bg-surface px-6 py-3 text-[15px] font-semibold text-text-primary transition hover:border-brand-primary hover:bg-[#fde8dc] hover:text-brand-primary"
              >
                Criar conta grátis
              </Link>
              <p className="w-full text-[11px] text-text-disabled">
                O Esquilo orienta. Você decide.
              </p>
            </div>

            <div className="landing-fade-up-delay-4 flex items-center gap-2" aria-hidden>
              <div className="h-px w-8 bg-text-disabled" />
              <span className="text-[11px] uppercase tracking-[1px] text-text-disabled">Scroll</span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-t-[3px] border-brand-primary bg-bg-inverse">
          <div className="landing-marquee-track flex w-max">
            {[0, 1].map((copy) => (
              <div className="flex" key={copy}>
                {marqueeItems.map(([label, desc]) => (
                  <div
                    key={`${copy}-${label}-${desc}`}
                    className="flex items-center gap-4 whitespace-nowrap border-r border-white/10 px-9 py-5 hover:bg-white/5"
                  >
                    <span className="landing-marquee-dot h-1 w-1 rounded-full bg-brand-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-[2px] text-brand-primary">
                      {label}
                    </span>
                    <span className="font-display text-sm font-semibold tracking-[-0.2px] text-white/85">
                      {desc}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-14 md:px-12 md:py-20 lg:px-20">
          <div className="mx-auto w-full max-w-7xl">
            <SectionLabel>Como funciona</SectionLabel>

            <div className="grid gap-3 lg:grid-cols-3">
              {principles.map((item, index) => (
                <article
                  key={item.title}
                  data-reveal
                  className="landing-card group relative overflow-hidden rounded-[12px] border border-border-default bg-white px-6 py-7 shadow-[0_1px_0_rgba(11,18,24,0.02)]"
                  style={{ transitionDelay: `${index * 0.08}s` }}
                >
                  <span className="mb-3 block font-display text-xs font-extrabold tracking-[1px] text-brand-primary">
                    {item.num}
                  </span>
                  <h2 className="font-display mb-2 text-[20px] font-bold tracking-[-0.4px] text-text-primary">
                    {item.title}
                  </h2>
                  <p className="ty-body text-text-secondary">{item.body}</p>
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg text-border-default transition group-hover:translate-x-1 group-hover:text-brand-primary">
                    →
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 md:px-12 lg:px-20">
          <div
            data-reveal
            className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-7 overflow-hidden rounded-[12px] bg-bg-inverse px-7 py-8 text-white md:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display mb-1 text-[28px] font-extrabold leading-none tracking-[-1px] text-white">
                  {stat.value}
                </div>
                <div className="text-[11px] font-medium uppercase tracking-[0.5px] text-white/45">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-12 md:px-12 md:py-16 lg:px-20">
          <div className="mx-auto w-full max-w-7xl">
            <SectionLabel>Sem promessa, sem enrolação</SectionLabel>

            <div className="grid gap-3 md:grid-cols-3">
              {trustCards.map((card, index) => (
                <article
                  key={card.title}
                  data-reveal
                  className="rounded-[12px] border border-border-default bg-white p-6"
                  style={{ transitionDelay: `${index * 0.08}s` }}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#fde8dc] text-lg">
                    <span aria-hidden>{card.icon}</span>
                  </div>
                  <h3 className="font-display mb-2 text-[15px] font-bold text-text-primary">
                    {card.title}
                  </h3>
                  <p className="text-[13px] leading-[1.55] text-text-secondary">{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-12 md:px-12 md:pb-16 lg:px-20">
          <div
            data-reveal
            className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[12px] bg-brand-primary px-8 py-10 text-center md:px-12 md:py-12"
          >
            <div className="landing-cta-orb-right" aria-hidden />
            <div className="landing-cta-orb-left" aria-hidden />

            <h2 className="font-display relative z-[1] mb-3 text-[30px] font-extrabold leading-[1.15] tracking-[-0.8px] text-white">
              Comece a entender
              <br />
              sua carteira hoje.
            </h2>
            <p className="relative z-[1] mb-7 text-sm leading-[1.55] text-white/80">
              Gratuito para começar. Sem economês.
              <br />
              Sem promessa de retorno.
            </p>
            <Link
              to="/register"
              className="relative z-[1] inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-brand-primary transition hover:-translate-y-0.5 hover:bg-bg-secondary hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
            >
              Criar conta grátis
              <span aria-hidden>→</span>
            </Link>
            <p className="relative z-[1] mt-4 text-[11px] text-white/55">
              O Esquilo orienta. Você decide.
            </p>
          </div>
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default px-5 py-6 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <Logo kind="simbolo" className="h-6 w-6" title="Esquilo Invest" />
          <span className="font-display text-sm font-bold text-text-primary">Esquilo Invest</span>
        </div>
        <p className="text-[11px] text-text-disabled">
          © 2026 Esquilo Invest · O Esquilo orienta. Você decide.
        </p>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p data-reveal className="mb-9 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[2.5px] text-brand-primary">
      <span className="block h-[2px] w-6 bg-brand-primary" aria-hidden />
      {children}
    </p>
  );
}

const landingCss = `
  .landing-shell {
    overflow-x: hidden;
  }

  .landing-nav {
    background: rgba(245, 240, 235, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .landing-orb-right,
  .landing-orb-left,
  .landing-cta-orb-right,
  .landing-cta-orb-left {
    position: absolute;
    border-radius: 9999px;
    pointer-events: none;
  }

  .landing-orb-right {
    top: -120px;
    right: -120px;
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(245, 106, 42, 0.10) 0%, transparent 70%);
  }

  .landing-orb-left {
    left: -80px;
    bottom: -80px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(67, 199, 207, 0.08) 0%, transparent 70%);
  }

  .landing-cta-orb-right {
    top: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    background: rgba(255,255,255,0.08);
  }

  .landing-cta-orb-left {
    left: -40px;
    bottom: -40px;
    width: 140px;
    height: 140px;
    background: rgba(0,0,0,0.06);
  }

  .landing-hero-title {
    font-size: clamp(36px, 9vw, 80px);
    line-height: 1;
    letter-spacing: -2px;
  }

  .landing-fade-up,
  .landing-fade-up-delay-1,
  .landing-fade-up-delay-2,
  .landing-fade-up-delay-3,
  .landing-fade-up-delay-4 {
    opacity: 0;
    transform: translateY(14px);
    animation: landingFadeUp 0.55s ease forwards;
  }

  .landing-fade-up-delay-1 { animation-delay: 0.12s; }
  .landing-fade-up-delay-2 { animation-delay: 0.24s; }
  .landing-fade-up-delay-3 { animation-delay: 0.34s; }
  .landing-fade-up-delay-4 { animation-delay: 0.5s; }

  .landing-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 4px 0 0 4px;
    background: var(--brand-primary);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.3s ease;
  }

  .landing-card:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 32px rgba(11, 18, 24, 0.08);
    border-color: rgba(245, 106, 42, 0.2);
  }

  .landing-card:hover::before {
    transform: scaleY(1);
  }

  .landing-marquee-track {
    animation: landingMarquee 32s linear infinite;
  }

  .landing-marquee-track:hover {
    animation-play-state: paused;
  }

  .landing-marquee-dot {
    animation: landingPulse 2.5s ease infinite;
  }

  [data-reveal] {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }

  [data-reveal][data-visible="true"] {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes landingFadeUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes landingMarquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @keyframes landingPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.7);
    }
  }
`;