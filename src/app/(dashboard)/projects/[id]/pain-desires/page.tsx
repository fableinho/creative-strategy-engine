"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { createClient } from "@/lib/supabase/client";
import { PainDesireList } from "@/components/pain-desire-list";
import { AudienceList } from "@/components/audience-list";
import { PainDesireAudienceMatrix } from "@/components/pain-desire-audience-matrix";
import {
  PainDesireSuggestionsPanel,
  AudienceSuggestionsPanel,
} from "@/components/ai-suggestions-panel";
import { Button } from "@/components/ui/button";

interface PainDesireSuggestion {
  title: string;
  description: string;
  intensity: number;
}

interface AudienceSuggestion {
  name: string;
  description: string;
}

export default function PainDesiresPage() {
  const params = useParams();
  const projectId = params.id as string;

  const projectName = useProjectStore((s) => s.projectName);
  const addPainDesire = useProjectStore((s) => s.addPainDesire);
  const addAudience = useProjectStore((s) => s.addAudience);
  const painDesires = useProjectStore((s) => s.painDesires);
  const audiences = useProjectStore((s) => s.audiences);
  const links = useProjectStore((s) => s.painDesireAudiences);

  const [aiLoading, setAiLoading] = useState(false);
  const [painSuggestions, setPainSuggestions] = useState<
    PainDesireSuggestion[]
  >([]);
  const [desireSuggestions, setDesireSuggestions] = useState<
    PainDesireSuggestion[]
  >([]);
  const [audienceSuggestions, setAudienceSuggestions] = useState<
    AudienceSuggestion[]
  >([]);

  async function handleGenerateSuggestions() {
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription: projectName,
          projectId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPainSuggestions(data.pains ?? []);
        setDesireSuggestions(data.desires ?? []);
        setAudienceSuggestions(data.audiences ?? []);
      }
    } catch {
      // Silently fail
    } finally {
      setAiLoading(false);
    }
  }

  async function acceptPainDesire(
    suggestion: PainDesireSuggestion,
    type: "pain" | "desire"
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pain_desires")
      .insert({
        project_id: projectId,
        type,
        title: suggestion.title,
        description: suggestion.description,
        intensity: suggestion.intensity,
        sort_order: painDesires.length,
      } as any)
      .select()
      .single();

    if (!error && data) {
      addPainDesire(data);
    }
  }

  async function acceptAllPainDesires(
    suggestions: PainDesireSuggestion[],
    type: "pain" | "desire"
  ) {
    const supabase = createClient();
    const rows = suggestions.map((s, i) => ({
      project_id: projectId,
      type,
      title: s.title,
      description: s.description,
      intensity: s.intensity,
      sort_order: painDesires.length + i,
    }));

    const { data, error } = await supabase
      .from("pain_desires")
      .insert(rows)
      .select();

    if (!error && data) {
      data.forEach((pd) => addPainDesire(pd));
    }
  }

  async function acceptAudience(suggestion: AudienceSuggestion) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("audiences")
      .insert({
        project_id: projectId,
        name: suggestion.name,
        description: suggestion.description,
        sort_order: audiences.length,
      } as any)
      .select()
      .single();

    if (!error && data) {
      addAudience(data);
    }
  }

  async function acceptAllAudiences(suggestions: AudienceSuggestion[]) {
    const supabase = createClient();
    const rows = suggestions.map((s, i) => ({
      project_id: projectId,
      name: s.name,
      description: s.description,
      sort_order: audiences.length + i,
    }));

    const { data, error } = await supabase
      .from("audiences")
      .insert(rows)
      .select();

    if (!error && data) {
      data.forEach((a) => addAudience(a));
    }
  }

  const hasSuggestions =
    painSuggestions.length > 0 ||
    desireSuggestions.length > 0 ||
    audienceSuggestions.length > 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pain Points & Desires</h1>
          <p className="text-gray-500 text-sm">
            Map your audience&apos;s pain points and desires. These will fuel
            your messaging angles in the next step.
          </p>
        </div>
        {!hasSuggestions && (
          <Button
            variant="outline"
            onClick={handleGenerateSuggestions}
            disabled={aiLoading}
            className="shrink-0"
          >
            {aiLoading ? "Generating..." : "AI Suggest"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Pain Points & Desires */}
        <div className="space-y-4">
          <PainDesireList projectId={projectId} />

          {painSuggestions.length > 0 && (
            <PainDesireSuggestionsPanel
              suggestions={painSuggestions}
              type="pain"
              onAccept={(s) => acceptPainDesire(s, "pain")}
              onAcceptAll={(s) => acceptAllPainDesires(s, "pain")}
              onDismissAll={() => setPainSuggestions([])}
            />
          )}

          {desireSuggestions.length > 0 && (
            <PainDesireSuggestionsPanel
              suggestions={desireSuggestions}
              type="desire"
              onAccept={(s) => acceptPainDesire(s, "desire")}
              onAcceptAll={(s) => acceptAllPainDesires(s, "desire")}
              onDismissAll={() => setDesireSuggestions([])}
            />
          )}
        </div>

        {/* Right column: Audiences */}
        <div className="space-y-4">
          <AudienceList projectId={projectId} />

          {audienceSuggestions.length > 0 && (
            <AudienceSuggestionsPanel
              suggestions={audienceSuggestions}
              onAccept={acceptAudience}
              onAcceptAll={acceptAllAudiences}
              onDismissAll={() => setAudienceSuggestions([])}
            />
          )}
        </div>
      </div>

      {/* Connection matrix */}
      <div className="mt-10 pt-8 border-t">
        <PainDesireAudienceMatrix projectId={projectId} />
      </div>

      {/* Intersection count badge */}
      {links.length > 0 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-white shadow-lg">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-sm font-medium">
              {links.length} messaging angle{links.length !== 1 ? "s" : ""}{" "}
              unlocked
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
