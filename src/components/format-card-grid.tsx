"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const FORMAT_CATEGORIES = [
  {
    key: "storytelling",
    label: "Storytelling",
    color: "bg-purple-50 border-purple-200",
    badgeColor: "bg-purple-100 text-purple-700",
    description: "Narrative-driven formats that pull readers in with a story arc",
  },
  {
    key: "before_after",
    label: "Before/After",
    color: "bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-700",
    description: "Transformation-focused formats showing the journey from problem to solution",
  },
  {
    key: "founder_story",
    label: "Founder Story",
    color: "bg-teal-50 border-teal-200",
    badgeColor: "bg-teal-100 text-teal-700",
    description: "Personal brand formats leveraging the founder's journey and credibility",
  },
  {
    key: "us_vs_them",
    label: "Us Vs Them",
    color: "bg-red-50 border-red-200",
    badgeColor: "bg-red-100 text-red-700",
    description: "Comparison formats that position against alternatives or the status quo",
  },
  {
    key: "social_proof",
    label: "Social Proof Mashup",
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "Credibility-stacking formats built around testimonials and results",
  },
] as const;

export type FormatCategoryKey = (typeof FORMAT_CATEGORIES)[number]["key"];

export interface FormatTemplate {
  id: string;
  category: FormatCategoryKey;
  name: string;
  description: string;
  structure: string;
}

const FORMAT_TEMPLATES: FormatTemplate[] = [
  // --- Storytelling (5) ---
  {
    id: "story-origin",
    category: "storytelling",
    name: "Origin Story",
    description: "How the product/idea came to be — the 'aha' moment",
    structure: "Setup → Inciting incident → Discovery → Resolution → CTA",
  },
  {
    id: "story-customer-journey",
    category: "storytelling",
    name: "Customer Journey",
    description: "A real customer's path from struggle to success",
    structure: "Meet [name] → Their struggle → Finding you → The result → CTA",
  },
  {
    id: "story-day-in-life",
    category: "storytelling",
    name: "Day in the Life",
    description: "Show how the product fits into daily routine",
    structure: "Morning without → Discovery moment → Evening with → Contrast → CTA",
  },
  {
    id: "story-unexpected-lesson",
    category: "storytelling",
    name: "Unexpected Lesson",
    description: "A surprising insight that reframes the problem",
    structure: "Conventional wisdom → The twist → New understanding → Application → CTA",
  },
  {
    id: "story-open-loop",
    category: "storytelling",
    name: "Open Loop Narrative",
    description: "Start mid-action to hook curiosity, then close the loop",
    structure: "In medias res → Backstory → Climax → Resolution → CTA",
  },

  // --- Before/After (5) ---
  {
    id: "ba-transformation",
    category: "before_after",
    name: "Full Transformation",
    description: "Vivid contrast between the old life and the new life",
    structure: "Paint the 'before' → Bridge moment → Paint the 'after' → How to get there → CTA",
  },
  {
    id: "ba-side-by-side",
    category: "before_after",
    name: "Side-by-Side Compare",
    description: "Two parallel scenarios running simultaneously",
    structure: "Without [product] → With [product] → Key differences → Social proof → CTA",
  },
  {
    id: "ba-time-machine",
    category: "before_after",
    name: "Time Machine",
    description: "Letter to past self or future projection",
    structure: "Dear past me → What I wish I knew → What changed → The result today → CTA",
  },
  {
    id: "ba-metrics-shift",
    category: "before_after",
    name: "Metrics Shift",
    description: "Hard numbers before and after, data-driven proof",
    structure: "Before metrics → The change → After metrics → Timeline → CTA",
  },
  {
    id: "ba-emotional-state",
    category: "before_after",
    name: "Emotional State Change",
    description: "Focus on feelings and mindset transformation",
    structure: "Frustration/fear → Turning point → Relief/confidence → Identity shift → CTA",
  },

  // --- Founder Story (4) ---
  {
    id: "founder-struggle",
    category: "founder_story",
    name: "The Struggle That Started It",
    description: "Personal pain that led to building the solution",
    structure: "My problem → Failed attempts → The breakthrough → Why I built this → CTA",
  },
  {
    id: "founder-contrarian",
    category: "founder_story",
    name: "Contrarian Bet",
    description: "Why the founder went against industry norms",
    structure: "What everyone does → Why I disagreed → The risk I took → The result → CTA",
  },
  {
    id: "founder-behind-scenes",
    category: "founder_story",
    name: "Behind the Scenes",
    description: "Transparent look at how decisions are made",
    structure: "The decision we faced → Our reasoning → What we chose → Why it matters to you → CTA",
  },
  {
    id: "founder-mission",
    category: "founder_story",
    name: "Mission Statement",
    description: "The 'why' behind the company, values-driven",
    structure: "What we believe → What we saw wrong → What we're building → Join us → CTA",
  },

  // --- Us Vs Them (4) ---
  {
    id: "uvt-old-way-new-way",
    category: "us_vs_them",
    name: "Old Way vs New Way",
    description: "Position your approach as the evolution",
    structure: "The old way (pain) → Why it's broken → The new way → Proof it works → CTA",
  },
  {
    id: "uvt-myth-buster",
    category: "us_vs_them",
    name: "Myth Buster",
    description: "Debunk a common belief, position as the truth-teller",
    structure: "Common belief → Why it's wrong → The real truth → Our approach → CTA",
  },
  {
    id: "uvt-category-comparison",
    category: "us_vs_them",
    name: "Category Comparison",
    description: "Compare entire categories, not just competitors",
    structure: "Category A problems → Category B problems → Our category → Why different → CTA",
  },
  {
    id: "uvt-hidden-cost",
    category: "us_vs_them",
    name: "Hidden Cost Expose",
    description: "Reveal what alternatives really cost (time, money, stress)",
    structure: "Surface cost → Hidden costs → True total → Our alternative → CTA",
  },

  // --- Social Proof Mashup (4) ---
  {
    id: "sp-testimonial-stack",
    category: "social_proof",
    name: "Testimonial Stack",
    description: "Layer multiple testimonials around a single theme",
    structure: "Bold claim → Proof 1 → Proof 2 → Proof 3 → Your turn → CTA",
  },
  {
    id: "sp-case-study-mini",
    category: "social_proof",
    name: "Mini Case Study",
    description: "Condensed success story with specific results",
    structure: "Client situation → Challenge → What we did → Results (numbers) → CTA",
  },
  {
    id: "sp-social-surge",
    category: "social_proof",
    name: "Social Surge",
    description: "Momentum-based proof — everyone is switching",
    structure: "Trend/movement → Who's joining → Why now → FOMO trigger → CTA",
  },
  {
    id: "sp-results-collage",
    category: "social_proof",
    name: "Results Collage",
    description: "Rapid-fire results from different customers",
    structure: "Result 1 → Result 2 → Result 3 → Pattern reveal → CTA",
  },
];

