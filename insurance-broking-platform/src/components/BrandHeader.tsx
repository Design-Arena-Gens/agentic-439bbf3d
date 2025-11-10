import Image from "next/image";

interface BrandHeaderProps {
  onOpenNoCodeStudio: () => void;
}

export function BrandHeader({ onOpenNoCodeStudio }: BrandHeaderProps) {
  return (
    <header className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-surface-100/80 via-surface-50/90 to-brand-secondary/20 p-8 text-foreground shadow-[0_35px_120px_-45px_rgba(44,95,246,0.45)]">
      <div className="flex items-start justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-night-950/90 p-3 ring-2 ring-brand-primary/70 ring-offset-2 ring-offset-night-950">
            <Image src="/logo.svg" alt="AtriSure Nexus logo" width={64} height={64} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-secondary">
              Insurance Broking Operating System
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-surface-900">
              AtriSure Nexus
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              An integrated platform uniting policy, claims, finance, and ecosystem
              workflows under a no-code, AI-supercharged workspace tailor-made for
              intermediaries.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenNoCodeStudio}
          className="group inline-flex h-12 items-center gap-3 rounded-full border border-brand-secondary/40 bg-night-950/50 px-6 text-sm font-medium text-surface-900 shadow-[0_15px_35px_-20px_rgba(26,198,209,0.8)] transition-colors hover:border-brand-secondary/60 hover:bg-night-950/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary/20 text-brand-secondary group-hover:bg-brand-secondary/30">
            NC
          </span>
          Launch No-Code Studio
        </button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-night-950/70 p-6 md:grid-cols-3">
        <BrandStat
          label="Visual Orchestration"
          value="Drag-and-drop layouts, workflows, and KPIs without code."
        />
        <BrandStat
          label="AI Copilots Everywhere"
          value="Smart intake, natural language search, document intelligence, and guided conversations."
        />
        <BrandStat
          label="Enterprise-Ready"
          value="Security-first, compliance tracking, and carrier connectivity baked in."
        />
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-night-950/70 p-5 md:grid-cols-4">
        <DesignLanguageChip name="AtriSure Blue" hex="#2C5FF6" usage="Primary Buttons" />
        <DesignLanguageChip name="Neon Aqueous" hex="#1AC6D1" usage="Accents & Highlights" />
        <DesignLanguageChip name="Solar Amber" hex="#FFB454" usage="Alerts & Actions" />
        <DesignLanguageChip name="Nightfall" hex="#090B16" usage="Surfaces & Depth" />
      </div>
    </header>
  );
}

function BrandStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 rounded-xl border border-white/5 bg-surface-100/20 p-5 backdrop-blur">
      <div className="mt-1 h-10 w-0.5 rounded-full bg-gradient-to-b from-brand-primary via-brand-secondary to-brand-accent" />
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-secondary">
          {label}
        </h2>
        <p className="mt-3 text-xs text-slate-500">{value}</p>
      </div>
    </div>
  );
}

function DesignLanguageChip({
  name,
  hex,
  usage,
}: {
  name: string;
  hex: string;
  usage: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div
        className="h-10 w-10 rounded-xl border border-white/20"
        style={{ background: hex }}
        aria-hidden
      />
      <div className="text-xs text-slate-500">
        <p className="text-surface-900">{name}</p>
        <p>{hex}</p>
        <p className="text-[11px] uppercase tracking-[0.3em] text-brand-secondary">{usage}</p>
      </div>
    </div>
  );
}
