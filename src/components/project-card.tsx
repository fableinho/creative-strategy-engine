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
  draft:     { background: "rgba(255,255,255,0.06)", color: "#94A3B8",  border: "rgba(255,255,255,0.08)" },
  active:    { background: "rgba(74,222,128,0.10)",  color: "#4ADE80",  border: "rgba(74,222,128,0.2)" },
  in_review: { background: "rgba(251,191,36,0.10)",  color: "#FBBF24",  border: "rgba(251,191,36,0.2)" },
  approved:  { background: "rgba(139,92,246,0.12)",  color: "#A78BFA",  border: "rgba(139,92,246,0.25)" },
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
  const color = clientColor ?? "rgba(139,92,246,0.6)";

  return (
    <div
      className="project-card-accent glass"
      style={{
        borderRadius: 16,
        transition: "all .2s",
        ["--client-color" as string]: color,
      }}
      onMouseOver={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "rgba(139,92,246,0.35)";
        el.style.boxShadow = "0 8px 32px rgba(124,58,237,0.15), 0 0 0 1px rgba(139,92,246,0.2)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseOut={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.boxShadow = "none";
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
            paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)",
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
