"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/stores/project-store";
import { Textarea } from "@/components/ui/textarea";

export const LENS_DEFINITIONS = [
  {
    key: "desired_outcome",
    label: "Desired Outcome",
    placeholder: "What does success look like for this audience?",
  },
  {
    key: "objections",
    label: "Objections",
    placeholder: "What reasons might they have to say no?",
  },
  {
    key: "features_benefits",
    label: "Features & Benefits",
    placeholder: "Which features matter most and what benefits do they unlock?",
  },
  {
    key: "use_case",
    label: "Use Case",
    placeholder: "What specific scenario does this angle address?",
  },
  {
    key: "consequences",
    label: "Consequences",
    placeholder: "What happens if they don't act?",
  },
  {
    key: "misconceptions",
    label: "Misconceptions",
    placeholder: "What do they incorrectly believe about this space?",
  },
  {
    key: "education",
    label: "Education",
    placeholder: "What do they need to learn before they can buy?",
  },
  {
    key: "acceptance",
    label: "Acceptance",
    placeholder: "What must they accept or acknowledge to move forward?",
  },
  {
    key: "failed_solutions",
    label: "Failed Solutions",
    placeholder: "What have they already tried that didn't work?",
  },
  {
    key: "identity",
    label: "Identity",
    placeholder: "How does this relate to how they see themselves?",
  },
] as const;

export type LensKey = (typeof LENS_DEFINITIONS)[number]["key"];

export type Lenses = Partial<Record<LensKey, string>>;

interface AngleLensesProps {
  angleId: string;
  projectId: string;
  lenses: Lenses;
}

