"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { createClient } from "@/lib/supabase/client";
import { FORMAT_TEMPLATES } from "@/components/format-card-grid";
import { HookFormatPanel } from "@/components/hook-format-panel";
import { FormatMatrixView } from "@/components/format-matrix-view";
import { Badge } from "@/components/ui/badge";

type ViewMode = "panels" | "matrix";

export default function FormatsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const hooks = useProjectStore((s) => s.hooks);
  const messagingAngles = useProjectStore((s) => s.messagingAngles);
  const formatExecutions = useProjectStore((s) => s.formatExecutions);
  const addFormatExecution = useProjectStore((s) => s.addFormatExecution);
  const removeFormatExecution = useProjectStore((s) => s.removeFormatExecution);
  const updateFormatExecution = useProjectStore(
    (s) => s.updateFormatExecution
  );

  const [viewMode, setViewMode] = useState<ViewMode>("panels");

  const starredHooks = hooks.filter((h) => h.is_starred);

  // Build lookup: hookId → Set<templateId>
  const selectionsByHook = new Map<string, Set<string>>();
  for (const fe of formatExecutions) {
    if (!fe.template_id) continue;
    if (!selectionsByHook.has(fe.hook_id)) {
      selectionsByHook.set(fe.hook_id, new Set());
    }
    selectionsByHook.get(fe.hook_id)!.add(fe.template_id);
  }

  const totalExecutions = formatExecutions.filter(
    (fe) => fe.template_id
  ).length;
  const conceptCount = formatExecutions.filter(
    (fe) => fe.concept_notes?.trim()
  ).length;

  function getAngleName(angleId: string): string {
    return messagingAngles.find((a) => a.id === angleId)?.title ?? "Unknown";
  }

  function getExecutionsForHook(hookId: string) {
    return formatExecutions.filter(
      (fe) => fe.hook_id === hookId && fe.template_id
    );
  }

  async function handleToggleFormat(hookId: string, templateId: string) {
    const existing = formatExecutions.find(
      (fe) => fe.hook_id === hookId && fe.template_id === templateId
    );

    const supabase = createClient();

    if (existing) {
      removeFormatExecution(existing.id);
      const { error } = await supabase
        .from("format_executions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        addFormatExecution(existing);
      }
    } else {
      const sortOrder = formatExecutions.filter(
        (fe) => fe.hook_id === hookId
      ).length;

      const { data, error } = await supabase
        .from("format_executions")
        .insert({
          hook_id: hookId,
          template_id: templateId,
          format: "social_post" as const,
          content: "",
          sort_order: sortOrder,
        } as any)
        .select()
        .single();

      if (!error && data) {
        addFormatExecution(data);
      }
    }
  }

  async function handleSelectAllForHook(hookId: string) {
    const currentTemplates = selectionsByHook.get(hookId) ?? new Set();
    const missing = FORMAT_TEMPLATES.filter(
      (f) => !currentTemplates.has(f.id)
    );
    if (missing.length === 0) return;

    const supabase = createClient();
    const baseOrder = formatExecutions.filter(
      (fe) => fe.hook_id === hookId
    ).length;

    const rows = missing.map((f, i) => ({
      hook_id: hookId,
      template_id: f.id,
      format: "social_post" as const,
      content: "",
      sort_order: baseOrder + i,
    }));

    const { data, error } = await supabase
      .from("format_executions")
      .insert(rows)
      .select();

    if (!error && data) {
      for (const row of data) {
        addFormatExecution(row);
      }
    }
  }

  async function handleClearAllForHook(hookId: string) {
    const toRemove = formatExecutions.filter(
      (fe) => fe.hook_id === hookId && fe.template_id
    );
    if (toRemove.length === 0) return;

    for (const fe of toRemove) {
      removeFormatExecution(fe.id);
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("format_executions")
      .delete()
      .eq("hook_id", hookId)
      .not("template_id", "is", null);

    if (error) {
      for (const fe of toRemove) {
        addFormatExecution(fe);
      }
    }
  }

  function handleConceptGenerated(executionId: string, conceptNotes: string) {
    updateFormatExecution(executionId, { concept_notes: conceptNotes });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Format Executions</h1>
        <p className="text-gray-500 text-sm">
          For each starred hook, select creative formats and generate concept
          outlines. Each format defines a narrative structure for turning hooks
          into full-length content.
        </p>
      </div>

      {/* Stats bar + view toggle */}
      <div className="flex items-center justify-between mb-6 p-3 rounded-lg bg-gray-50 border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Starred hooks:</span>
            <Badge variant={starredHooks.length > 0 ? "default" : "outline"}>
              {starredHooks.length}
            </Badge>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Format selections:</span>
            <Badge variant={totalExecutions > 0 ? "default" : "outline"}>
              {totalExecutions}
            </Badge>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Concepts generated:</span>
            <Badge variant={conceptCount > 0 ? "default" : "outline"}>
              {conceptCount}
            </Badge>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-md border bg-white p-0.5">
          <button
            onClick={() => setViewMode("panels")}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              viewMode === "panels"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Panels
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              viewMode === "matrix"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Matrix
          </button>
        </div>
      </div>

      {starredHooks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4">
          <p className="text-sm text-amber-700">
            No starred hooks yet. Go back to Hooks and star the hooks you want
            to turn into format executions.
          </p>
        </div>
      ) : viewMode === "matrix" ? (
        <FormatMatrixView
          starredHooks={starredHooks}
          formatExecutions={formatExecutions}
          getAngleName={getAngleName}
        />
      ) : (
        <div className="space-y-6">
          {starredHooks.map((hook) => (
            <HookFormatPanel
              key={hook.id}
              hook={hook}
              angleName={getAngleName(hook.messaging_angle_id)}
              projectId={projectId}
              selectedTemplates={selectionsByHook.get(hook.id) ?? new Set()}
              executions={getExecutionsForHook(hook.id)}
              onToggleFormat={(templateId) =>
                handleToggleFormat(hook.id, templateId)
              }
              onSelectAll={() => handleSelectAllForHook(hook.id)}
              onClearAll={() => handleClearAllForHook(hook.id)}
              onConceptGenerated={handleConceptGenerated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
