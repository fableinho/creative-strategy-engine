"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { createClient } from "@/lib/supabase/client";
import { IntersectionCard } from "@/components/intersection-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AnglesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const painDesires = useProjectStore((s) => s.painDesires);
  const audiences = useProjectStore((s) => s.audiences);
  const links = useProjectStore((s) => s.painDesireAudiences);
  const messagingAngles = useProjectStore((s) => s.messagingAngles);
  const addMessagingAngle = useProjectStore((s) => s.addMessagingAngle);

  // Add angle dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetPainDesireId, setTargetPainDesireId] = useState<string | null>(
    null
  );
  const [targetAudienceId, setTargetAudienceId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTone, setNewTone] = useState("");
  const [saving, setSaving] = useState(false);

  function handleOpenAddAngle(painDesireId: string, audienceId: string) {
    setTargetPainDesireId(painDesireId);
    setTargetAudienceId(audienceId);
    setNewTitle("");
    setNewDesc("");
    setNewTone("");
    setDialogOpen(true);
  }

  async function handleSaveAngle() {
    if (!newTitle.trim() || !targetPainDesireId || !targetAudienceId) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messaging_angles")
      .insert({
        project_id: projectId,
        pain_desire_id: targetPainDesireId,
        audience_id: targetAudienceId,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        tone: newTone.trim() || null,
        sort_order: messagingAngles.length,
      })
      .select()
      .single();

    if (!error && data) {
      addMessagingAngle(data);
      setDialogOpen(false);
    }
    setSaving(false);
  }

  // Build intersection data from junction table
  const intersections = links.map((link) => {
    const pd = painDesires.find((p) => p.id === link.pain_desire_id);
    const audience = audiences.find((a) => a.id === link.audience_id);
    const angles = messagingAngles.filter(
      (a) =>
        a.pain_desire_id === link.pain_desire_id &&
        a.audience_id === link.audience_id
    );

    return {
      linkId: link.id,
      painDesireId: link.pain_desire_id,
      painDesireTitle: pd?.title ?? "Unknown",
      painDesireType: (pd?.type ?? "pain") as "pain" | "desire",
      audienceId: link.audience_id,
      audienceName: audience?.name ?? "Unknown",
      angles,
    };
  });

  // Get target names for dialog header
  const targetPd = painDesires.find((p) => p.id === targetPainDesireId);
  const targetAudience = audiences.find((a) => a.id === targetAudienceId);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Messaging Angles</h1>
        <p className="text-gray-500 text-sm">
          Each card represents a pain/desire × audience intersection. Add
          messaging angles to each combination.
        </p>
      </div>

      {intersections.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-400 mb-2">No intersections found.</p>
          <p className="text-sm text-gray-400">
            Go back to Pain &amp; Desires and connect pain points to audiences
            to unlock messaging angles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {intersections.map((intersection) => (
            <IntersectionCard
              key={intersection.linkId}
              projectId={projectId}
              painDesireId={intersection.painDesireId}
              painDesireTitle={intersection.painDesireTitle}
              painDesireType={intersection.painDesireType}
              audienceId={intersection.audienceId}
              audienceName={intersection.audienceName}
              angles={intersection.angles}
              onAddAngle={handleOpenAddAngle}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Messaging Angle</DialogTitle>
            {targetPd && targetAudience && (
              <p className="text-xs text-gray-500 mt-1">
                {targetPd.title} × {targetAudience.name}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Angle Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='e.g. "Time savings for busy founders"'
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="How this angle connects the pain/desire to the audience..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Input
                value={newTone}
                onChange={(e) => setNewTone(e.target.value)}
                placeholder='e.g. "urgent", "empathetic", "aspirational"'
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveAngle}
                disabled={!newTitle.trim() || saving}
              >
                {saving ? "Saving..." : "Add Angle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
