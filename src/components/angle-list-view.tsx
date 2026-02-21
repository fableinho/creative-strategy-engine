"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
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
      <div className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50/30 transition-colors">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />

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
    <div className="space-y-3">
      {intersections.map((intersection) => (
        <div
          key={intersection.linkId}
          className="rounded-lg border hover:border-gray-300 transition-colors overflow-hidden"
        >
          {/* Group header */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 border-b">
            <Badge
              variant={
                intersection.painDesireType === "pain"
                  ? "destructive"
                  : "default"
              }
              className="text-[9px]"
            >
              {intersection.painDesireType}
            </Badge>
            <span className="text-sm font-medium text-gray-900 truncate">
              {intersection.painDesireTitle}
            </span>
            <span className="text-xs text-gray-400 shrink-0">&times;</span>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-medium text-gray-600">
              {intersection.audienceName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 truncate">
              {intersection.audienceName}
            </span>
            <span className="ml-auto text-[10px] text-gray-400 shrink-0">
              {intersection.angles.length}{" "}
              {intersection.angles.length === 1 ? "angle" : "angles"}
            </span>
          </div>

          {/* Angle rows */}
          {intersection.angles.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No angles yet
            </p>
          ) : (
            <div>
              {intersection.angles.map((angle) => (
                <AngleRow
                  key={angle.id}
                  angle={angle}
                  projectId={projectId}
                />
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div className="border-t px-4 py-2 bg-white flex items-center gap-3">
            <button
              onClick={() =>
                onAddAngle(intersection.painDesireId, intersection.audienceId)
              }
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              + Add manually
            </button>
            <AiAngleSuggestions
              projectId={projectId}
              painDesireId={intersection.painDesireId}
              audienceId={intersection.audienceId}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
