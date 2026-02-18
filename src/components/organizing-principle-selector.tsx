"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";

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
    title: "Pain-First",
    subtitle: "Start with what hurts",
    description:
      "Identify the frustrations, fears, and obstacles your audience faces. Build messaging that agitates the problem before presenting your solution.",
    examples: [
      "\"Tired of wasting hours on manual reporting?\"",
      "\"Stop losing customers to slow load times\"",
      "\"The hidden cost of outdated software\"",
    ],
    color: "border-red-200 hover:border-red-400",
    activeColor: "border-red-500 bg-red-50/50",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" />
        <path d="M8 15s1.5-2 4-2 4 2 4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    key: "desire" as const,
    title: "Desire-First",
    subtitle: "Start with what they want",
    description:
      "Lead with aspirations, goals, and outcomes your audience dreams of. Build messaging that paints a picture of success and pulls them toward your solution.",
    examples: [
      "\"Imagine closing deals 3x faster\"",
      "\"What if your team could ship every week?\"",
      "\"The fastest path to 10K subscribers\"",
    ],
    color: "border-green-200 hover:border-green-400",
    activeColor: "border-green-500 bg-green-50/50",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
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
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-2">
          Choose Your Creative Approach
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          How do you want to build your messaging strategy? This shapes the
          order of your creative workflow.
        </p>
      </div>

      {productDescription && !aiRecommendation && (
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={handleGetRecommendation}
            disabled={aiLoading}
          >
            {aiLoading ? "Analyzing product..." : "Get AI Recommendation"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-8">
        {PRINCIPLES.map((principle) => {
          const isSelected = selected === principle.key;
          const isAiRecommended =
            aiRecommendation?.recommendation === principle.key;

          let cardClass: string;
          if (isAiRecommended && isSelected) {
            cardClass =
              "border-violet-500 bg-violet-50/60 border-dashed shadow-md shadow-violet-100";
          } else if (isAiRecommended && !isSelected) {
            cardClass =
              "border-violet-300 bg-violet-50/30 border-dashed hover:border-violet-400";
          } else if (isSelected) {
            cardClass = principle.activeColor;
          } else {
            cardClass = principle.color;
          }

          return (
            <button
              key={principle.key}
              type="button"
              onClick={() => setSelected(principle.key)}
              className={`relative text-left rounded-xl border-2 p-6 transition-all ${cardClass}`}
            >
              {isAiRecommended && (
                <div className="absolute -top-3 left-4 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    AI Recommended
                  </span>
                  <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                    {Math.round(aiRecommendation!.confidence * 100)}%
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <span className="text-gray-500">{principle.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold">{principle.title}</h2>
                  <p className="text-sm text-gray-500">{principle.subtitle}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {principle.description}
              </p>

              {isAiRecommended && aiRecommendation && (
                <div className="mb-4 rounded-md bg-violet-100/60 p-3">
                  <p className="text-xs text-violet-700 mb-1.5">
                    {aiRecommendation.rationale}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {aiRecommendation.keyFactors.map((factor) => (
                      <span
                        key={factor}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-200/70 text-violet-700"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Example hooks
                </p>
                {principle.examples.map((example) => (
                  <p
                    key={example}
                    className="text-sm text-gray-500 italic pl-3 border-l-2 border-gray-200"
                  >
                    {example}
                  </p>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {aiRecommendation && selected !== aiRecommendation.recommendation && (
        <p className="text-xs text-gray-400 mb-4">
          You&apos;re overriding the AI recommendation — that&apos;s totally fine!
        </p>
      )}

      <Button
        onClick={handleContinue}
        disabled={!selected || loading}
        size="lg"
      >
        {loading ? "Setting up..." : "Continue"}
      </Button>
    </div>
  );
}
