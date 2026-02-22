import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WizardSidebar } from "@/components/wizard-sidebar";
import { ProjectHydrator } from "@/components/project-hydrator";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: projectData, error } = await supabase
    .from("projects")
    .select("id, name, metadata, clients (id, name)")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  const project = projectData as any;

  if (error || !project) notFound();

  const currentStep =
    (project.metadata as { current_step?: number } | null)?.current_step ?? 0;

  const clientName: string = project.clients?.name ?? "";

  return (
    <div style={{ display: "flex", height: "calc(100vh - 76px)" }}>
      <WizardSidebar
        projectId={project.id}
        projectName={project.name}
        clientName={clientName}
        currentStep={currentStep}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <ProjectHydrator projectId={project.id}>
            {children}
          </ProjectHydrator>
        </div>
      </main>
    </div>
  );
}
