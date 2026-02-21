"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface NewProjectModalProps {
  clients: Client[];
  children: React.ReactNode;
}

export function NewProjectModal({ clients, children }: NewProjectModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [showNewClient, setShowNewClient] = useState(clients.length === 0);
  const [newClientName, setNewClientName] = useState("");

  function resetForm() {
    setName("");
    setDescription("");
    setSelectedClientId("");
    setNewClientName("");
    setShowNewClient(clients.length === 0);
    setError(null);
    setAiLoading(false);
  }

  // AI button is enabled once we have a project name + a client (either selected or typed)
  const canGenerateAI =
    name.trim().length > 0 &&
    (showNewClient
      ? newClientName.trim().length > 0
      : selectedClientId.length > 0);

  async function handleGenerateDescription() {
    if (!canGenerateAI) return;
    setAiLoading(true);
    setError(null);

    const clientName = showNewClient
      ? newClientName.trim()
      : (clients.find((c) => c.id === selectedClientId)?.name ?? "");

    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: name.trim(), clientName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to generate description");
      }

      const { description: generated } = await res.json();
      setDescription(generated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate description"
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      let clientId = selectedClientId;

      if (showNewClient) {
        if (!newClientName.trim()) {
          setError("Client name is required");
          setLoading(false);
          return;
        }

        const { data: newClientData, error: clientError } = await supabase
          .from("clients")
          .insert({ name: newClientName.trim(), owner_id: user.id } as any)
          .select("id")
          .single();

        if (clientError) throw clientError;
        const newClient = newClientData as any;
        clientId = newClient.id;
      }

      if (!clientId) {
        setError("Please select or create a client");
        setLoading(false);
        return;
      }

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          client_id: clientId,
          owner_id: user.id,
        } as any)
        .select("id")
        .single();

      if (projectError) throw projectError;
      const project = projectData as any;

      setOpen(false);
      resetForm();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 Brand Campaign"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            {!showNewClient && clients.length > 0 ? (
              <div className="space-y-2">
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => setShowNewClient(true)}
                  className="text-sm text-gray-500 hover:text-black underline"
                >
                  + Create new client
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client name"
                />
                {clients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewClient(false);
                      setNewClientName("");
                    }}
                    className="text-sm text-gray-500 hover:text-black underline"
                  >
                    Select existing client
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Product / Brand Description</Label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!canGenerateAI || aiLoading}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color: canGenerateAI && !aiLoading ? "#C8502A" : undefined,
                }}
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {aiLoading ? "Writing…" : "Write with AI"}
              </button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product or brand being marketed…"
              rows={3}
            />
            {!canGenerateAI && (
              <p className="text-xs text-gray-400">
                Enter a project name and client first to enable AI writing.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || aiLoading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
