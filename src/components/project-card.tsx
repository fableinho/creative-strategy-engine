"use client";

import Link from "next/link";
import { ProjectActions } from "@/components/project-actions";

const STEPS = [
  "Audiences",
  "Pain/Desires",
  "Angles",
  "Hooks",
  "Formats",
] as const;

interface ProjectCardProps {
  id: string;
  name: string;
  clientName: string;
  status: string;
  currentStep: number; // 0-4 index, or -1 for not started
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  in_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
};

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => (
        <div key={step} className="group relative flex items-center">
          <div
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i < currentStep
                ? "bg-black"
                : i === currentStep
                  ? "bg-black ring-2 ring-black/20"
                  : "bg-gray-200"
            }`}
          />
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProjectCard({
  id,
  name,
  clientName,
  status,
  currentStep,
  updatedAt,
}: ProjectCardProps) {
  const stepLabel =
    currentStep >= 0 && currentStep < STEPS.length
      ? STEPS[currentStep]
      : "Not started";

  return (
    <div className="relative rounded-lg border hover:border-gray-400 transition-colors">
      <div className="absolute top-3 right-3 z-10">
        <ProjectActions projectId={id} projectName={name} />
      </div>
      <Link href={`/projects/${id}`} className="block p-5">
        <div className="flex items-start justify-between mb-1 pr-8">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${statusColors[status] ?? "bg-gray-100 text-gray-700"}`}
          >
            {status.replace("_", " ")}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4">{clientName}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <StepProgress currentStep={currentStep} />
            <span className="text-xs text-gray-400">{stepLabel}</span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(updatedAt).toLocaleDateString()}
          </span>
        </div>
      </Link>
    </div>
  );
}
