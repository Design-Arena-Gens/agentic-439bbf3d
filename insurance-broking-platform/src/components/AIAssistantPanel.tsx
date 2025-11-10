'use client';

import { FormEvent, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, Send, BookOpen } from "lucide-react";
import type { ModuleDefinition } from "@/lib/modules";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantPanelProps {
  modules: ModuleDefinition[];
  onNavigate: (moduleId: ModuleDefinition["id"]) => void;
}

const cannedIntents = [
  "How do I accelerate renewal workflows?",
  "Show analytics with rising loss ratios",
  "Set up intake form for commercial fleet",
  "Remind me of compliance deadlines next month",
];

export function AIAssistantPanel({ modules, onNavigate }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro-1",
      role: "assistant",
      content:
        "Hi! I am the AtriSure Concierge. Ask about policies, claims, compliance, analytics, or anything about your brokerage operations.",
    },
  ]);
  const [input, setInput] = useState("");

  const recommendations = useMemo(() => {
    return modules.slice(0, 3).map((module) => ({
      id: module.id,
      title: module.name,
      description: module.tagline,
    }));
  }, [modules]);

  function pushMessage(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };
    pushMessage(userMessage);
    setInput("");
    const assistantResponse = generateAssistantResponse(input.trim(), modules);
    pushMessage(assistantResponse);
  }

  return (
    <aside className="flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-night-950/70 p-6">
      <header className="flex items-center gap-3">
        <Bot className="h-8 w-8 rounded-full border border-brand-secondary/40 bg-brand-secondary/10 p-1 text-brand-secondary" />
        <div>
          <p className="text-sm font-semibold text-white">AtriSure Concierge</p>
          <p className="text-[11px] uppercase tracking-[0.4em] text-brand-secondary">
            AI Copilot
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "assistant" ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl border px-4 py-3 text-xs leading-relaxed",
                message.role === "assistant"
                  ? "border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary"
                  : "border-brand-primary/30 bg-brand-primary/20 text-brand-primary"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="grid gap-2">
          {cannedIntents.map((intent) => (
            <button
              key={intent}
              onClick={() => {
                setInput(intent);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-[11px] text-slate-500 transition hover:border-brand-secondary/40 hover:bg-brand-secondary/10 hover:text-brand-secondary"
            >
              {intent}
            </button>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-night-950/60 px-3 py-2"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about modules, data, workflows, or compliance…"
            className="flex-1 bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full border border-brand-primary/40 bg-brand-primary/20 p-2 text-brand-primary transition hover:bg-brand-primary/40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-night-950/60 p-4">
        <p className="text-[11px] uppercase tracking-[0.4em] text-brand-secondary">
          Suggested Modules
        </p>
        <ul className="space-y-3 text-xs text-slate-500">
          {recommendations.map((module) => (
            <li key={module.id}>
              <button
                className="w-full text-left transition hover:text-brand-secondary"
                onClick={() => onNavigate(module.id)}
              >
                <strong className="text-surface-900">{module.title}</strong>
                <br />
                {module.description}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-night-950/60 p-4 text-xs text-slate-500">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-brand-secondary">
          <BookOpen size={12} /> Knowledge Pulse
        </p>
        <p>Receive weekly AI-generated playbooks based on customer interactions and claim trends.</p>
        <button
          className="w-full rounded-xl border border-brand-secondary/40 bg-brand-secondary/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-brand-secondary transition hover:bg-brand-secondary/20"
          onClick={() => onNavigate("knowledge-companion")}
        >
          Open Knowledge Companion
        </button>
        <button
          className="w-full rounded-xl border border-brand-primary/30 bg-brand-primary/20 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-brand-primary transition hover:bg-brand-primary/40"
          onClick={() => onNavigate("analytics-pulse")}
        >
          Visualize Insights
        </button>
      </div>
    </aside>
  );
}

function generateAssistantResponse(query: string, modules: ModuleDefinition[]): Message {
  const lowerQuery = query.toLowerCase();

  const matches = modules.filter(
    (module) =>
      module.name.toLowerCase().includes(lowerQuery) ||
      module.tagline.toLowerCase().includes(lowerQuery) ||
      module.features.some((feature) =>
        [feature.title, feature.description]
          .join(" ")
          .toLowerCase()
          .includes(lowerQuery)
      )
  );

  if (matches.length > 0) {
    const recommendations = matches
      .slice(0, 3)
      .map((module) => `• ${module.name}: ${module.tagline}`)
      .join("\n");
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: `Here are the most relevant modules:\n${recommendations}\nI can deep-link you into any module above.`,
    };
  }

  if (lowerQuery.includes("renewal")) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content:
        "For renewals, combine Lifecycle Automation Tracks in Policy Forge with Workflow Studio playbooks. I can generate a draft checklist or schedule reminders for upcoming renewals.",
    };
  }

  if (lowerQuery.includes("compliance") || lowerQuery.includes("license")) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content:
        "Compliance Archive keeps you audit ready. License Guardian surfaces expiring credentials, and Audit Control Tower builds regulator packets automatically.",
    };
  }

  if (lowerQuery.includes("analytics") || lowerQuery.includes("report")) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content:
        "Analytics Pulse can generate predictive briefings. Pair it with Narrative Insights Generator for ready-to-send storyboards to clients.",
    };
  }

  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content:
      "I did not find an exact module, but you can assemble a tailored workspace in the No-Code Studio. Try asking about policies, claims, carriers, or analytics.",
  };
}
