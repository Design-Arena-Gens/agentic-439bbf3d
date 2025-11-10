"use client";

import { useMemo, useState } from "react";
import type { ModuleDefinition } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { Sparkles, Wand2, RefreshCcw, Bot, Upload } from "lucide-react";
import Papa from "papaparse";

interface ModuleWorkspaceProps {
  module: ModuleDefinition;
  onOpenNoCodeStudio: () => void;
}

type Prospect = {
  id: string;
  name: string;
  email: string;
  premium: number;
  status: "New" | "Engaged" | "Won" | "Lost";
};

const initialProspects: Prospect[] = [
  { id: "CL-1001", name: "Arcadia Logistics", email: "risk@arcadialogistics.com", premium: 85000, status: "Engaged" },
  { id: "CL-1002", name: "Harbor Retail Group", email: "procurement@harborretail.com", premium: 61000, status: "New" },
  { id: "CL-1003", name: "Northwind Construction", email: "riskdesk@northwind.com", premium: 129500, status: "Won" },
  { id: "CL-1004", name: "Velocity Health", email: "broker@velocityhealth.io", premium: 94500, status: "Engaged" },
];

const statuses: Prospect["status"][] = ["New", "Engaged", "Won", "Lost"];

export function ModuleWorkspace({
  module,
  onOpenNoCodeStudio,
}: ModuleWorkspaceProps) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [formState, setFormState] = useState<Omit<Prospect, "id">>({
    name: "",
    email: "",
    premium: 0,
    status: "New",
  });
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [duplicateAlerts, setDuplicateAlerts] = useState<string[]>([]);
  const [duplicatesResolved, setDuplicatesResolved] = useState(0);
  const [ocrResult, setOcrResult] = useState<string>("Upload a document to simulate OCR insights.");
  const [autoCompleteSuggestion, setAutoCompleteSuggestion] = useState<string>("");

  const activeProspect = useMemo(
    () => prospects.find((item) => item.id === selectedProspectId) ?? null,
    [prospects, selectedProspectId]
  );

  const totalPremium = useMemo(
    () =>
      prospects.reduce((acc, prospect) => {
        return acc + prospect.premium;
      }, 0),
    [prospects]
  );

  function handleFormChange<Field extends keyof typeof formState>(
    field: Field,
    value: (typeof formState)[Field]
  ) {
    if (field === "name" && value) {
      const matched = prospects.find((prospect) =>
        prospect.name.toLowerCase().includes(String(value).toLowerCase())
      );
      if (matched) {
        setAutoCompleteSuggestion(
          `Looks similar to ${matched.name}. You can link to existing record ${matched.id}.`
        );
      } else {
        setAutoCompleteSuggestion("");
      }
    }
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setFormState({
      name: "",
      email: "",
      premium: 0,
      status: "New",
    });
    setAutoCompleteSuggestion("");
  }

  function handleCreate() {
    const trimmedName = formState.name.trim();
    if (!trimmedName) return;
    const possibleDuplicate = prospects
      .filter((prospect) => prospect.name.toLowerCase().includes(trimmedName.toLowerCase()))
      .map((prospect) => prospect.id);

    if (possibleDuplicate.length > 0) {
      setDuplicateAlerts(possibleDuplicate);
    } else {
      setDuplicateAlerts([]);
    }

    const newProspect: Prospect = {
      id: `CL-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: trimmedName,
      email: formState.email,
      premium: Number(formState.premium),
      status: formState.status,
    };

    setProspects((prev) => [...prev, newProspect]);
    setSelectedProspectId(newProspect.id);
    resetForm();
  }

  function handleDelete(id: string) {
    setProspects((prev) => prev.filter((prospect) => prospect.id !== id));
    if (selectedProspectId === id) {
      setSelectedProspectId(null);
    }
  }

  function handleMergeDuplicates() {
    setDuplicatesResolved((prev) => prev + duplicateAlerts.length);
    const mergedName = formState.name.trim();
    if (!mergedName) return;
    setProspects((prev) =>
      prev.map((prospect) =>
        duplicateAlerts.includes(prospect.id) ? { ...prospect, name: mergedName } : prospect
      )
    );
    setDuplicateAlerts([]);
  }

  async function handleBulkUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const text = await file.text();
    const { data } = Papa.parse<Record<string, string>>(text.trim(), {
      header: true,
      skipEmptyLines: true,
    });
    const imported: Prospect[] = [];

    data.forEach((row) => {
      if (!row) return;
      const name = row["name"] ?? row["Name"];
      const email = row["email"] ?? row["Email"];
      const premiumStr = row["premium"] ?? row["Premium"];
      const status = (row["status"] ?? row["Status"] ?? "New") as Prospect["status"];
      if (typeof name === "string" && typeof email === "string") {
        imported.push({
          id: `CL-${Math.floor(Math.random() * 9000 + 1000)}`,
          name: name.trim(),
          email: email.trim(),
          premium: Number(premiumStr || 0),
          status: statuses.includes(status) ? status : "New",
        });
      }
    });

    if (imported.length) {
      setProspects((prev) => [...prev, ...imported]);
    }
  }

  function handleExport() {
    const csv = Papa.unparse(
      prospects.map(({ id, name, email, premium, status }) => ({
        id,
        name,
        email,
        premium,
        status,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${module.id}-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleOcrSimulation(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean).slice(0, 8);
    setOcrResult(
      [
        `OCR Summary for ${file.name}:`,
        ...lines.map((line, index) => `Line ${index + 1}: ${line.slice(0, 120)}`),
        "Confidence: 0.87 (simulated)",
      ].join("\n")
    );
  }

  return (
    <section className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-night-950/80 p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-secondary">
              {module.category}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{module.name}</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">{module.tagline}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-brand-primary/40 bg-brand-primary/10 px-4 py-3 text-right text-xs text-slate-500">
              <p className="font-mono text-[10px] uppercase text-brand-secondary tracking-[0.4em]">
                Total Premium
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                ${totalPremium.toLocaleString()}
              </p>
            </div>
            <button
              onClick={onOpenNoCodeStudio}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-secondary/40 bg-brand-secondary/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary transition hover:bg-brand-secondary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-secondary"
            >
              <Wand2 size={14} />
              Customize Layout
            </button>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {module.features.map((feature) => (
            <article
              key={feature.id}
              className={cn(
                "rounded-2xl border border-white/10 bg-night-950/70 p-5",
                "hover:border-brand-secondary/40 hover:shadow-[0_18px_45px_-25px_rgba(44,95,246,0.6)] transition"
              )}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-secondary">
                <span>{feature.title}</span>
                <Sparkles size={16} className="text-brand-accent" />
              </div>
              <p className="mt-3 text-sm text-slate-500">{feature.description}</p>
              {feature.metrics && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {feature.metrics.map((metric) => (
                    <span
                      key={metric.label}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-slate-400",
                        metric.trend === "up" && "border-success-500/30 text-success-500",
                        metric.trend === "down" && "border-warning-500/30 text-warning-500"
                      )}
                    >
                      <strong className="font-semibold text-surface-900">
                        {metric.value}
                      </strong>
                      {metric.label}
                    </span>
                  ))}
                </div>
              )}
              {feature.actions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {feature.actions.map((action) => (
                    <button
                      key={action}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400 transition hover:border-brand-secondary/40 hover:bg-brand-secondary/10 hover:text-brand-secondary"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),420px]">
        <div className="rounded-3xl border border-white/10 bg-night-950/75 p-6">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-secondary">
              Smart Intake Console
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <Bot size={14} className="text-brand-accent" />
              AI suggestions active
            </div>
          </header>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleCreate();
            }}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <FormField
              label="Organization Name"
              value={formState.name}
              onChange={(value) => handleFormChange("name", value)}
              placeholder="e.g. Horizon Manufacturing"
            />
            <FormField
              label="Primary Email"
              value={formState.email}
              onChange={(value) => handleFormChange("email", value)}
              placeholder="contact@example.com"
              type="email"
            />
            <FormField
              label="Estimated Premium"
              value={String(formState.premium)}
              onChange={(value) =>
                handleFormChange("premium", Number(value.replace(/[^0-9.]/g, "")))
              }
              placeholder="75000"
            />
            <div>
              <label className="text-[11px] uppercase tracking-[0.35em] text-brand-secondary">
                Status
              </label>
              <select
                value={formState.status}
                onChange={(event) => handleFormChange("status", event.target.value as Prospect["status"])}
                className="mt-2 w-full rounded-xl border border-white/10 bg-night-950/60 px-4 py-3 text-sm text-slate-300 focus:border-brand-secondary focus:outline-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-brand-primary transition hover:bg-brand-primary/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
              >
                <Sparkles size={14} />
                Create Prospect
              </button>
            </div>
          </form>
          {autoCompleteSuggestion && (
            <div className="mt-4 rounded-xl border border-brand-secondary/30 bg-brand-secondary/10 p-4 text-xs text-brand-secondary">
              {autoCompleteSuggestion}
            </div>
          )}
          {duplicateAlerts.length > 0 && (
            <div className="mt-4 rounded-xl border border-warning-500/30 bg-warning-500/10 p-4 text-xs text-warning-500">
              Potential duplicates detected: {duplicateAlerts.join(", ")}.
              <button
                className="ml-2 rounded-full border border-warning-500/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition hover:bg-warning-500/20"
                onClick={() => handleMergeDuplicates()}
              >
                Merge Records
              </button>
            </div>
          )}

          <DataGrid
            prospects={prospects}
            onDelete={handleDelete}
            onSelect={setSelectedProspectId}
            selectedId={selectedProspectId}
          />
        </div>

        <aside className="grid gap-6">
          <div className="rounded-3xl border border-white/10 bg-night-950/70 p-6">
            <header className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
                Bulk Import & Export
              </h4>
              <RefreshCcw size={16} className="text-brand-secondary" />
            </header>
            <p className="mt-3 text-xs text-slate-500">
              Upload CSV or Excel (converted) files with columns name, email, premium, status. Export
              current grid instantly.
            </p>
            <div className="mt-5 space-y-3 text-xs text-slate-400">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-brand-secondary/40 bg-brand-secondary/10 py-6 text-brand-secondary transition hover:bg-brand-secondary/15">
                <Upload size={18} />
                <span>Drop or choose CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(event) => handleBulkUpload(event.target.files)}
                />
              </label>
              <button
                onClick={handleExport}
                className="w-full rounded-xl border border-brand-primary/30 bg-brand-primary/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary transition hover:bg-brand-primary/30"
              >
                Export Current Dataset
              </button>
              <div className="rounded-lg border border-success-500/30 bg-success-500/10 p-3 text-[11px] text-success-500">
                {duplicatesResolved} duplicates resolved this session.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-night-950/70 p-6">
            <header className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
                Document Intelligence
              </h4>
              <Sparkles size={16} className="text-brand-accent" />
            </header>
            <p className="mt-3 text-xs text-slate-500">
              Simulate OCR extraction. Upload a text-based policy schedule to surface key clauses.
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-brand-accent/40 bg-brand-accent/10 px-4 py-6 text-brand-accent transition hover:bg-brand-accent/20">
              Upload Text Document
              <input
                type="file"
                accept=".txt,.csv"
                className="hidden"
                onChange={(event) => handleOcrSimulation(event.target.files)}
              />
            </label>
            <pre className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-white/5 bg-night-950/80 p-4 text-[11px] text-slate-400">
              {ocrResult}
            </pre>
          </div>

          {activeProspect && (
            <div className="rounded-3xl border border-brand-secondary/30 bg-brand-secondary/10 p-6 text-xs text-brand-secondary">
              <h5 className="text-[11px] uppercase tracking-[0.4em]">Smart Summary</h5>
              <p className="mt-3 text-slate-400">
                {activeProspect.name} is currently marked as {activeProspect.status}. AI recommends a
                follow-up within 3 days with focus on risk appetite around property and casualty lines.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function FormField({ label, value, onChange, placeholder, type = "text" }: FormFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="text-[11px] uppercase tracking-[0.35em] text-brand-secondary">
        {label}
      </label>
      <input
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 rounded-xl border border-white/10 bg-night-950/60 px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 focus:border-brand-secondary focus:outline-none"
      />
    </div>
  );
}

interface DataGridProps {
  prospects: Prospect[];
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

function DataGrid({ prospects, onDelete, onSelect, selectedId }: DataGridProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
      <table className="min-w-full divide-y divide-white/5 text-left text-xs text-slate-400">
        <thead className="bg-night-950/90 uppercase tracking-[0.35em] text-[10px] text-brand-secondary">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Premium</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-night-950/70">
          {prospects.map((prospect) => (
            <tr
              key={prospect.id}
              className={cn(
                "cursor-pointer transition hover:bg-brand-primary/10",
                selectedId === prospect.id && "bg-brand-primary/15"
              )}
              onClick={() => onSelect(prospect.id)}
            >
              <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{prospect.id}</td>
              <td className="px-4 py-3 text-surface-900">{prospect.name}</td>
              <td className="px-4 py-3">{prospect.email}</td>
              <td className="px-4 py-3 font-semibold text-brand-secondary">
                ${prospect.premium.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  {prospect.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  className="rounded-full border border-danger-500/40 bg-danger-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-danger-500 transition hover:bg-danger-500/20"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(prospect.id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