interface FormatCardGridProps {
  selected: Set<string>;
  onToggle: (formatId: string) => void;
}

export function FormatCardGrid({ selected, onToggle }: FormatCardGridProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {FORMAT_CATEGORIES.map((category) => {
        const formats = FORMAT_TEMPLATES.filter(
          (f) => f.category === category.key
        );
        const selectedInCategory = formats.filter((f) =>
          selected.has(f.id)
        ).length;
        const isExpanded =
          expandedCategory === category.key || expandedCategory === null;

        return (
          <div key={category.key}>
            {/* Category header */}
            <button
              type="button"
              onClick={() =>
                setExpandedCategory((prev) =>
                  prev === category.key ? null : category.key
                )
              }
              className="flex w-full items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {category.label}
                </h3>
                <span
                  className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${category.badgeColor}`}
                >
                  {selectedInCategory}/{formats.length}
                </span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              >
                <path
                  d="M3 5L7 9L11 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <p className="text-[11px] text-gray-400 -mt-2 mb-3">
              {category.description}
            </p>

            {/* Format cards grid */}
            {isExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {formats.map((format) => {
                  const isSelected = selected.has(format.id);
                  return (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => onToggle(format.id)}
                      className={`text-left rounded-lg border p-3 transition-all ${
                        isSelected
                          ? `${category.color} ring-2 ring-offset-1 ring-violet-400 shadow-sm`
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-semibold text-gray-800 leading-tight">
                          {format.name}
                        </h4>
                        <div
                          className={`shrink-0 mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-violet-500 border-violet-500"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M2 5L4 7L8 3"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug mb-2">
                        {format.description}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono leading-snug">
                        {format.structure}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { FORMAT_CATEGORIES, FORMAT_TEMPLATES };
