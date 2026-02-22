"use client";

import Link from "next/link";
import { ProjectActions } from "@/components/project-actions";

const STEPS = [
  "Audiences",
  "Pain & Desires",
  "Angles",
  "Hooks",
  "Formats",
] as const;

interface ProjectCardProps {
  id: string;
  name: string;
  clientName: string;
  clientColor?: string;
  status: string;
  currentStep: number; // 0-4 index, or -1 for not started
  updatedAt: string;
}

const statusStyles: Record<string, { background: string; color: string; border: string }> = {
  draft:     { background: "#e8e7e2", color: "#63635d", border: "transparent" },
  active:    { background: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  in_review: { background: "#fef3c7", color: "#d97706", border: "#fcd34d" },
  approved:  { background: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
};

function SegmentedProgress({ currentStep }: { currentStep: number }) {
  return (
    <div>
      <div className="progress-bar-wrap" style={{ marginBottom: 6 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`progress-bar-seg ${i < currentStep ? "done" : i === currentStep ? "active" : ""}`}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>
        {currentStep >= 0 && currentStep < STEPS.length
          ? `Step ${currentStep + 1} of 5 — ${STEPS[currentStep]}`
          : "Not started"}
      </span>
    </div>
  );
}

export function ProjectCard({
  id,
  name,
  clientName,
  clientColor,
  status,
  currentStep,
  updatedAt,
}: ProjectCardProps) {
  const st = statusStyles[status] ?? statusStyles.draft;
  const color = clientColor ?? "#a8a39a";

  return (
    <div
      className="project-card-accent"
      style={{
        background: "white",
        border: "1px solid var(--cse-border)",
        borderRadius: 16,
        boxShadow: "var(--shadow-xs)",
        transition: "all .2s",
        // CSS custom prop for the accent bar color
        ["--client-color" as string]: color,
      }}
      onMouseOver={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--cse-border-2)";
        el.style.boxShadow = "var(--shadow-md)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseOut={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--cse-border)";
        el.style.boxShadow = "var(--shadow-xs)";
        el.style.transform = "none";
      }}
    >
      {/* Actions sit outside the Link */}
      <div style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}>
        <ProjectActions projectId={id} projectName={name} />
      </div>

      <Link href={`/projects/${id}`} style={{ display: "block", padding: 20, textDecoration: "none" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, paddingRight: 32 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.02em", lineHeight: 1.3 }}>
              {name}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{clientName}</div>
          </div>
          <span
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "2px 8px", borderRadius: 100,
              fontSize: 11, fontWeight: 500, letterSpacing: ".02em",
              background: st.background, color: st.color,
              border: `1px solid ${st.border}`,
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            {status.replace("_", " ")}
          </span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 14 }}>
          <SegmentedProgress currentStep={currentStep} />
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingTop: 12, borderTop: "1px solid var(--surface-2)",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
            {new Date(updatedAt).toLocaleDateString("de-DE")}
          </span>
        </div>
      </Link>
    </div>
  );
}
