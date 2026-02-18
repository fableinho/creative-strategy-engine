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

export default function HooksPage() {
  const params = useParams();
  const projectId = params.id as string;

  const messagingAngles = useProjectStore((s) => s.messagingAngles);
  const hooks = useProjectStore((s) => s.hooks);
  const addHook = useProjectStore((s) => s.addHook);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetStage, setTargetStage] = useState<AwarenessStage>("unaware");
  const [selectedAngleId, setSelectedAngleId] = useState("");
  const [hookType, setHookType] = useState("question");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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

    // Count existing hooks in this stage for sort_order
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

  const stageName =
    AWARENESS_STAGES.find((s) => s.key === targetStage)?.label ?? "";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Hooks</h1>
        <p className="text-gray-500 text-sm">
          Create hooks for each awareness stage. Move prospects through
          Unaware → Most Aware with targeted messaging.
        </p>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Hook</DialogTitle>
            <p className="text-xs text-gray-500 mt-1">
              Stage: {stageName}
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Messaging Angle</label>
              <Select
                value={selectedAngleId}
                onValueChange={setSelectedAngleId}
              >
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
    </div>
  );
}
