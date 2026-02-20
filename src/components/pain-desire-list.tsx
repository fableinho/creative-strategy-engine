"use client";

import { useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { PainDesireType } from "@/types/database";

interface PainDesireItemProps {
  id: string;
  type: PainDesireType;
  title: string;
  description: string | null;
  intensity: number | null;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title: string; description: string | null; intensity: number | null }) => void;
}

function PainDesireItem({
  id,
  type,
  title,
  description,
  intensity,
  onDelete,
  onUpdate,
}: PainDesireItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description ?? "");
  const [editIntensity, setEditIntensity] = useState(intensity ?? 5);

  function handleSave() {
    onUpdate(id, {
      title: editTitle.trim(),
      description: editDesc.trim() || null,
      intensity: editIntensity,
    });
    setEditing(false);
  }

  function handleCancel() {
    setEditTitle(title);
    setEditDesc(description ?? "");
    setEditIntensity(intensity ?? 5);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Title"
          autoFocus
        />
        <Textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Intensity:</label>
          <input
            type="range"
            min={1}
            max={10}
            value={editIntensity}
            onChange={(e) => setEditIntensity(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs font-medium w-5 text-center">
            {editIntensity}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 rounded-lg border p-4 hover:border-gray-300 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant={type === "pain" ? "destructive" : "default"}
            className="text-[10px]"
          >
            {type}
          </Badge>
          {intensity && (
            <span className="text-[10px] text-gray-400">
              intensity {intensity}/10
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-gray-700 px-1.5 py-0.5"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(id)}
          className="text-xs text-gray-400 hover:text-red-600 px-1.5 py-0.5"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

interface PainDesireListProps {
  projectId: string;
  type: PainDesireType;
}

const CONFIG = {
  pain: {
    heading: "Pain Points",
    subheading: "What problems does your audience face?",
    placeholder: 'e.g. "Wasting hours on manual data entry"',
    emptyText: "No pain points yet. Add your first one above.",
  },
  desire: {
    heading: "Desires",
    subheading: "What does your audience aspire to?",
    placeholder: 'e.g. "Automate workflows and save 10hrs/week"',
    emptyText: "No desires yet. Add your first one above.",
  },
} as const;

export function PainDesireList({ projectId, type }: PainDesireListProps) {
  const painDesires = useProjectStore((s) => s.painDesires);
  const addPainDesire = useProjectStore((s) => s.addPainDesire);
  const updatePainDesire = useProjectStore((s) => s.updatePainDesire);
  const removePainDesire = useProjectStore((s) => s.removePainDesire);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIntensity, setNewIntensity] = useState(5);

  const items = painDesires.filter((pd) => pd.type === type);
  const cfg = CONFIG[type];

  async function handleAdd() {
    if (!newTitle.trim()) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("pain_desires")
      .insert({
        project_id: projectId,
        type,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        intensity: newIntensity,
        sort_order: painDesires.length,
      } as any)
      .select()
      .single();

    if (!error && data) {
      addPainDesire(data);
      setNewTitle("");
      setNewDesc("");
      setNewIntensity(5);
      setAdding(false);
    }
  }

  async function handleUpdate(
    id: string,
    data: { title: string; description: string | null; intensity: number | null }
  ) {
    const previous = painDesires.find((pd) => pd.id === id);
    updatePainDesire(id, data);

    const supabase = createClient();
    const { error } = await (supabase
      .from("pain_desires") as any)
      .update(data)
      .eq("id", id);

    if (error && previous) {
      updatePainDesire(id, {
        title: previous.title,
        description: previous.description,
        intensity: previous.intensity,
      });
    }
  }

  async function handleDelete(id: string) {
    const previous = painDesires.find((pd) => pd.id === id);
    removePainDesire(id);

    const supabase = createClient();
    const { error } = await supabase
      .from("pain_desires")
      .delete()
      .eq("id", id);

    if (error && previous) {
      addPainDesire(previous);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{cfg.heading}</h2>
          <p className="text-sm text-gray-500">{cfg.subheading}</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}>
          + Add
        </Button>
      </div>

      {adding && (
        <div className="rounded-lg border border-dashed p-4 space-y-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={cfg.placeholder}
            autoFocus
          />
          <Textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Intensity:</label>
            <input
              type="range"
              min={1}
              max={10}
              value={newIntensity}
              onChange={(e) => setNewIntensity(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-medium w-5 text-center">
              {newIntensity}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setNewTitle("");
                setNewDesc("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {cfg.heading} ({items.length})
          </h3>
          {items.map((pd) => (
            <PainDesireItem
              key={pd.id}
              id={pd.id}
              type={pd.type}
              title={pd.title}
              description={pd.description}
              intensity={pd.intensity}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {items.length === 0 && !adding && (
        <div className="text-center py-10 text-gray-400 text-sm">
          {cfg.emptyText}
        </div>
      )}
    </div>
  );
}
