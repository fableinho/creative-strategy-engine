"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/project-store";

interface AiRecommendation {
  recommendation: "pain" | "desire";
  confidence: number;
  rationale: string;
  productCategory: string;
  keyFactors: string[];
}

interface OrganizingPrincipleSelectorProps {
  projectId: string;
  productDescription?: string | null;
}

const PRINCIPLES = [
  {
    key: "pain" as const,
    badge: "Pain-First",
    badgeStyle: {
      background: "var(--cse-red-bg)",
      color: "var(--cse-red)",
      border: "1px solid var(--cse-red-border)",
    },
    title: "Lead with the ache.",
    subtitle: "Problem first. Product second.",
    description:
      "People are actively searching for a solution to a specific, felt problem. They know something is wrong — they just need the fix.",
    question: '"What problem are people Googling right now?"',
    examples: [
      '"Tired of wasting hours on manual reporting?"',
      '"Stop losing customers to slow load times"',
      '"The hidden cost of outdated software"',
    ],
    glowColor: "rgba(248,113,113,0.08)",
    selectedClass: "selected-pain",
  },
  {
    key: "desire" as const,
    badge: "Desire-First",
    badgeStyle: {
      background: "var(--cse-green-bg)",
      color: "var(--cse-green)",
      border: "1px solid var(--cse-green-border)",
    },
    title: "Lead with the pull.",
    subtitle: "Identity first. Product second.",
    description:
      "People aren't searching for a fix — they're drawn to an identity, aesthetic, or aspiration. Lead with the vision, then introduce the product as the vehicle.",
    question: '"What lifestyle or identity does this product unlock?"',
    examples: [
      '"Imagine closing deals 3x faster"',
      '"What if your team could ship every week?"',
      '"The fastest path to 10K subscribers"',
    ],
    glowColor: "rgba(74,222,128,0.08)",
    selectedClass: "selected-desire",
  },
] as const;

