"use client";

import { Badge } from "@/components/ui/badge";
import { AngleLenses, type Lenses } from "@/components/angle-lenses";
import { AiAngleSuggestions } from "@/components/ai-angle-suggestions";
import type { Tables } from "@/types/database";

type MessagingAngle = Tables<"messaging_angles">;

interface IntersectionCardProps {
  projectId: string;
  painDesireId: string;
  painDesireTitle: string;
  painDesireType: "pain" | "desire";
  audienceId: string;
  audienceName: string;
  angles: MessagingAngle[];
  onAddAngle: (painDesireId: string, audienceId: string) => void;
}

export function IntersectionCard({
  projectId,
  painDesireId,
  painDesireTitle,
  painDesireType,
  audienceId,
  audienceName,
  angles,
  onAddAngle,
}: IntersectionCardProps) {
  return (
    <div className="rounded-lg border hover:border-gray-300 transition-colors overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant={painDesireType === "pain" ? "destructive" : "default"}
            className="text-[9px]"
          >
            {painDesireType}
          </Badge>
          <span className="text-[10px] text-gray-400">&times;</span>
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-medium text-gray-600">
            {audienceName.charAt(0).toUpperCase()}
          </div>
        </div>
        <p className="text-sm font-medium text-gray-900 leading-tight">
          {painDesireTitle}
        </p>
        <p className="text-xs text-gray-500">{audienceName}</p>
      </div>

      {/* Angles list */}
      <div className="px-4 py-3">
        {angles.length > 0 ? (
          <div className="space-y-2">
            {angles.map((angle) => (
              <div key={angle.id} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-xs font-medium">
                    {angle.title}
                  </p>
                  {angle.description && (
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                      {angle.description}
                    </p>
                  )}
                  {angle.is_ai_generated && (
                    <span className="text-[9px] text-violet-500">
                      AI generated
                      {angle.is_edited ? " · edited" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">
            No angles yet
          </p>
        )}

        <button
          onClick={() => onAddAngle(painDesireId, audienceId)}
          className="mt-3 w-full rounded-md border border-dashed border-gray-200 py-1.5 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + Add manually
        </button>

        <AiAngleSuggestions
          projectId={projectId}
          painDesireId={painDesireId}
          audienceId={audienceId}
        />
      </div>

      {/* Lenses for each angle */}
      {angles.map((angle) => (
        <AngleLenses
          key={`lenses-${angle.id}`}
          angleId={angle.id}
          projectId={projectId}
          lenses={(angle.lenses as Lenses) ?? {}}
        />
      ))}
    </div>
  );
}
