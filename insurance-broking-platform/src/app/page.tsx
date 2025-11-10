"use client";

import { useMemo, useState } from "react";
import { modules as moduleCatalog, type ModuleDefinition, type ModuleIdentifier } from "@/lib/modules";
import { BrandHeader } from "@/components/BrandHeader";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { NoCodeStudio } from "@/components/NoCodeStudio";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";

const defaultModuleId: ModuleIdentifier = "client-orbit";

export default function Home() {
  const [activeModuleId, setActiveModuleId] =
    useState<ModuleIdentifier>(defaultModuleId);
  const [searchTerm, setSearchTerm] = useState("");
  const [studioOpen, setStudioOpen] = useState(false);

  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return moduleCatalog;
    const term = searchTerm.toLowerCase();
    return moduleCatalog.filter((module) => {
      const baseMatch =
        module.name.toLowerCase().includes(term) ||
        module.tagline.toLowerCase().includes(term) ||
        module.category.toLowerCase().includes(term);
      const featureMatch = module.features.some((feature) =>
        [feature.title, feature.description]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
      return baseMatch || featureMatch;
    });
  }, [searchTerm]);

  const effectiveActiveModuleId = useMemo<ModuleIdentifier>(() => {
    if (
      filteredModules.length === 0 ||
      filteredModules.some((module) => module.id === activeModuleId)
    ) {
      return activeModuleId;
    }
    return filteredModules[0].id;
  }, [filteredModules, activeModuleId]);

  const activeModule: ModuleDefinition =
    moduleCatalog.find((module) => module.id === effectiveActiveModuleId) ??
    moduleCatalog.find((module) => module.id === defaultModuleId)!;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 pb-16 pt-10 md:px-10">
      <BrandHeader onOpenNoCodeStudio={() => setStudioOpen(true)} />

      <section className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr),360px]">
        <ModuleSidebar
          modules={filteredModules}
          active={effectiveActiveModuleId}
          onSelect={setActiveModuleId}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        <ModuleWorkspace
          module={activeModule}
          onOpenNoCodeStudio={() => setStudioOpen(true)}
        />

        <AIAssistantPanel
          modules={filteredModules}
          onNavigate={(moduleId) => {
            setActiveModuleId(moduleId);
            setSearchTerm("");
          }}
        />
      </section>

      <NoCodeStudio open={studioOpen} onClose={() => setStudioOpen(false)} />
    </div>
  );
}
