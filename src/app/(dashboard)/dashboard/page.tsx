import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewProjectModal } from "@/components/new-project-modal";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";

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

  // Group projects by client
  const grouped = new Map<string, { client: { id: string; name: string }; projects: ProjectWithClient[] }>();

  for (const project of (projects as unknown as ProjectWithClient[]) ?? []) {
    const clientId = project.clients.id;
    if (!grouped.has(clientId)) {
      grouped.set(clientId, {
        client: project.clients,
        projects: [],
      });
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
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <NewProjectModal clients={clients}>
          <Button>New Project</Button>
        </NewProjectModal>
      </div>

      {clientGroups.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm">
            Create your first project to get started with creative strategy.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {clientGroups.map(({ client, projects }) => (
            <section key={client.id}>
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                {client.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    clientName={client.name}
                    status={project.status}
                    currentStep={
                      (project.metadata as { current_step?: number } | null)
                        ?.current_step ?? -1
                    }
                    updatedAt={project.updated_at}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
