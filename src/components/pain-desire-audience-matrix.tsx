"use client";

import { useProjectStore } from "@/stores/project-store";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

interface MatrixProps {
  projectId: string;
}

export function PainDesireAudienceMatrix({ projectId }: MatrixProps) {
  const painDesires = useProjectStore((s) => s.painDesires);
  const audiences = useProjectStore((s) => s.audiences);
  const links = useProjectStore((s) => s.painDesireAudiences);
  const addLink = useProjectStore((s) => s.addPainDesireAudience);
  const removeLink = useProjectStore((s) => s.removePainDesireAudience);

  function isLinked(painDesireId: string, audienceId: string) {
    return links.some(
      (l) =>
        l.pain_desire_id === painDesireId && l.audience_id === audienceId
    );
  }

  function getLink(painDesireId: string, audienceId: string) {
    return links.find(
      (l) =>
        l.pain_desire_id === painDesireId && l.audience_id === audienceId
    );
  }

  async function handleToggle(painDesireId: string, audienceId: string) {
    const existing = getLink(painDesireId, audienceId);
    const supabase = createClient();

    if (existing) {
      // Optimistic remove
      removeLink(existing.id);

      const { error } = await supabase
        .from("pain_desire_audiences")
        .delete()
        .eq("id", existing.id);

      if (error) {
        addLink(existing);
      }
    } else {
      // Create link — need server ID
      const { data, error } = await supabase
        .from("pain_desire_audiences")
        .insert({
          pain_desire_id: painDesireId,
          audience_id: audienceId,
          sort_order: links.length,
        })
        .select()
        .single();

      if (!error && data) {
        addLink(data);
      }
    }
  }

  if (painDesires.length === 0 || audiences.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-400">
        {painDesires.length === 0 && audiences.length === 0
          ? "Add pain points/desires and audiences above to create connections."
          : painDesires.length === 0
            ? "Add pain points or desires to create connections."
            : "Add audiences to create connections."}
      </div>
    );
  }

  const pains = painDesires.filter((pd) => pd.type === "pain");
  const desires = painDesires.filter((pd) => pd.type === "desire");
  const grouped = [
    ...(pains.length > 0 ? [{ label: "Pain Points", items: pains }] : []),
    ...(desires.length > 0 ? [{ label: "Desires", items: desires }] : []),
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">Connections</h2>
        <p className="text-sm text-gray-500">
          Link pain points and desires to their relevant audiences.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide min-w-[180px]">
                Pain / Desire
              </th>
              {audiences.map((audience) => (
                <th
                  key={audience.id}
                  className="text-center py-2 px-3 font-medium text-gray-500 text-xs uppercase tracking-wide min-w-[100px]"
                >
                  <span className="block truncate max-w-[100px]">
                    {audience.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) => (
              <>
                <tr key={`header-${group.label}`}>
                  <td
                    colSpan={audiences.length + 1}
                    className="pt-4 pb-1 text-[10px] font-medium text-gray-400 uppercase tracking-widest"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.items.map((pd) => (
                  <tr
                    key={pd.id}
                    className="border-t border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            pd.type === "pain" ? "destructive" : "default"
                          }
                          className="text-[9px] shrink-0"
                        >
                          {pd.type}
                        </Badge>
                        <span className="text-sm text-gray-900 truncate">
                          {pd.title}
                        </span>
                      </div>
                    </td>
                    {audiences.map((audience) => {
                      const linked = isLinked(pd.id, audience.id);

                      return (
                        <td key={audience.id} className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(pd.id, audience.id)}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded transition-all ${
                              linked
                                ? "bg-black text-white shadow-sm"
                                : "border border-gray-200 text-transparent hover:border-gray-400"
                            }`}
                            aria-label={`${linked ? "Unlink" : "Link"} "${pd.title}" and "${audience.name}"`}
                          >
                            {linked && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                              >
                                <path
                                  d="M3 7L6 10L11 4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-400">
        {links.length} connection{links.length !== 1 ? "s" : ""} mapped
      </div>
    </div>
  );
}
