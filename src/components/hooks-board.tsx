"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useProjectStore } from "@/stores/project-store";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/types/database";
import type { Lenses } from "@/components/angle-lenses";

type Hook = Tables<"hooks">;

const AWARENESS_STAGES = [
  {
    key: "unaware",
    label: "Unaware",
    description: "Doesn't know they have a problem",
    color: "bg-gray-100 border-gray-200",
    headerColor: "text-gray-600",
    activeBg: "bg-gray-100",
    dotColor: "bg-gray-400",
  },
  {
    key: "problem_aware",
    label: "Problem Aware",
    description: "Knows the problem, not the solution",
    color: "bg-red-50 border-red-200",
    headerColor: "text-red-700",
    activeBg: "bg-red-50",
    dotColor: "bg-red-400",
  },
  {
    key: "solution_aware",
    label: "Solution Aware",
    description: "Knows solutions exist, not yours",
    color: "bg-yellow-50 border-yellow-200",
    headerColor: "text-yellow-700",
    activeBg: "bg-yellow-50",
    dotColor: "bg-yellow-400",
  },
  {
    key: "product_aware",
    label: "Product Aware",
    description: "Knows your product, hasn't bought",
    color: "bg-blue-50 border-blue-200",
    headerColor: "text-blue-700",
    activeBg: "bg-blue-50",
    dotColor: "bg-blue-400",
  },
  {
    key: "most_aware",
    label: "Most Aware",
    description: "Ready to buy, needs a push",
    color: "bg-green-50 border-green-200",
    headerColor: "text-green-700",
    activeBg: "bg-green-50",
    dotColor: "bg-green-400",
  },
] as const;

export type AwarenessStage = (typeof AWARENESS_STAGES)[number]["key"];

const HOOK_TYPE_LABELS: Record<string, string> = {
  question: "Question",
  statistic: "Statistic",
  story: "Story",
  contradiction: "Contradiction",
  challenge: "Challenge",
  metaphor: "Metaphor",
};

const HOOK_TYPES = [
  { value: "question", label: "Question" },
  { value: "statistic", label: "Statistic" },
  { value: "story", label: "Story" },
  { value: "contradiction", label: "Contradiction" },
  { value: "challenge", label: "Challenge" },
  { value: "metaphor", label: "Metaphor" },
] as const;

const LENS_LABELS: Record<string, string> = {
  desired_outcome: "Desired Outcome",
  objections: "Objections",
  features_benefits: "Features & Benefits",
  use_case: "Use Case",
  consequences: "Consequences",
  misconceptions: "Misconceptions",
  education: "Education",
  acceptance: "Acceptance",
  failed_solutions: "Failed Solutions",
  identity: "Identity",
};

function getStageForHook(hook: Hook): AwarenessStage {
  return (hook.awareness_stage as AwarenessStage) ?? "unaware";
}

// ─── Inline hook input ────────────────────────────────────────────────────────

interface InlineHookInputProps {
  angleId: string;
  stage: AwarenessStage;
  stageHookCount: number;
  onClose: () => void;
}

