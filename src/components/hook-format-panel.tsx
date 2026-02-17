"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  FORMAT_TEMPLATES,
  FORMAT_CATEGORIES,
} from "@/components/format-card-grid";
import type { Tables } from "@/types/database";

type Hook = Tables<"hooks">;
type FormatExecution = Tables<"format_executions">;

const HOOK_TYPE_LABELS: Record<string, string> = {
  question: "Question",
  statistic: "Statistic",
  story: "Story",
  contradiction: "Contradiction",
  challenge: "Challenge",
  metaphor: "Metaphor",
};

const AWARENESS_LABELS: Record<string, string> = {
  unaware: "Unaware",
  problem_aware: "Problem Aware",
  solution_aware: "Solution Aware",
  product_aware: "Product Aware",
  most_aware: "Most Aware",
};

interface HookFormatPanelProps {
  hook: Hook;
  angleName: string;
  projectId: string;
  selectedTemplates: Set<string>;
  executions: FormatExecution[];
  onToggleFormat: (templateId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onConceptGenerated: (executionId: string, conceptNotes: string) => void;
}

export function HookFormatPanel({
  hook,
  angleName,
  projectId,
  selectedTemplates,
  executions,
  onToggleFormat,
  onSelectAll,
  onClearAll,
  onConceptGenerated,
}: HookFormatPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  const selectedCount = selectedTemplates.size;

  const conceptCount = executions.filter((e) => e.concept_notes?.trim()).length;

  async function handleGenerateConcept(executionId: string) {
    setGeneratingId(executionId);
    try {
      const res = await fetch("/api/ai/step5-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, formatExecutionId: executionId }),
      });

      if (res.ok) {
        const data = await res.json();
        onConceptGenerated(executionId, data.concept_notes ?? "");
        setExpandedConcept(executionId);
      }
    } catch {
      // Silent fail
    } finally {
      setGeneratingId(null);
    }
  }

  async function handleGenerateAll() {
    const pending = executions.filter((e) => !e.concept_notes?.trim());
    for (const exec of pending) {
      setGeneratingId(exec.id);
      try {
        const res = await fetch("/api/ai/step5-concept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, formatExecutionId: exec.id }),
        });
        if (res.ok) {
          const data = await res.json();
          onConceptGenerated(exec.id, data.concept_notes ?? "");
        }
      } catch {
        // Continue to next
      }
    }
    setGeneratingId(null);
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* Hook header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
              {HOOK_TYPE_LABELS[hook.type] ?? hook.type}
            </Badge>
            <span className="text-[10px] text-gray-400">
              {AWARENESS_LABELS[hook.awareness_stage] ?? hook.awareness_stage}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-amber-400 shrink-0"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-900 leading-relaxed">
            {hook.content}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">{angleName}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <span className="text-[10px] rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 font-medium">
            {selectedCount} format{selectedCount !== 1 ? "s" : ""}
          </span>
          {conceptCount > 0 && (
            <span className="text-[10px] rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-medium">
              {conceptCount} concept{conceptCount !== 1 ? "s" : ""}
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path
              d="M3 5L7 9L11 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t">
          {/* Format selection */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={onSelectAll}
                className="text-[11px] text-violet-500 hover:text-violet-700 transition-colors"
              >
                Select all
              </button>
              {selectedCount > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={onClearAll}
                    className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>

            <div className="space-y-3">
              {FORMAT_CATEGORIES.map((category) => {
                const formats = FORMAT_TEMPLATES.filter(
                  (f) => f.category === category.key
                );
                const catSelected = formats.filter((f) =>
                  selectedTemplates.has(f.id)
                ).length;

                return (
                  <div key={category.key}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${category.badgeColor}`}
                      >
                        {category.label}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {catSelected}/{formats.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formats.map((format) => {
                        const isSelected = selectedTemplates.has(format.id);
                        return (
                          <button
                            key={format.id}
                            type="button"
                            onClick={() => onToggleFormat(format.id)}
                            title={format.description}
                            className={`rounded-md border px-2.5 py-1 text-[11px] transition-all ${
                              isSelected
                                ? `${category.color} font-medium text-gray-800`
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <span className="mr-1 text-violet-500">
                                &#10003;
                              </span>
                            )}
                            {format.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Concept notes section */}
          {executions.length > 0 && (
            <div className="border-t px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-700">
                  Concept Outlines
                </h4>
                {executions.some((e) => !e.concept_notes?.trim()) && (
                  <button
                    onClick={handleGenerateAll}
                    disabled={!!generatingId}
                    className="text-[11px] text-violet-500 hover:text-violet-700 disabled:text-gray-300 flex items-center gap-1 transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    Generate all concepts
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {executions.map((exec) => {
                  const template = FORMAT_TEMPLATES.find(
                    (f) => f.id === exec.template_id
                  );
                  if (!template) return null;

                  const category = FORMAT_CATEGORIES.find(
                    (c) => c.key === template.category
                  );
                  const hasConcept = !!exec.concept_notes?.trim();
                  const isGenerating = generatingId === exec.id;
                  const isConceptExpanded = expandedConcept === exec.id;

                  return (
                    <div
                      key={exec.id}
                      className="rounded-md border border-gray-200 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50">
                        <div className="flex items-center gap-2 min-w-0">
                          {category && (
                            <span
                              className={`text-[9px] rounded-full px-1.5 py-0.5 font-medium shrink-0 ${category.badgeColor}`}
                            >
                              {category.label}
                            </span>
                          )}
                          <span className="text-xs font-medium text-gray-700 truncate">
                            {template.name}
                          </span>
                          {hasConcept && (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasConcept ? (
                            <button
                              onClick={() =>
                                setExpandedConcept(
                                  isConceptExpanded ? null : exec.id
                                )
                              }
                              className="text-[10px] text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              {isConceptExpanded ? "Hide" : "View"}
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleGenerateConcept(exec.id)}
                            disabled={isGenerating || !!generatingId}
                            className="text-[10px] text-violet-500 hover:text-violet-700 disabled:text-gray-300 transition-colors"
                          >
                            {isGenerating
                              ? "Generating..."
                              : hasConcept
                                ? "Regenerate"
                                : "Generate"}
                          </button>
                        </div>
                      </div>

                      {isConceptExpanded && hasConcept && (
                        <div className="px-3 py-2 border-t">
                          <pre className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                            {exec.concept_notes}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
