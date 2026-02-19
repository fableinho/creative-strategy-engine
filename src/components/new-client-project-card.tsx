"use client";

import { NewProjectModal } from "@/components/new-project-modal";

interface Client {
  id: string;
  name: string;
}

interface NewClientProjectCardProps {
  clients: Client[];
  clientName: string;
}

export function NewClientProjectCard({ clients, clientName }: NewClientProjectCardProps) {
  return (
    <NewProjectModal clients={clients}>
      <div className="new-client-project-card">
        <span style={{ fontSize: 18 }}>+</span>
        New project for {clientName}
      </div>
    </NewProjectModal>
  );
}
