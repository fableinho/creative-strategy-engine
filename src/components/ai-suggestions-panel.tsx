"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Suggestion {
  title: string;
  description: string;
  intensity?: number;
}

interface AudienceSuggestion {
  name: string;
  description: string;
}

interface AiSuggestionsPanelProps<T> {
  suggestions: T[];
  label: string;
  onAccept: (suggestion: T) => void;
  onAcceptAll: (suggestions: T[]) => void;
  onDismissAll: () => void;
  renderLabel: (suggestion: T) => string;
  renderDetail?: (suggestion: T) => string | null;
}

function AiSuggestionsPanel<T>({
  suggestions,
  label,
  onAccept,
  onAcceptAll,
  onDismissAll,
  renderLabel,
  renderDetail,
}: AiSuggestionsPanelProps<T>) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visible = suggestions.filter((_, i) => !dismissed.has(i));

  if (visible.length === 0) return null;

  function handleDismiss(index: number) {
    setDismissed((prev) => new Set(prev).add(index));
  }

  function handleAcceptAll() {
    onAcceptAll(visible);
    setDismissed(new Set(suggestions.map((_, i) => i)));
  }

  function handleDismissAll() {
    setDismissed(new Set(suggestions.map((_, i) => i)));
    onDismissAll();
  }

  return (
    <div className="rounded-lg border border-dashed border-violet-300 bg-violet-50/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-violet-500"
          >
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
          <span className="text-xs font-medium text-violet-600">
            AI Suggestions — {label}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleAcceptAll}
            className="text-[11px] px-2 py-0.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            Accept all
          </button>
          <button
            onClick={handleDismissAll}
            className="text-[11px] px-2 py-0.5 rounded-full border border-violet-300 text-violet-600 hover:bg-violet-100 transition-colors"
          >
            Dismiss all
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => {
          if (dismissed.has(i)) return null;

          const detail = renderDetail?.(suggestion);

          return (
            <div
              key={i}
              className="group relative inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white pl-3 pr-1 py-1 text-sm text-gray-700 hover:border-violet-400 transition-colors cursor-pointer"
              onClick={() => {
                onAccept(suggestion);
                handleDismiss(i);
              }}
              title={detail ?? undefined}
            >
              <span className="text-xs">{renderLabel(suggestion)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(i);
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 2L8 8M8 2L2 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Exported typed wrappers

interface PainDesireSuggestionsPanelProps {
  suggestions: Suggestion[];
  type: "pain" | "desire";
  onAccept: (suggestion: Suggestion) => void;
  onAcceptAll: (suggestions: Suggestion[]) => void;
  onDismissAll: () => void;
}

export function PainDesireSuggestionsPanel({
  suggestions,
  type,
  onAccept,
  onAcceptAll,
  onDismissAll,
}: PainDesireSuggestionsPanelProps) {
  return (
    <AiSuggestionsPanel
      suggestions={suggestions}
      label={type === "pain" ? "Pain Points" : "Desires"}
      onAccept={onAccept}
      onAcceptAll={onAcceptAll}
      onDismissAll={onDismissAll}
      renderLabel={(s) => s.title}
      renderDetail={(s) =>
        s.description ? `${s.description} (intensity: ${s.intensity}/10)` : null
      }
    />
  );
}

interface AudienceSuggestionsPanelProps {
  suggestions: AudienceSuggestion[];
  onAccept: (suggestion: AudienceSuggestion) => void;
  onAcceptAll: (suggestions: AudienceSuggestion[]) => void;
  onDismissAll: () => void;
}

export function AudienceSuggestionsPanel({
  suggestions,
  onAccept,
  onAcceptAll,
  onDismissAll,
}: AudienceSuggestionsPanelProps) {
  return (
    <AiSuggestionsPanel
      suggestions={suggestions}
      label="Audiences"
      onAccept={onAccept}
      onAcceptAll={onAcceptAll}
      onDismissAll={onDismissAll}
      renderLabel={(s) => s.name}
      renderDetail={(s) => s.description}
    />
  );
}
