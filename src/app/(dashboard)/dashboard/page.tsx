import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewProjectModal } from "@/components/new-project-modal";
import { ProjectCard } from "@/components/project-card";
import { NewClientProjectCard } from "@/components/new-client-project-card";

interface ProjectWithClient {
  id: string;
  name: string;
  description: string | null;
  status: string;
  organizing_principle: string;
  metadata: { current_step?: number } | null;
  updated_at: string;
  clients: {
    id: string;
    name: string;
  };
}

// Deterministic colour from client name
const CLIENT_COLORS = [
  "#d97706", "#7c3aed", "#0284c7", "#16a34a",
  "#dc2626", "#c2410c", "#0d9488", "#9333ea",
];
function clientColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return CLIENT_COLORS[Math.abs(hash) % CLIENT_COLORS.length];
}
function clientInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

async function getProjectsGroupedByClient() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      description,
      status,
      organizing_principle,
      metadata,
      updated_at,
      clients (id, name)
    `
    )
    .eq("owner_id", user.id)
    .in("status", ["draft", "active", "in_review"])
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const grouped = new Map<string, { client: { id: string; name: string }; projects: ProjectWithClient[] }>();

  for (const project of (projects as unknown as ProjectWithClient[]) ?? []) {
    const clientId = project.clients.id;
    if (!grouped.has(clientId)) {
      grouped.set(clientId, { client: project.clients, projects: [] });
    }
    grouped.get(clientId)!.projects.push(project);
  }

  return Array.from(grouped.values());
}

async function getClients() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, name")
    .eq("status", "active")
    .order("name");
  return data ?? [];
}

export default async function DashboardPage() {
  const [clientGroups, clients] = await Promise.all([
    getProjectsGroupedByClient(),
    getClients(),
  ]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.03em", lineHeight: 1.2 }}>
            Projects
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>
            Your active campaigns and creative briefs
          </p>
        </div>
        <NewProjectModal clients={clients}>
          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--ink)", color: "white",
              padding: "9px 18px", borderRadius: 10,
              fontSize: 14, fontWeight: 500,
              border: "none", cursor: "pointer",
              boxShadow: "var(--shadow-xs)",
              fontFamily: "inherit",
            }}
          >
            + New Project
          </button>
        </NewProjectModal>
      </div>

      {clientGroups.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 32px", color: "var(--ink-3)" }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: .5 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6 }}>No projects yet</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
            Create your first project to get started with creative strategy.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {clientGroups.map(({ client, projects }) => {
            const color = clientColor(client.name);
            const initials = clientInitials(client.name);
            return (
              <section key={client.id}>
                {/* Client header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "white",
                      letterSpacing: ".04em", flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.01em" }}>
                    {client.name}
                  </span>
                </div>

                {/* Project grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 12,
                    position: "relative",
                  }}
                >
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      clientName={client.name}
                      clientColor={color}
                      status={project.status}
                      currentStep={
                        (project.metadata as { current_step?: number } | null)
                          ?.current_step ?? -1
                      }
                      updatedAt={project.updated_at}
                    />
                  ))}

                  {/* New project card */}
                  <NewClientProjectCard clients={clients} clientName={client.name} />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
