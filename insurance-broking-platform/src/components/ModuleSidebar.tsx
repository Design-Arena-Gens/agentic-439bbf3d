import type { ModuleDefinition, ModuleIdentifier } from "@/lib/modules";
import { cn } from "@/lib/utils";

interface ModuleSidebarProps {
  modules: ModuleDefinition[];
  active: ModuleIdentifier;
  onSelect: (id: ModuleIdentifier) => void;
  searchTerm: string;
  onSearch: (value: string) => void;
}

export function ModuleSidebar({
  modules,
  active,
  onSelect,
  searchTerm,
  onSearch,
}: ModuleSidebarProps) {
  return (
    <aside className="flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-night-950/70 p-6">
      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
          Natural Language Search
        </label>
        <div className="mt-3 rounded-xl bg-night-950/60 p-1.5">
          <input
            className="w-full rounded-lg border border-transparent bg-transparent px-4 py-3 text-sm text-surface-900 placeholder:text-slate-500 focus:border-brand-secondary focus:outline-none"
            placeholder="Ask anything, e.g. 'show renewal workflows'"
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pr-1">
        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-secondary/40 bg-brand-secondary/5 p-6 text-center text-xs text-brand-secondary">
            No modules match that phrase. Try searching for{" "}
            <span className="font-semibold">analytics</span>,{" "}
            <span className="font-semibold">claims</span>, or{" "}
            <span className="font-semibold">compliance</span>.
          </div>
        ) : (
          <ul className="grid gap-2">
            {modules.map((module) => (
              <li key={module.id}>
                <button
                  onClick={() => onSelect(module.id)}
                  className={cn(
                    "group w-full rounded-2xl border border-white/10 bg-night-950/50 p-4 text-left transition-all duration-200 hover:border-brand-secondary/60 hover:bg-night-950/80",
                    active === module.id && "border-brand-primary/70 bg-night-950/90"
                  )}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-secondary">
                    <span>{module.category}</span>
                    <span className="rounded-full border border-brand-secondary/40 px-2 py-0.5 text-[10px] font-semibold text-brand-secondary/70">
                      {module.icon.toUpperCase()}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      "mt-3 text-lg font-semibold text-surface-900 group-hover:text-white",
                      active === module.id && "text-white"
                    )}
                  >
                    {module.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 group-hover:text-slate-400">
                    {module.tagline}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="rounded-2xl border border-brand-secondary/40 bg-night-950/60 p-4 text-xs text-slate-500">
        <p className="text-[11px] uppercase tracking-[0.4em] text-brand-secondary">
          AI Guidance
        </p>
        <p className="mt-3">
          Results respond instantly to conversational queries. Try{" "}
          <strong className="text-surface-900">
            find modules with predictive analytics
          </strong>
          .
        </p>
      </div>
    </aside>
  );
}
