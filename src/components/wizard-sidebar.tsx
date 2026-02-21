"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExportBriefModal } from "@/components/export-brief-modal";

export const WIZARD_STEPS = [
  { key: "audiences",    label: "Creative Approach",  href: "" },
  { key: "pain-desires", label: "Pain & Desires",     href: "/pain-desires" },
  { key: "angles",       label: "Messaging Angles",   href: "/angles" },
  { key: "hooks",        label: "Hooks",              href: "/hooks" },
  { key: "formats",      label: "Format Executions",  href: "/formats" },
] as const;

interface WizardSidebarProps {
  projectId: string;
  projectName: string;
  clientName?: string;
  currentStep: number;
}

function getStepIndexFromPathname(pathname: string, basePath: string): number {
  if (pathname === basePath || pathname === `${basePath}/`) return 0;
  for (let i = WIZARD_STEPS.length - 1; i >= 1; i--) {
    if (pathname.startsWith(`${basePath}${WIZARD_STEPS[i].href}`)) return i;
  }
  return 0;
}

// Deterministic colour from client name (matches dashboard logic)
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

export function WizardSidebar({
  projectId,
  projectName,
  clientName = "",
  currentStep,
}: WizardSidebarProps) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  const persistStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex <= currentStep) return;

      const supabase = createClient();
      await (supabase
        .from("projects") as any)
        .update({ metadata: { current_step: stepIndex } })
        .eq("id", projectId);
    },
    [projectId, currentStep]
  );

  useEffect(() => {
    const activeIndex = getStepIndexFromPathname(pathname, basePath);
    persistStep(activeIndex);
  }, [pathname, basePath, persistStep]);

  const color = clientName ? clientColor(clientName) : "#a8a39a";
  const initials = clientName ? clientInitials(clientName) : "";

  return (
    <aside
      style={{
        width: 220, flexShrink: 0,
        background: "white",
        borderRight: "1px solid var(--cse-border)",
        padding: "24px 0",
        position: "sticky", top: 52,
        height: "calc(100vh - 52px)",
        overflowY: "auto",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Project info header */}
      <div
        style={{
          padding: "0 20px 20px",
          borderBottom: "1px solid var(--cse-border)",
          marginBottom: 16,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--ink-3)", marginBottom: 12,
            textDecoration: "none",
          }}
          onMouseOver={e => (e.currentTarget.style.color = "var(--ink-2)")}
          onMouseOut={e => (e.currentTarget.style.color = "var(--ink-3)")}
        >
          ← Dashboard
        </Link>

        {clientName && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "white",
                letterSpacing: ".04em", flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{clientName}</span>
          </div>
        )}

        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.02em" }}>
          {projectName}
        </div>
      </div>

      {/* Steps nav */}
      <nav style={{ padding: "0 12px", flex: 1 }}>
        {WIZARD_STEPS.map((step, i) => {
          const stepPath = `${basePath}${step.href}`;
          const isActive =
            step.href === ""
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname.startsWith(stepPath);
          const isCompleted = i < currentStep;

          return (
            <Link
              key={step.key}
              href={stepPath}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 10,
                marginBottom: 2,
                border: isActive ? "1px solid var(--cse-border)" : "1px solid transparent",
                background: isActive ? "var(--surface-2)" : "none",
                textDecoration: "none",
                transition: "all .15s",
              }}
              onMouseOver={e => {
                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface)";
              }}
              onMouseOut={e => {
                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "none";
              }}
            >
              {/* Step indicator circle */}
              <span
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isCompleted && !isActive ? 10 : 11,
                  fontWeight: 600, flexShrink: 0,
                  background: isActive || isCompleted ? "var(--ink)" : "white",
                  border: isActive || isCompleted ? "1.5px solid var(--ink)" : "1.5px solid var(--cse-border)",
                  color: isActive || isCompleted ? "white" : "var(--ink-3)",
                }}
              >
                {isCompleted && !isActive ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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

              <span
                style={{
                  fontSize: 13,
                  color: isActive ? "var(--ink)" : "var(--ink-2)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {step.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Export footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--cse-border)",
        }}
      >
        <ExportBriefModal projectId={projectId} />
      </div>
    </aside>
  );
}
