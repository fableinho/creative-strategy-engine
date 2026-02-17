"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export const WIZARD_STEPS = [
  { key: "audiences", label: "Audiences", href: "" },
  { key: "pain-desires", label: "Pain & Desires", href: "/pain-desires" },
  { key: "angles", label: "Messaging Angles", href: "/angles" },
  { key: "hooks", label: "Hooks", href: "/hooks" },
  { key: "formats", label: "Format Executions", href: "/formats" },
] as const;

interface WizardSidebarProps {
  projectId: string;
  projectName: string;
  currentStep: number;
}

function getStepIndexFromPathname(pathname: string, basePath: string): number {
  if (pathname === basePath || pathname === `${basePath}/`) return 0;
  for (let i = WIZARD_STEPS.length - 1; i >= 1; i--) {
    if (pathname.startsWith(`${basePath}${WIZARD_STEPS[i].href}`)) return i;
  }
  return 0;
}

export function WizardSidebar({
  projectId,
  projectName,
  currentStep,
}: WizardSidebarProps) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  const persistStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex <= currentStep) return;

      const supabase = createClient();
      await supabase
        .from("projects")
        .update({ metadata: { current_step: stepIndex } })
        .eq("id", projectId);
    },
    [projectId, currentStep]
  );

  // Persist highest step reached on navigation
  useEffect(() => {
    const activeIndex = getStepIndexFromPathname(pathname, basePath);
    persistStep(activeIndex);
  }, [pathname, basePath, persistStep]);

  return (
    <aside className="w-64 shrink-0 border-r bg-gray-50/50 flex flex-col">
      <div className="p-5 border-b">
        <Link
          href="/dashboard"
          className="text-xs text-gray-400 hover:text-gray-600 mb-2 block"
        >
          &larr; Dashboard
        </Link>
        <h2 className="font-semibold text-sm text-gray-900 truncate">
          {projectName}
        </h2>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {WIZARD_STEPS.map((step, i) => {
            const stepPath = `${basePath}${step.href}`;
            const isActive =
              step.href === ""
                ? pathname === basePath || pathname === `${basePath}/`
                : pathname.startsWith(stepPath);
            const isCompleted = i < currentStep;

            return (
              <li key={step.key}>
                <Link
                  href={stepPath}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-white text-black font-medium shadow-sm"
                      : "text-gray-600 hover:bg-white hover:text-black"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-black text-white"
                        : isCompleted
                          ? "bg-black text-white"
                          : "border-2 border-gray-300 text-gray-500"
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span>{step.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
