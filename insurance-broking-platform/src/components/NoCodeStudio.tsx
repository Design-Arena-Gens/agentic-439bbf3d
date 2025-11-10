'use client';

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Layers } from "lucide-react";

type WidgetKind = "metric" | "table" | "form" | "chart";

interface WidgetDescriptor {
  id: string;
  name: string;
  description: string;
  kind: WidgetKind;
  defaultFields: string[];
}

const widgetCatalog: WidgetDescriptor[] = [
  {
    id: "widget-metric",
    name: "Metric Tile",
    description: "Highlight KPIs like premium, claims ratio, or retention.",
    kind: "metric",
    defaultFields: ["Label", "Value", "Trend"],
  },
  {
    id: "widget-table",
    name: "Data Table",
    description: "Display structured lists from any module dataset.",
    kind: "table",
    defaultFields: ["Column A", "Column B", "Column C"],
  },
  {
    id: "widget-form",
    name: "Smart Form",
    description: "Collect information with validation and AI suggestions.",
    kind: "form",
    defaultFields: ["Field A", "Field B", "Field C"],
  },
  {
    id: "widget-chart",
    name: "Insight Chart",
    description: "Visualize performance trends, distribution, and forecasts.",
    kind: "chart",
    defaultFields: ["Metric Name", "Value"],
  },
];

interface NoCodeStudioProps {
  open: boolean;
  onClose: () => void;
}

interface CanvasWidget {
  uid: string;
  from: WidgetDescriptor["id"];
  title: string;
  fields: string[];
}

export function NoCodeStudio({ open, onClose }: NoCodeStudioProps) {
  const [canvasWidgets, setCanvasWidgets] = useState<CanvasWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const idCounter = useRef(0);

  const selectedWidget = useMemo(
    () => canvasWidgets.find((widget) => widget.uid === selectedWidgetId) ?? null,
    [canvasWidgets, selectedWidgetId]
  );

  const livePreview = useMemo(() => {
    return canvasWidgets.map((widget) => {
      const descriptor = widgetCatalog.find((item) => item.id === widget.from)!;
      return {
        ...widget,
        kind: descriptor.kind,
      };
    });
  }, [canvasWidgets]);

  function handleAddWidget(descriptor: WidgetDescriptor) {
    idCounter.current += 1;
    const uid = `${descriptor.id}-${idCounter.current}`;
    setCanvasWidgets((prev) => [
      ...prev,
      {
        uid,
        from: descriptor.id,
        title: descriptor.name,
        fields: descriptor.defaultFields,
      },
    ]);
    setSelectedWidgetId(uid);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    const descriptorId = event.dataTransfer.getData("widget-id");
    const descriptor = widgetCatalog.find((item) => item.id === descriptorId);
    if (descriptor) {
      handleAddWidget(descriptor);
    }
  }

  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, descriptorId: string) {
    event.dataTransfer.setData("widget-id", descriptorId);
    event.dataTransfer.effectAllowed = "copy";
  }

  function updateSelectedWidget(fieldName: string, value: string, index: number) {
    setCanvasWidgets((prev) =>
      prev.map((widget) =>
        widget.uid === selectedWidgetId
          ? {
              ...widget,
              fields: widget.fields.map((field, fieldIndex) =>
                fieldIndex === index ? value : field
              ),
              title: fieldName === "title" ? value : widget.title,
            }
          : widget
      )
    );
  }

  function handleRemoveWidget(uid: string) {
    setCanvasWidgets((prev) => prev.filter((widget) => widget.uid !== uid));
    if (selectedWidgetId === uid) {
      setSelectedWidgetId(null);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="gradient-ring absolute inset-0" />
      <div className="relative grid h-[90vh] w-[92vw] max-w-[1200px] grid-cols-[320px,minmax(0,1fr),280px] gap-6 rounded-[32px] border border-white/10 bg-night-950/95 p-6 shadow-[0_40px_120px_-45px_rgba(20,40,90,0.8)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-500 transition hover:border-brand-secondary/60 hover:text-brand-secondary"
        >
          Close
        </button>
        <aside className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-night-950/80 p-4">
          <header>
            <p className="text-[11px] uppercase tracking-[0.4em] text-brand-secondary">
              Widgets
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Drag a block into the canvas or click to instantly add layout elements.
            </p>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {widgetCatalog.map((widget) => (
              <button
                key={widget.id}
                draggable
                onDragStart={(event) => handleDragStart(event, widget.id)}
                onClick={() => handleAddWidget(widget)}
                className="group w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-brand-secondary/60 hover:bg-brand-secondary/10"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-brand-secondary">
                  <span>{widget.name}</span>
                  <Layers size={12} className="text-brand-accent" />
                </div>
                <p className="mt-2 text-xs text-slate-500 group-hover:text-slate-300">
                  {widget.description}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <main
          className="flex flex-col rounded-2xl border border-white/10 bg-night-950/70 p-6"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={handleDrop}
        >
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-secondary">
              Canvas Builder
            </h2>
            <p className="text-xs text-slate-500">
              Arrange modules. Drag to reorder. Select blocks to edit fields on the right.
            </p>
          </header>
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
            {livePreview.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-brand-secondary/40 bg-brand-secondary/5 p-10 text-center text-xs text-brand-secondary">
                Drop widgets here or click from the catalog to start designing your module layout.
              </div>
            ) : (
              livePreview.map((widget) => (
                <div
                  key={widget.uid}
                  className={cn(
                    "group relative cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-brand-primary/40",
                    selectedWidgetId === widget.uid && "border-brand-primary/60 bg-brand-primary/10"
                  )}
                  onClick={() => setSelectedWidgetId(widget.uid)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical size={16} className="text-slate-500" />
                      <p className="text-sm font-semibold text-surface-900">{widget.title}</p>
                    </div>
                    <button
                      className="rounded-full border border-danger-500/40 bg-danger-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-danger-500 opacity-0 transition group-hover:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveWidget(widget.uid);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {widget.fields.map((field, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-white/5 bg-night-950/60 px-3 py-2 text-[11px] text-slate-500"
                      >
                        {field}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <aside className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-night-950/80 p-5">
          <header>
            <p className="text-[11px] uppercase tracking-[0.4em] text-brand-secondary">
              Inspector
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Edit titles, rename fields, and define dataset bindings. Changes apply instantly.
            </p>
          </header>
          {selectedWidget ? (
            <div className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] uppercase tracking-[0.4em] text-brand-secondary">
                  Block Title
                </label>
                <input
                  value={selectedWidget.title}
                  onChange={(event) =>
                    updateSelectedWidget("title", event.target.value, -1)
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-night-950/60 px-4 py-3 text-sm text-slate-300 focus:border-brand-secondary focus:outline-none"
                />
              </div>
              <div className="space-y-3">
                {selectedWidget.fields.map((field, index) => (
                  <div key={index}>
                    <label className="text-[10px] uppercase tracking-[0.4em] text-brand-secondary">
                      Field {index + 1}
                    </label>
                    <input
                      value={field}
                      onChange={(event) =>
                        updateSelectedWidget("field", event.target.value, index)
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-night-950/60 px-4 py-3 text-sm text-slate-300 focus:border-brand-secondary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <p className="rounded-xl border border-brand-secondary/30 bg-brand-secondary/10 p-4 text-[11px] text-brand-secondary">
                Drag fields to reorder inside the block coming soon. Bind to live data sources via
                Carrier APIs or internal datasets in one click.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-xs text-slate-500">
              <Trash2 size={18} className="text-slate-700" />
              <p className="mt-3 max-w-[220px]">
                Select a block on the canvas to configure its fields and data sources.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