export function OrganizingPrincipleSelector({
  projectId,
  productDescription,
}: OrganizingPrincipleSelectorProps) {
  const [selected, setSelected] = useState<"pain" | "desire" | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] =
    useState<AiRecommendation | null>(null);
  const router = useRouter();
  const setOrganizingApproach = useProjectStore((s) => s.setOrganizingApproach);

  async function handleGetRecommendation() {
    if (!productDescription?.trim()) return;
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productDescription, projectId }),
      });

      if (res.ok) {
        const data: AiRecommendation = await res.json();
        setAiRecommendation(data);
        setSelected(data.recommendation);
      }
    } catch {
      // Silently fail — user can still pick manually
    } finally {
      setAiLoading(false);
    }
  }

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);

    let rationale: string | null = null;
    if (aiRecommendation) {
      const isOverride = selected !== aiRecommendation.recommendation;
      rationale = isOverride
        ? `User chose ${selected}-first (overriding AI recommendation of ${aiRecommendation.recommendation}-first). AI rationale: ${aiRecommendation.rationale}`
        : `AI recommended ${selected}-first (${Math.round(aiRecommendation.confidence * 100)}% confidence). ${aiRecommendation.rationale}`;
    } else {
      rationale = `User manually selected ${selected}-first approach.`;
    }

    const supabase = createClient();
    const { error } = await (supabase
      .from("projects") as any)
      .update({
        organizing_principle: selected === "pain" ? "audience" : "product",
        principle_rationale: rationale,
        metadata: {
          current_step: 0,
          organizing_approach: selected,
          ai_recommendation: aiRecommendation
            ? {
                recommendation: aiRecommendation.recommendation,
                confidence: aiRecommendation.confidence,
                rationale: aiRecommendation.rationale,
                product_category: aiRecommendation.productCategory,
                key_factors: aiRecommendation.keyFactors,
              }
            : null,
        },
      })
      .eq("id", projectId);

    if (!error) {
      setOrganizingApproach(selected);
      router.push(`/projects/${projectId}/pain-desires`);
    }
    setLoading(false);
  }

  return (
    <div>
      {/* Step header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 11, fontWeight: 600, letterSpacing: ".1em",
            textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10,
          }}
        >
          Step 1 of 5
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: 38, color: "var(--ink)",
            letterSpacing: "-.02em", lineHeight: 1.15, marginBottom: 12,
          }}
        >
          Where does the spark start?
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.65, maxWidth: 560 }}>
          Every product gets found one of two ways. Get this right and everything downstream clicks.
        </p>
      </div>

      {/* AI banner */}
      {aiRecommendation ? (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: 16, padding: "14px 18px",
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 18, flexShrink: 0, color: "#A78BFA" }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>
              AI Recommendation — {Math.round(aiRecommendation.confidence * 100)}% confidence
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
              {aiRecommendation.rationale}
              {selected !== aiRecommendation.recommendation && (
                <span style={{ color: "var(--ink-3)", marginLeft: 6 }}>
                  (You&apos;re overriding this — that&apos;s totally fine!)
                </span>
              )}
            </div>
          </div>
        </div>
      ) : productDescription ? (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: 16, padding: "14px 18px",
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 18, flexShrink: 0, color: "#A78BFA" }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>
              AI has a read on this.
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
              Apply the suggestion or override it.
            </div>
          </div>
          <button
            onClick={handleGetRecommendation}
            disabled={aiLoading}
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.08)", color: "var(--ink)",
              padding: "8px 16px", borderRadius: 10,
              fontSize: 13, fontWeight: 500, border: "1px solid rgba(255,255,255,0.12)",
              cursor: aiLoading ? "not-allowed" : "pointer",
              boxShadow: "var(--shadow-xs)", fontFamily: "inherit",
              opacity: aiLoading ? 0.6 : 1,
            }}
          >
            {aiLoading ? "Analysing…" : "Apply"}
          </button>
        </div>
      ) : null}

      {/* Choice cards */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 16, marginBottom: 32,
        }}
      >
        {PRINCIPLES.map((p) => {
          const isSelected = selected === p.key;
          const isAiRecommended = aiRecommendation?.recommendation === p.key;

          return (
            <div
              key={p.key}
              className="choice-card-glow glass"
              onClick={() => setSelected(p.key)}
              style={{
                border: isSelected
                  ? "2px solid rgba(139,92,246,0.5)"
                  : "2px solid rgba(255,255,255,0.08)",
                borderRadius: 24, padding: 28,
                cursor: "pointer",
                transition: "all .2s",
                position: "relative", overflow: "hidden",
                background: isSelected
                  ? "rgba(139,92,246,0.08)"
                  : "rgba(255,255,255,0.04)",
                boxShadow: isSelected
                  ? "0 8px 32px rgba(124,58,237,0.15), 0 0 0 1px rgba(139,92,246,0.15)"
                  : "none",
                ["--glow-color" as string]: p.glowColor,
              } as React.CSSProperties}
              onMouseOver={e => {
                const el = e.currentTarget as HTMLDivElement;
                if (!isSelected) {
                  el.style.borderColor = "rgba(139,92,246,0.3)";
                  el.style.background = "rgba(139,92,246,0.05)";
                }
                el.style.transform = "translateY(-2px)";
              }}
              onMouseOut={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = isSelected ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)";
                el.style.background = isSelected ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.04)";
                el.style.transform = "none";
              }}
            >
              {/* Animated checkmark */}
              <div
                style={{
                  position: "absolute", top: 20, right: 20,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 12,
                  opacity: isSelected ? 1 : 0,
                  transform: isSelected ? "scale(1)" : "scale(0.6)",
                  transition: "all .2s",
                }}
              >
                ✓
              </div>

              {/* Badge */}
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 10px", borderRadius: 100,
                  fontSize: 11, fontWeight: 600, letterSpacing: ".04em",
                  textTransform: "uppercase", marginBottom: 16,
                  ...p.badgeStyle,
                }}
              >
                {p.badge}
                {isAiRecommended && (
                  <span
                    style={{
                      marginLeft: 4, background: "#7c3aed", color: "white",
                      borderRadius: 100, padding: "1px 6px", fontSize: 10,
                    }}
                  >
                    AI pick
                  </span>
                )}
              </div>

              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 4, letterSpacing: "-.02em" }}>
                {p.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16 }}>{p.subtitle}</div>

              <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 20 }}>
                {p.description}
              </div>

              {/* Quote block */}
              <div
                style={{
                  fontSize: 12, fontWeight: 600, color: "var(--ink)",
                  fontStyle: "italic", padding: "10px 14px",
                  background: "rgba(255,255,255,0.04)", borderRadius: 8,
                  borderLeft: "3px solid rgba(139,92,246,0.4)",
                  marginBottom: 16,
                }}
              >
                {p.question}
              </div>

              {/* Example hooks */}
              <div
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
                  textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8,
                }}
              >
                Example hooks
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {p.examples.map((ex) => (
                  <div
                    key={ex}
                    style={{
                      fontSize: 12, color: "var(--ink-2)", fontStyle: "italic",
                      padding: "6px 10px", borderRadius: 6,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      lineHeight: 1.4,
                    }}
                  >
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action bar */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div />
        <button
          className="btn-neon"
          onClick={handleContinue}
          disabled={!selected || loading}
          style={{
            color: "white",
            padding: "9px 20px", borderRadius: 10,
            fontSize: 14, fontWeight: 500,
            opacity: selected && !loading ? 1 : 0.4,
            fontFamily: "inherit",
          }}
        >
          {loading ? "Setting up…" : "Lock it in →"}
        </button>
      </div>
    </div>
  );
}
