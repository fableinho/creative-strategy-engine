"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/stores/project-store";

interface ProjectHydratorProps {
  projectId: string;
  children: React.ReactNode;
}

export function ProjectHydrator({ projectId, children }: ProjectHydratorProps) {
  const hydrate = useProjectStore((s) => s.hydrate);
  const reset = useProjectStore((s) => s.reset);
  const isHydrated = useProjectStore((s) => s.isHydrated);
  const isLoading = useProjectStore((s) => s.isLoading);
  const storeProjectId = useProjectStore((s) => s.projectId);

  useEffect(() => {
    hydrate(projectId);

    return () => {
      // Reset store when leaving the project
      if (storeProjectId === projectId) {
        reset();
      }
    };
  }, [projectId, hydrate, reset, storeProjectId]);

  if (!isHydrated || isLoading || storeProjectId !== projectId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-400">Loading project data...</div>
      </div>
    );
  }

  return <>{children}</>;
}