export function AngleLenses({ angleId, projectId, lenses }: AngleLensesProps) {
  const [expanded, setExpanded] = useState(false);
  const [localLenses, setLocalLenses] = useState<Lenses>(lenses);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [aiLoadingKey, setAiLoadingKey] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Record<string, string[]>>({});
  const [fillAllRunning, setFillAllRunning] = useState(false);
  const [fillAllProgress, setFillAllProgress] = useState<{
    current: number;
    total: number;
    currentLens: string;
  } | null>(null);
  const cancelRef = useRef(false);
  const updateMessagingAngle = useProjectStore((s) => s.updateMessagingAngle);

  const filledCount = LENS_DEFINITIONS.filter(
    (l) => localLenses[l.key]?.trim()
  ).length;

  async function handleBlur(key: LensKey, value: string) {
    const trimmed = value.trim();

    // Skip if unchanged
    if ((lenses[key] ?? "") === trimmed) return;

    setSavingKey(key);
    const updated = { ...localLenses, [key]: trimmed || undefined };

    // Remove empty keys
    const cleaned = Object.fromEntries(
      Object.entries(updated).filter(([, v]) => v)
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("messaging_angles")
      .update({ lenses: cleaned })
      .eq("id", angleId);

    if (!error) {
      updateMessagingAngle(angleId, { lenses: cleaned });
    }
    setSavingKey(null);
  }

  async function handleAiGenerate(key: LensKey) {
    setAiLoadingKey(key);

    try {
      const res = await fetch("/api/ai/step3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, angleId, lens: key }),
      });

      if (res.ok) {
        const data = await res.json();
        setCandidates((prev) => ({ ...prev, [key]: data.candidates ?? [] }));
      }
    } catch {
      // Silently fail
    } finally {
      setAiLoadingKey(null);
    }
  }

  function handlePickCandidate(key: LensKey, value: string) {
    setLocalLenses((prev) => ({ ...prev, [key]: value }));
    setCandidates((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    // Trigger save
    handleBlur(key, value);
  }

  const handleFillAll = useCallback(async () => {
    const emptyLenses = LENS_DEFINITIONS.filter(
      (l) => !localLenses[l.key]?.trim()
    );

    if (emptyLenses.length === 0) return;

    setFillAllRunning(true);
    cancelRef.current = false;
    setExpanded(true);

    let currentLenses = { ...localLenses };

    for (let i = 0; i < emptyLenses.length; i++) {
      if (cancelRef.current) break;

      const lens = emptyLenses[i];
      setFillAllProgress({
        current: i + 1,
        total: emptyLenses.length,
        currentLens: lens.label,
      });
      setAiLoadingKey(lens.key);

      try {
        const res = await fetch("/api/ai/step3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, angleId, lens: lens.key }),
        });

        if (cancelRef.current) break;

        if (res.ok) {
          const data = await res.json();
          const firstCandidate = data.candidates?.[0];

          if (firstCandidate) {
            // Auto-accept the first candidate
            currentLenses = { ...currentLenses, [lens.key]: firstCandidate };
            setLocalLenses((prev) => ({
              ...prev,
              [lens.key]: firstCandidate,
            }));

            // Save to DB
            const cleaned = Object.fromEntries(
              Object.entries(currentLenses).filter(([, v]) => v?.trim())
            );

            const supabase = createClient();
            await supabase
              .from("messaging_angles")
              .update({ lenses: cleaned })
              .eq("id", angleId);

            updateMessagingAngle(angleId, { lenses: cleaned });
          }
        }
      } catch {
        // Continue to next lens on error
      }

      setAiLoadingKey(null);
    }

    setFillAllRunning(false);
    setFillAllProgress(null);
    cancelRef.current = false;
  }, [angleId, projectId, localLenses, updateMessagingAngle]);

  function handleCancelFillAll() {
    cancelRef.current = true;
  }

  return (
    <div className="border-t">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            <path
              d="M4 2L8 6L4 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          10 Strategic Lenses
        </span>
        <span className="text-[10px] rounded-full bg-gray-100 px-2 py-0.5">
          {filledCount}/10
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Fill All button / progress */}
          {filledCount < 10 && (
            <div className="flex items-center gap-2">
              {fillAllRunning ? (
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-violet-600 flex items-center gap-1.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          className="animate-spin"
                        >
                          <circle
                            cx="6"
                            cy="6"
                            r="5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeDasharray="20"
                            strokeDashoffset="5"
                          />
                        </svg>
                        Filling: {fillAllProgress?.currentLens}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {fillAllProgress?.current}/{fillAllProgress?.total}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all duration-300"
                        style={{
                          width: `${((fillAllProgress?.current ?? 0) / (fillAllProgress?.total ?? 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCancelFillAll}
                    className="text-[10px] text-red-500 hover:text-red-700 shrink-0 px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleFillAll}
                  className="text-[11px] text-violet-500 hover:text-violet-700 flex items-center gap-1 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  Fill all empty lenses with AI ({10 - filledCount} remaining)
                </button>
              )}
            </div>
          )}
          {LENS_DEFINITIONS.map((lens) => {
            const isSaving = savingKey === lens.key;
            const isAiLoading = aiLoadingKey === lens.key;
            const lensCandidates = candidates[lens.key];

            return (
              <div key={lens.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-medium text-gray-600">
                      {lens.label}
                    </label>
                    {isSaving && (
                      <span className="text-[9px] text-gray-400">
                        Saving...
                      </span>
                    )}
                    {!isSaving && localLenses[lens.key]?.trim() && (
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAiGenerate(lens.key)}
                    disabled={isAiLoading}
                    className="text-[10px] text-violet-500 hover:text-violet-700 disabled:text-gray-300 transition-colors"
                  >
                    {isAiLoading ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <Textarea
                  value={localLenses[lens.key] ?? ""}
                  onChange={(e) =>
                    setLocalLenses((prev) => ({
                      ...prev,
                      [lens.key]: e.target.value,
                    }))
                  }
                  onBlur={(e) => handleBlur(lens.key, e.target.value)}
                  placeholder={lens.placeholder}
                  rows={2}
                  className="text-xs resize-none"
                />
                {lensCandidates && lensCandidates.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {lensCandidates.map((candidate, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePickCandidate(lens.key, candidate)}
                        className="w-full text-left rounded border border-dashed border-violet-200 bg-violet-50/40 px-3 py-2 text-[11px] text-gray-700 hover:border-violet-400 hover:bg-violet-50 transition-colors"
                      >
                        {candidate}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setCandidates((prev) => {
                          const updated = { ...prev };
                          delete updated[lens.key];
                          return updated;
                        })
                      }
                      className="text-[10px] text-gray-400 hover:text-gray-600"
                    >
                      Dismiss suggestions
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
