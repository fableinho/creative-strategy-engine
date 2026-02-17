"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  FORMAT_TEMPLATES,
  FORMAT_CATEGORIES,
  type FormatTemplate,
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

interface FormatMatrixViewProps {
  starredHooks: Hook[];
  formatExecutions: FormatExecution[];
  getAngleName: (angleId: string) => string;
}

export function FormatMatrixView({
  starredHooks,
  formatExecutions,
  getAngleName,
}: FormatMatrixViewProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  // Determine which templates are selected across any hook
  const usedTemplateIds = new Set(
    formatExecutions
      .filter((fe) => fe.template_id)
      .map((fe) => fe.template_id!)
  );

  const activeTemplates = FORMAT_TEMPLATES.filter((f) =>
    usedTemplateIds.has(f.id)
  );

  if (activeTemplates.length === 0 || starredHooks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-gray-400">
          Select formats for your starred hooks to see the matrix view.
        </p>
      </div>
    );
  }

  // Build lookup: `hookId:templateId` → FormatExecution
  const cellLookup = new Map<string, FormatExecution>();
  for (const fe of formatExecutions) {
    if (fe.template_id) {
      cellLookup.set(`${fe.hook_id}:${fe.template_id}`, fe);
    }
  }

  // Group templates by category for column headers
  const categoryGroups = FORMAT_CATEGORIES.map((cat) => ({
    ...cat,
    templates: activeTemplates.filter((t) => t.category === cat.key),
  })).filter((g) => g.templates.length > 0);

  const totalColumns = activeTemplates.length;

  function getCellKey(hookId: string, templateId: string) {
    return `${hookId}:${templateId}`;
  }

  function getSnippet(text: string | null | undefined, maxLen = 60): string {
    if (!text?.trim()) return "";
    const clean = text.replace(/\n/g, " ").trim();
    return clean.length > maxLen ? clean.slice(0, maxLen) + "..." : clean;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse min-w-[600px]">
        {/* Column headers */}
        <thead>
          {/* Category group row */}
          <tr className="bg-gray-50">
            <th className="sticky left-0 z-10 bg-gray-50 border-b border-r px-3 py-2 text-left min-w-[200px]">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                Hook
              </span>
            </th>
            {categoryGroups.map((group) => (
              <th
                key={group.key}
                colSpan={group.templates.length}
                className="border-b border-r px-2 py-1.5 text-center"
              >
                <span
                  className={`text-[9px] rounded-full px-2 py-0.5 font-medium ${group.badgeColor}`}
                >
                  {group.label}
                </span>
              </th>
            ))}
          </tr>
          {/* Individual template row */}
          <tr className="bg-gray-50/50">
            <th className="sticky left-0 z-10 bg-gray-50/50 border-b border-r" />
            {activeTemplates.map((template) => (
              <th
                key={template.id}
                className="border-b border-r px-2 py-1.5 text-center min-w-[120px] max-w-[160px]"
              >
                <span
                  className="text-[10px] font-medium text-gray-600 leading-tight block"
                  title={template.description}
                >
                  {template.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {starredHooks.map((hook) => (
            <tr key={hook.id} className="hover:bg-gray-50/30 transition-colors">
              {/* Hook row header */}
              <td className="sticky left-0 z-10 bg-white border-b border-r px-3 py-2 align-top">
                <div className="max-w-[200px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[8px] px-1 py-0"
                    >
                      {HOOK_TYPE_LABELS[hook.type] ?? hook.type}
                    </Badge>
                    <span className="text-[9px] text-gray-400">
                      {AWARENESS_LABELS[hook.awareness_stage] ??
                        hook.awareness_stage}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-800 leading-snug line-clamp-2">
                    {hook.content}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">
                    {getAngleName(hook.messaging_angle_id)}
                  </p>
                </div>
              </td>
              {/* Cells */}
              {activeTemplates.map((template) => {
                const cellKey = getCellKey(hook.id, template.id);
                const fe = cellLookup.get(cellKey);
                const hasConcept = !!fe?.concept_notes?.trim();
                const isExpanded = expandedCell === cellKey;

                return (
                  <td
                    key={template.id}
                    className="border-b border-r px-2 py-1.5 align-top"
                  >
                    {fe ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCell(isExpanded ? null : cellKey)
                        }
                        className={`w-full text-left rounded p-1.5 transition-colors ${
                          hasConcept
                            ? "bg-green-50 hover:bg-green-100"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        {hasConcept ? (
                          <p className="text-[10px] text-gray-600 leading-snug">
                            {getSnippet(fe.concept_notes)}
                          </p>
                        ) : (
                          <p className="text-[10px] text-gray-300 italic">
                            No concept yet
                          </p>
                        )}
                      </button>
                    ) : (
                      <div className="p-1.5">
                        <span className="text-[10px] text-gray-200">&mdash;</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Expanded concept overlay */}
      {expandedCell && (
        <ConceptExpander
          cellKey={expandedCell}
          cellLookup={cellLookup}
          starredHooks={starredHooks}
          activeTemplates={activeTemplates}
          getAngleName={getAngleName}
          onClose={() => setExpandedCell(null)}
        />
      )}
    </div>
  );
}

// --- Expanded concept panel ---

function ConceptExpander({
  cellKey,
  cellLookup,
  starredHooks,
  activeTemplates,
  getAngleName,
  onClose,
}: {
  cellKey: string;
  cellLookup: Map<string, FormatExecution>;
  starredHooks: Hook[];
  activeTemplates: FormatTemplate[];
  getAngleName: (angleId: string) => string;
  onClose: () => void;
}) {
  const fe = cellLookup.get(cellKey);
  if (!fe || !fe.concept_notes?.trim()) return null;

  const [hookId, templateId] = cellKey.split(":");
  const hook = starredHooks.find((h) => h.id === hookId);
  const template = activeTemplates.find((t) => t.id === templateId);
  const category = template
    ? FORMAT_CATEGORIES.find((c) => c.key === template.category)
    : null;

  return (
    <div className="mt-4 rounded-lg border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-3 min-w-0">
          {category && (
            <span
              className={`text-[10px] rounded-full px-2 py-0.5 font-medium shrink-0 ${category.badgeColor}`}
            >
              {category.label}
            </span>
          )}
          <span className="text-sm font-medium text-gray-800 truncate">
            {template?.name}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500 truncate">
            {hook?.content
              ? hook.content.slice(0, 50) +
                (hook.content.length > 50 ? "..." : "")
              : ""}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 shrink-0 ml-3 transition-colors"
        >
          Close
        </button>
      </div>
      {/* Concept body */}
      <div className="px-4 py-3">
        <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
          {fe.concept_notes}
        </pre>
      </div>
      {/* Hook context footer */}
      {hook && (
        <div className="px-4 py-2 bg-gray-50/50 border-t">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[8px] px-1 py-0">
              {HOOK_TYPE_LABELS[hook.type] ?? hook.type}
            </Badge>
            <span className="text-[9px] text-gray-400">
              {AWARENESS_LABELS[hook.awareness_stage] ?? hook.awareness_stage}
            </span>
            <span className="text-[9px] text-gray-400">
              &middot; {getAngleName(hook.messaging_angle_id)}
            </span>
          </div>
          <p className="text-[11px] text-gray-600 leading-snug">
            {hook.content}
          </p>
        </div>
      )}
    </div>
  );
}
