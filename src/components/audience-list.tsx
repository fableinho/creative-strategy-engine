"use client";

import { useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AudienceItemProps {
  id: string;
  name: string;
  description: string | null;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { name: string; description: string | null }) => void;
}

function AudienceItem({
  id,
  name,
  description,
  onDelete,
  onUpdate,
}: AudienceItemProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDesc, setEditDesc] = useState(description ?? "");

  function handleSave() {
    onUpdate(id, {
      name: editName.trim(),
      description: editDesc.trim() || null,
    });
    setEditing(false);
  }

  function handleCancel() {
    setEditName(name);
    setEditDesc(description ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Audience name"
          autoFocus
        />
        <Textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
        />
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{name}</p>
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

interface AudienceListProps {
  projectId: string;
}

export function AudienceList({ projectId }: AudienceListProps) {
  const audiences = useProjectStore((s) => s.audiences);
  const addAudience = useProjectStore((s) => s.addAudience);
  const updateAudience = useProjectStore((s) => s.updateAudience);
  const removeAudience = useProjectStore((s) => s.removeAudience);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  async function handleAdd() {
    if (!newName.trim()) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("audiences")
      .insert({
        project_id: projectId,
        name: newName.trim(),
        description: newDesc.trim() || null,
        sort_order: audiences.length,
      } as any)
      .select()
      .single();

    if (!error && data) {
      addAudience(data);
      setNewName("");
      setNewDesc("");
      setAdding(false);
    }
  }

  async function handleUpdate(
    id: string,
    data: { name: string; description: string | null }
  ) {
    const previous = audiences.find((a) => a.id === id);
    updateAudience(id, data);

    const supabase = createClient();
    const { error } = await (supabase
      .from("audiences") as any)
      .update(data)
      .eq("id", id);

    if (error && previous) {
      updateAudience(id, {
        name: previous.name,
        description: previous.description,
      });
    }
  }

  async function handleDelete(id: string) {
    const previous = audiences.find((a) => a.id === id);
    removeAudience(id);

    const supabase = createClient();
    const { error } = await supabase
      .from("audiences")
      .delete()
      .eq("id", id);

    if (error && previous) {
      addAudience(previous);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Audiences</h2>
          <p className="text-sm text-gray-500">
            Who are you trying to reach?
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}>
          + Add
        </Button>
      </div>

      {adding && (
        <div className="rounded-lg border border-dashed p-4 space-y-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder='e.g. "SaaS Founders" or "Marketing Managers"'
            autoFocus
          />
          <Textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setNewName("");
                setNewDesc("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {audiences.map((audience) => (
          <AudienceItem
            key={audience.id}
            id={audience.id}
            name={audience.name}
            description={audience.description}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {audiences.length === 0 && !adding && (
        <div className="text-center py-10 text-gray-400 text-sm">
          No audiences yet. Add your first one above.
        </div>
      )}
    </div>
  );
}