function InlineHookInput({ angleId, stage, stageHookCount, onClose }: InlineHookInputProps) {
  const addHook = useProjectStore((s) => s.addHook);
  const [content, setContent] = useState("");
  const [hookType, setHookType] = useState("question");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  async function handleSave() {
    if (!content.trim() || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("hooks")
      .insert({
        messaging_angle_id: angleId,
        type: hookType as Hook["type"],
        content: content.trim(),
        awareness_stage: stage,
        sort_order: stageHookCount,
      } as any)
      .select()
      .single();
    if (!error && data) {
      addHook(data);
      setContent("");
      setHookType("question");
    }
    setSaving(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") onClose();
  }

  return (
    <div className="rounded-md border border-dashed border-violet-300 bg-violet-50/30 p-2 space-y-1.5">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your hook..."
        rows={2}
        className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
      />
      <div className="flex items-center gap-1.5">
        <select
          value={hookType}
          onChange={(e) => setHookType(e.target.value)}
          className="flex-1 rounded border border-gray-200 bg-white px-1.5 py-1 text-[10px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-300"
        >
          {HOOK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="rounded bg-violet-500 px-2 py-1 text-[10px] font-medium text-white hover:bg-violet-600 disabled:opacity-40 transition-colors"
        >
          {saving ? "..." : "Add"}
        </button>
        <button onClick={onClose} className="rounded px-1.5 py-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
          Cancel
        </button>
      </div>
      <p className="text-[9px] text-gray-400">Ctrl+Enter to save · Esc to close</p>
    </div>
  );
}

// ─── Hook card ────────────────────────────────────────────────────────────────

interface DraggableHookCardProps {
  hook: Hook;
  angleName: string;
  lensSnippets: { key: string; value: string }[];
  stageHookCount: number;
  onToggleInline: (hookId: string) => void;
  onToggleStar: (hookId: string, starred: boolean) => void;
  isInlineOpen: boolean;
}

function DraggableHookCard({
  hook, angleName, lensSnippets, stageHookCount,
  onToggleInline, onToggleStar, isInlineOpen,
}: DraggableHookCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: hook.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div className="space-y-2">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`rounded-md border bg-white p-3 shadow-sm hover:shadow transition-shadow cursor-grab active:cursor-grabbing ${hook.is_starred ? "ring-1 ring-amber-300" : ""}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
              {HOOK_TYPE_LABELS[hook.type] ?? hook.type}
            </Badge>
            {hook.is_ai_generated && <span className="text-[9px] text-violet-500">AI</span>}
          </div>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onToggleStar(hook.id, !hook.is_starred); }}
            className="shrink-0 p-0.5 transition-colors"
            title={hook.is_starred ? "Remove from export" : "Include in export"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={hook.is_starred ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={hook.is_starred ? "text-amber-400" : "text-gray-300 hover:text-amber-300"}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-900 leading-relaxed">{hook.content}</p>

        {lensSnippets.length > 0 && (
          <div className="mt-2 space-y-1">
            {lensSnippets.map((lens) => (
              <div key={lens.key} className="flex items-start gap-1">
                <span className="text-[9px] font-medium text-gray-400 shrink-0 mt-px">
                  {LENS_LABELS[lens.key] ?? lens.key}:
                </span>
                <span className="text-[10px] text-gray-500 line-clamp-1">{lens.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-gray-400 truncate">{angleName}</p>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onToggleInline(hook.id); }}
            className="text-[10px] text-violet-400 hover:text-violet-600 transition-colors shrink-0 ml-2"
          >
            + Hook
          </button>
        </div>
      </div>

      {isInlineOpen && (
        <InlineHookInput
          angleId={hook.messaging_angle_id}
          stage={getStageForHook(hook)}
          stageHookCount={stageHookCount}
          onClose={() => onToggleInline(hook.id)}
        />
      )}
    </div>
  );
}

function HookCardOverlay({ hook, angleName }: { hook: Hook; angleName: string }) {
  return (
    <div className="rounded-md border bg-white p-3 shadow-lg w-60 rotate-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
          {HOOK_TYPE_LABELS[hook.type] ?? hook.type}
        </Badge>
      </div>
      <p className="text-xs text-gray-900 leading-relaxed line-clamp-3">{hook.content}</p>
      <p className="text-[10px] text-gray-400 mt-2 truncate">{angleName}</p>
    </div>
  );
}

// ─── Stage column ─────────────────────────────────────────────────────────────

interface StageColumnProps {
  stage: (typeof AWARENESS_STAGES)[number];
  hooks: Hook[];
  isActive: boolean;
  onActivate: () => void;
  getAngleName: (angleId: string) => string;
  getLensSnippets: (angleId: string) => { key: string; value: string }[];
  onAddHook: (stage: AwarenessStage) => void;
  inlineOpenId: string | null;
  onToggleInline: (hookId: string) => void;
  onToggleStar: (hookId: string, starred: boolean) => void;
}

function StageColumn({
  stage, hooks, isActive, onActivate,
  getAngleName, getLensSnippets, onAddHook,
  inlineOpenId, onToggleInline, onToggleStar,
}: StageColumnProps) {
  const { setNodeRef } = useSortable({ id: stage.key, data: { type: "column" } });

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  if (!isActive) {
    return (
      <div
        ref={setNodeRef}
        onClick={onActivate}
        className={`
          flex-shrink-0 w-10 rounded-lg border ${stage.color}
          flex flex-col items-center py-4 gap-3
          cursor-pointer hover:brightness-95 transition-all duration-200
          select-none
        `}
        title={`${stage.label} (${hooks.length})`}
      >
        {/* Hook count badge */}
        <span className={`
          text-[10px] font-semibold rounded-full w-5 h-5
          flex items-center justify-center bg-white/80 ${stage.headerColor}
        `}>
          {hooks.length}
        </span>

        {/* Vertical label */}
        <span
          className={`text-[11px] font-semibold ${stage.headerColor} tracking-wide`}
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {stage.label}
        </span>
      </div>
    );
  }

  // ── Expanded column ─────────────────────────────────────────────────────────
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-0 rounded-lg border ${stage.color} flex flex-col transition-all duration-200`}
    >
      {/* Header — clickable to collapse */}
      <div
        className="px-3 py-3 border-b border-inherit cursor-pointer select-none"
        onClick={onActivate}
        title="Click to collapse"
      >
        <div className="flex items-center justify-between mb-0.5">
          <h3 className={`text-sm font-semibold ${stage.headerColor}`}>{stage.label}</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] rounded-full bg-white/80 px-1.5 py-0.5 text-gray-500 font-medium">
              {hooks.length}
            </span>
            {/* Collapse chevron */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-400">
              <path d="M3 7.5L6 4.5L9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <p className="text-[10px] text-gray-400">{stage.description}</p>
      </div>

      <SortableContext items={hooks.map((h) => h.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {hooks.map((hook) => (
            <DraggableHookCard
              key={hook.id}
              hook={hook}
              angleName={getAngleName(hook.messaging_angle_id)}
              lensSnippets={getLensSnippets(hook.messaging_angle_id)}
              stageHookCount={hooks.length}
              onToggleInline={onToggleInline}
              onToggleStar={onToggleStar}
              isInlineOpen={inlineOpenId === hook.id}
            />
          ))}
          {hooks.length === 0 && (
            <div className="text-center py-6 text-[11px] text-gray-300">Drop hooks here</div>
          )}
        </div>
      </SortableContext>

      <div className="p-2 border-t border-inherit">
        <button
          onClick={() => onAddHook(stage.key)}
          className="w-full rounded-md border border-dashed border-gray-300/60 bg-white/50 py-1.5 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
        >
          + Add hook
        </button>
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

interface HooksBoardProps {
  projectId: string;
  onAddHook: (stage: AwarenessStage) => void;
}

export function HooksBoard({ projectId, onAddHook }: HooksBoardProps) {
  const hooks = useProjectStore((s) => s.hooks);
  const messagingAngles = useProjectStore((s) => s.messagingAngles);
  const updateHook = useProjectStore((s) => s.updateHook);

  const [activeStage, setActiveStage] = useState<AwarenessStage>("unaware");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inlineOpenId, setInlineOpenId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function getAngleName(angleId: string): string {
    return messagingAngles.find((a) => a.id === angleId)?.title ?? "Unknown";
  }

  function getLensSnippets(angleId: string): { key: string; value: string }[] {
    const angle = messagingAngles.find((a) => a.id === angleId);
    if (!angle) return [];
    const lenses = (angle.lenses as Lenses) ?? {};
    return Object.entries(lenses)
      .filter(([, v]) => v?.trim())
      .slice(0, 3)
      .map(([key, value]) => ({ key, value: value! }));
  }

  const hooksByStage = AWARENESS_STAGES.map((stage) => ({
    ...stage,
    hooks: hooks.filter((h) => getStageForHook(h) === stage.key),
  }));

  function handleToggleInline(hookId: string) {
    setInlineOpenId((prev) => (prev === hookId ? null : hookId));
  }

  async function handleToggleStar(hookId: string, starred: boolean) {
    updateHook(hookId, { is_starred: starred });
    const supabase = createClient();
    const { error } = await (supabase.from("hooks") as any)
      .update({ is_starred: starred })
      .eq("id", hookId);
    if (error) updateHook(hookId, { is_starred: !starred });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    setInlineOpenId(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const hookId = active.id as string;
    const hook = hooks.find((h) => h.id === hookId);
    if (!hook) return;

    let targetStageKey: AwarenessStage | null = null;
    const stageMatch = AWARENESS_STAGES.find((s) => s.key === (over.id as string));
    if (stageMatch) {
      targetStageKey = stageMatch.key;
    } else {
      const overHook = hooks.find((h) => h.id === over.id);
      if (overHook) targetStageKey = getStageForHook(overHook);
    }
    if (!targetStageKey) return;

    const currentStage = getStageForHook(hook);
    if (currentStage === targetStageKey) return;

    // Auto-expand the target stage when dropping into it
    setActiveStage(targetStageKey);

    const stageHooks = hooks.filter((h) => h.id !== hookId && getStageForHook(h) === targetStageKey);
    const newSortOrder = stageHooks.length;
    updateHook(hookId, { awareness_stage: targetStageKey, sort_order: newSortOrder });

    const supabase = createClient();
    const { error } = await (supabase.from("hooks") as any)
      .update({ awareness_stage: targetStageKey, sort_order: newSortOrder })
      .eq("id", hookId);
    if (error) updateHook(hookId, { awareness_stage: currentStage, sort_order: hook.sort_order });
  }

  // Wrap onAddHook to also expand the target stage
  function handleAddHook(stage: AwarenessStage) {
    setActiveStage(stage);
    onAddHook(stage);
  }

  const activeHook = activeId ? hooks.find((h) => h.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 pb-4 min-h-[500px] px-8">
        {hooksByStage.map((stage) => (
          <StageColumn
            key={stage.key}
            stage={stage}
            hooks={stage.hooks}
            isActive={activeStage === stage.key}
            onActivate={() => setActiveStage(stage.key)}
            getAngleName={getAngleName}
            getLensSnippets={getLensSnippets}
            onAddHook={handleAddHook}
            inlineOpenId={inlineOpenId}
            onToggleInline={handleToggleInline}
            onToggleStar={handleToggleStar}
          />
        ))}
      </div>

      <DragOverlay>
        {activeHook && (
          <HookCardOverlay
            hook={activeHook}
            angleName={getAngleName(activeHook.messaging_angle_id)}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

export { AWARENESS_STAGES };
