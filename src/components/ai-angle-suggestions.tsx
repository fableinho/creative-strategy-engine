"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AngleCandidate {
  title: string;
  description: string;
  tone: string;
}

interface AiAngleSuggestionsProps {
  projectId: string;
  painDesireId: string;
  audienceId: string;
}

export function AiAngleSuggestions({
  projectId,
  painDesireId,
  audienceId,
}: AiAngleSuggestionsProps) {
  const addMessagingAngle = useProjectStore((s) => s.addMessagingAngle);
  const messagingAngles = useProjectStore((s) => s.messagingAngles);

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<AngleCandidate[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTone, setEditTone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setDismissed(new Set());
    setEditingIndex(null);

    try {
      const res = await fetch("/api/ai/angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, painDesireId, audienceId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCandidates(data.angles ?? []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(candidate: AngleCandidate) {
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messaging_angles")
      .insert({
        project_id: projectId,
        pain_desire_id: painDesireId,
        audience_id: audienceId,
        title: candidate.title,
        description: candidate.description,
        tone: candidate.tone,
        is_ai_generated: true,
        sort_order: messagingAngles.length,
      } as any)
      .select()
      .single();

    if (!error && data) {
      addMessagingAngle(data);
      const idx = candidates.findIndex(
        (c) => c.title === candidate.title && c.description === candidate.description
      );
      if (idx >= 0) {
        setDismissed((prev) => new Set(prev).add(idx));
      }
    }
    setSaving(false);
  }

  function handleStartEdit(index: number) {
    const c = candidates[index];
    setEditingIndex(index);
    setEditTitle(c.title);
    setEditDesc(c.description);
    setEditTone(c.tone);
  }

  async function handleSaveEdit() {
    if (!editTitle.trim() || editingIndex === null) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messaging_angles")
      .insert({
        project_id: projectId,
        pain_desire_id: painDesireId,
        audience_id: audienceId,
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        tone: editTone.trim() || null,
        is_ai_generated: true,
        is_edited: true,
        sort_order: messagingAngles.length,
      } as any)
      .select()
      .single();

    if (!error && data) {
      addMessagingAngle(data);
      setDismissed((prev) => new Set(prev).add(editingIndex!));
      setEditingIndex(null);
    }
    setSaving(false);
  }

  const visibleCandidates = candidates.filter((_, i) => !dismissed.has(i));

  if (candidates.length === 0 || visibleCandidates.length === 0) {
    return (
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {loading ? "Generating angles..." : "Generate Angles with AI"}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {candidates.map((candidate, i) => {
        if (dismissed.has(i)) return null;
        const isEditing = editingIndex === i;

        if (isEditing) {
          return (
            <div
              key={i}
              className="rounded-md border border-violet-300 bg-violet-50/50 p-3 space-y-2"
            >
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Angle title"
                className="text-xs"
                autoFocus
              />
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description"
                rows={2}
                className="text-xs resize-none"
              />
              <Input
                value={editTone}
                onChange={(e) => setEditTone(e.target.value)}
                placeholder="Tone"
                className="text-xs"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim() || saving}
                  className="text-xs h-7"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingIndex(null)}
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={i}
            className="rounded-md border border-dashed border-violet-200 bg-violet-50/30 p-3"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800">
                  {candidate.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {candidate.description}
                </p>
                <span className="text-[10px] text-violet-500 mt-1 inline-block">
                  tone: {candidate.tone}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-violet-100">
              <button
                onClick={() => handleAccept(candidate)}
                disabled={saving}
                className="text-[11px] font-medium text-green-600 hover:text-green-700 disabled:text-gray-300"
              >
                Accept
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={() => handleStartEdit(i)}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={() =>
                  setDismissed((prev) => new Set(prev).add(i))
                }
                className="text-[11px] text-gray-400 hover:text-gray-600"
              >
                Dismiss
              </button>
              <div className="flex-1" />
              <span className="text-[9px] text-violet-400">AI suggested</span>
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-[11px] text-violet-500 hover:text-violet-700 disabled:text-gray-300"
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
      </div>
    </div>
  );
}
