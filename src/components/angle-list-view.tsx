"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AngleLenses, type Lenses } from "@/components/angle-lenses";
import { AiAngleSuggestions } from "@/components/ai-angle-suggestions";
import type { Tables } from "@/types/database";

type MessagingAngle = Tables<"messaging_angles">;

export interface AngleListIntersection {
  linkId: string;
  painDesireId: string;
  painDesireTitle: string;
  painDesireType: "pain" | "desire";
  audienceId: string;
  audienceName: string;
  angles: MessagingAngle[];
}

interface AngleListViewProps {
  projectId: string;
  intersections: AngleListIntersection[];
  onAddAngle: (painDesireId: string, audienceId: string) => void;
}

function AngleRow({
  angle,
  projectId,
}: {
  angle: MessagingAngle;
  projectId: string;
}) {
  const [lensesOpen, setLensesOpen] = useState(false);

  const filledLensCount = angle.lenses
    ? Object.values(angle.lenses as Record<string, string>).filter(
        (v) => v?.trim()
      ).length
    : 0;

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors group">
        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900">{angle.title}</p>
            {angle.is_ai_generated && (
              <span className="text-[9px] text-violet-500 shrink-0">
                AI generated{angle.is_edited ? " · edited" : ""}
              </span>
            )}
          </div>
          {angle.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {angle.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {angle.tone && (
            <Badge variant="outline" className="text-[9px] font-normal">
              {angle.tone}
            </Badge>
          )}
          <button
            onClick={() => setLensesOpen((o) => !o)}
            className={`flex items-center gap-0.5 text-[10px] font-medium transition-colors ${
              lensesOpen
                ? "text-gray-700"
                : filledLensCount > 0
                ? "text-violet-500 hover:text-violet-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {lensesOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {filledLensCount > 0 ? `Lenses (${filledLensCount}/10)` : "Lenses"}
          </button>
        </div>
      </div>

      {lensesOpen && (
        <div className="border-t bg-gray-50/50">
          <AngleLenses
            angleId={angle.id}
            projectId={projectId}
            lenses={(angle.lenses as Lenses) ?? {}}
          />
        </div>
      )}
    </div>
  );
}

export function AngleListView({
  projectId,
  intersections,
  onAddAngle,
}: AngleListViewProps) {
  return (
    <div className="space-y-5">
      {intersections.map((intersection) => {
        const isPain = intersection.painDesireType === "pain";
        return (
          <div
            key={intersection.linkId}
            className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            {/* Header */}
            <div
              className={`flex items-center gap-2.5 px-4 py-3 border-b border-l-[3px] ${
                isPain
                  ? "border-l-rose-400 bg-rose-50/40"
                  : "border-l-violet-400 bg-violet-50/30"
              }`}
            >
              <Badge
                variant={isPain ? "destructive" : "default"}
                className="text-[9px] shrink-0"
              >
                {intersection.painDesireType}
              </Badge>
              <span className="text-sm font-semibold text-gray-900 truncate">
                {intersection.painDesireTitle}
              </span>
              <span className="text-xs text-gray-400 shrink-0">&times;</span>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 border border-gray-200 text-[9px] font-medium text-gray-600">
                {intersection.audienceName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-600 truncate">
                {intersection.audienceName}
              </span>
              <Badge
                variant="outline"
                className="ml-auto text-[9px] font-normal shrink-0 bg-white/60"
              >
                {intersection.angles.length}{" "}
                {intersection.angles.length === 1 ? "angle" : "angles"}
              </Badge>
            </div>

            {/* Angle rows */}
            {intersection.angles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center bg-gray-50/30">
                <Lightbulb className="h-6 w-6 text-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    No angles yet
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Generate with AI below, or add one manually.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white">
                {intersection.angles.map((angle) => (
                  <AngleRow
                    key={angle.id}
                    angle={angle}
                    projectId={projectId}
                  />
                ))}
              </div>
            )}

            {/* Actions footer */}
            <div className="border-t bg-gray-50/60 px-4 py-3">
              <AiAngleSuggestions
                projectId={projectId}
                painDesireId={intersection.painDesireId}
                audienceId={intersection.audienceId}
              />
              <button
                onClick={() =>
                  onAddAngle(intersection.painDesireId, intersection.audienceId)
                }
                className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add manually
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
