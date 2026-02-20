"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { createClient } from "@/lib/supabase/client";
import {
  HooksBoard,
  AWARENESS_STAGES,
  type AwarenessStage,
} from "@/components/hooks-board";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOOK_TYPES = [
  { value: "question", label: "Question" },
  { value: "statistic", label: "Statistic" },
  { value: "story", label: "Story" },
  { value: "contradiction", label: "Contradiction" },
  { value: "challenge", label: "Challenge" },
  { value: "metaphor", label: "Metaphor" },
] as const;

interface HookSuggestion {
  content: string;
  type: string;
}

export default function HooksPage() {
  const params = useParams();
  const projectId = params.id as string;

  const messagingAngles = useProjectStore((s) => s.messagingAngles);
  const hooks = useProjectStore((s) => s.hooks);
  const addHook = useProjectStore((s) => s.addHook);

  // Manual add dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetStage, setTargetStage] = useState<AwarenessStage>("unaware");
  const [selectedAngleId, setSelectedAngleId] = useState("");
  const [hookType, setHookType] = useState("question");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // AI suggest panel
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiAngleId, setAiAngleId] = useState("");
  const [aiStage, setAiStage] = useState<AwarenessStage>("unaware");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<HookSuggestion[]>([]);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  function handleOpenAdd(stage: AwarenessStage) {
    setTargetStage(stage);
    setSelectedAngleId(messagingAngles[0]?.id ?? "");
    setHookType("question");
    setContent("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!content.trim() || !selectedAngleId) return;
    setSaving(true);

    const stageHookCount = hooks.filter(
      (h) => h.awareness_stage === targetStage
    ).length;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("hooks")
      .insert({
        messaging_angle_id: selectedAngleId,
        type: hookType as "question" | "statistic" | "story" | "contradiction" | "challenge" | "metaphor",
        content: content.trim(),
        awareness_stage: targetStage,
        sort_order: stageHookCount,
      } as any)
      .select()
      .single();

    if (!error && data) {
      addHook(data);
      setDialogOpen(false);
    }
    setSaving(false);
  }

  function handleOpenAiPanel() {
    setAiAngleId(messagingAngles[0]?.id ?? "");
    setAiStage("unaware");
    setAiSuggestions([]);
    setAiPanelOpen(true);
  }

  async function handleGenerateSuggestions() {
    if (!aiAngleId) return;
    setAiLoading(true);
    setAiSuggestions([]);

    try {
      const res = await fetch("/api/ai/step4-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          angleId: aiAngleId,
          awarenessStage: aiStage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data.hooks ?? []);
      }
    } catch {
      // Silently fail
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAcceptSuggestion(suggestion: HookSuggestion, index: number) {
    setAcceptingId(index);

    const stageHookCount = hooks.filter(
      (h) => h.awareness_stage === aiStage
    ).length;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("hooks")
      .insert({
        messaging_angle_id: aiAngleId,
        type: suggestion.type as "question" | "statistic" | "story" | "contradiction" | "challenge" | "metaphor",
        content: suggestion.content,
        awareness_stage: aiStage,
        is_ai_generated: true,
        sort_order: stageHookCount,
      } as any)
      .select()
      .single();

    if (!error && data) {
      addHook(data);
      setAiSuggestions((prev) => prev.filter((_, i) => i !== index));
    }

    setAcceptingId(null);
  }

  async function handleAcceptAll() {
    setAiLoading(true);
    const supabase = createClient();
    const baseCount = hooks.filter((h) => h.awareness_stage === aiStage).length;

    const rows = aiSuggestions.map((s, i) => ({
      messaging_angle_id: aiAngleId,
      type: s.type as "question" | "statistic" | "story" | "contradiction" | "challenge" | "metaphor",
      content: s.content,
      awareness_stage: aiStage,
      is_ai_generated: true,
      sort_order: baseCount + i,
    }));

    const { data, error } = await supabase
      .from("hooks")
      .insert(rows as any)
      .select();

    if (!error && data) {
      data.forEach((h) => addHook(h));
      setAiSuggestions([]);
    }
    setAiLoading(false);
  }

  const stageName =
    AWARENESS_STAGES.find((s) => s.key === targetStage)?.label ?? "";

  const aiStageName =
    AWARENESS_STAGES.find((s) => s.key === aiStage)?.label ?? "";

  const hasSuggestions = aiSuggestions.length > 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Hooks</h1>
          <p className="text-gray-500 text-sm">
            Create hooks for each awareness stage. Move prospects through
            Unaware → Most Aware with targeted messaging.
          </p>
        </div>
        {messagingAngles.length > 0 && (
          <Button
            variant="outline"
            onClick={handleOpenAiPanel}
            className="shrink-0"
          >
            ✦ AI Suggest
          </Button>
        )}
      </div>

      {messagingAngles.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-400 mb-2">No messaging angles yet.</p>
          <p className="text-sm text-gray-400">
            Go back to Messaging Angles to create angles first.
          </p>
        </div>
      ) : (
        <HooksBoard projectId={projectId} onAddHook={handleOpenAdd} />
      )}

      {/* Manual add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Hook</DialogTitle>
            <p className="text-xs text-gray-500 mt-1">Stage: {stageName}</p>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Messaging Angle</label>
              <Select value={selectedAngleId} onValueChange={setSelectedAngleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an angle" />
                </SelectTrigger>
                <SelectContent>
                  {messagingAngles.map((angle) => (
                    <SelectItem key={angle.id} value={angle.id}>
                      {angle.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hook Type</label>
              <Select value={hookType} onValueChange={setHookType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOOK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hook Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your hook..."
                rows={3}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!content.trim() || !selectedAngleId || saving}
              >
                {saving ? "Saving..." : "Add Hook"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Suggest dialog */}
      <Dialog open={aiPanelOpen} onOpenChange={(open) => { setAiPanelOpen(open); if (!open) setAiSuggestions([]); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>✦ AI Hook Suggestions</DialogTitle>
            <p className="text-xs text-gray-500 mt-1">
              Pick a messaging angle and awareness stage to generate targeted hooks.
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Messaging Angle</label>
                <Select value={aiAngleId} onValueChange={(v) => { setAiAngleId(v); setAiSuggestions([]); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select angle" />
                  </SelectTrigger>
                  <SelectContent>
                    {messagingAngles.map((angle) => (
                      <SelectItem key={angle.id} value={angle.id}>
                        {angle.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Awareness Stage</label>
                <Select value={aiStage} onValueChange={(v) => { setAiStage(v as AwarenessStage); setAiSuggestions([]); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AWARENESS_STAGES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerateSuggestions}
              disabled={!aiAngleId || aiLoading}
              className="w-full"
            >
              {aiLoading ? "Generating..." : hasSuggestions ? "Regenerate" : "Generate Hooks"}
            </Button>

            {/* Suggestions list */}
            {hasSuggestions && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {aiSuggestions.length} suggestion{aiSuggestions.length !== 1 ? "s" : ""} for {aiStageName}
                  </p>
                  <button
                    onClick={handleAcceptAll}
                    disabled={aiLoading}
                    className="text-xs text-violet-600 hover:text-violet-800 font-medium disabled:opacity-40"
                  >
                    Accept all
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {aiSuggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-gray-50 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900 leading-relaxed flex-1">
                          {suggestion.content}
                        </p>
                        <button
                          onClick={() => handleAcceptSuggestion(suggestion, i)}
                          disabled={acceptingId === i}
                          className="shrink-0 rounded-md bg-black text-white px-2.5 py-1 text-xs font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                          {acceptingId === i ? "..." : "Add"}
                        </button>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                        {suggestion.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
