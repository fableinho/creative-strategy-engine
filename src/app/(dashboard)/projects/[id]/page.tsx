import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrganizingPrincipleSelector } from "@/components/organizing-principle-selector";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: projectData, error } = await supabase
    .from("projects")
    .select("id, name, description, status, organizing_principle, metadata")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  const project = projectData as any;

  if (error || !project) notFound();

  const metadata = project.metadata as {
    organizing_approach?: string;
  } | null;

  if (!metadata?.organizing_approach) {
    return (
      <OrganizingPrincipleSelector
        projectId={project.id}
        productDescription={project.description}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      {project.description && (
        <p className="text-gray-500 mb-6">{project.description}</p>
      )}
      <div className="rounded-lg border p-6 text-center text-gray-400">
        <p>Audiences step content will be rendered here.</p>
        <p className="text-xs mt-2">
          Approach: {metadata.organizing_approach}-first
        </p>
      </div>
    </div>
  );
}
