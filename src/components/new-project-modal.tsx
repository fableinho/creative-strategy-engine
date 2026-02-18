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
            <Label htmlFor="description">Product / Service Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're marketing..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
