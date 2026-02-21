"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Section definitions ───────────────────────────────────────────────────────

type SectionItem = {
  key: string;
  label: string;
  description: string;
};

const SECTION_GROUPS: { group: string; items: SectionItem[] }[] = [
  {
    group: "Strategy",
    items: [
      {
        key: "organizingPrinciple",
        label: "Organizing Principle",
        description: "Strategic lens and rationale",
      },
      {
        key: "painAudienceMap",
        label: "Pain–Audience Map",
        description: "Which pains apply to each audience",
      },
      {
        key: "funnelMap",
        label: "Funnel Map",
        description: "Starred hooks by awareness stage",
      },
    ],
  },
  {
    group: "Reference",
    items: [
      {
        key: "audiences",
        label: "Audiences",
        description: "All defined audience profiles",
      },
      {
        key: "painDesires",
        label: "Pain Points & Desires",
        description: "All pain and desire entries",
      },
      {
        key: "messagingAngles",
        label: "Messaging Angles",
        description: "Angles grouped by intersection",
      },
      {
        key: "hooks",
        label: "Hooks",
        description: "All hooks with type and stage",
      },
    ],
  },
  {
    group: "Execution",
    items: [
      {
        key: "executionMatrix",
        label: "Execution Matrix",
        description: "Hook × format table with concept notes",
      },
    ],
  },
];

const ALL_SECTION_KEYS = SECTION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

// ── Component ─────────────────────────────────────────────────────────────────

interface ExportBriefModalProps {
  projectId: string;
}

export function ExportBriefModal({ projectId }: ExportBriefModalProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(ALL_SECTION_KEYS));
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const allSelected = selected.size === ALL_SECTION_KEYS.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(ALL_SECTION_KEYS));

  const handleOpen = (val: boolean) => {
    setOpen(val);
    if (val) setError(null);
  };

  const handleExport = async () => {
    if (selected.size === 0) return;
    setExporting(true);
    setError(null);
    try {
      const sections = [...selected].join(",");
      const url =
        `/api/export/brief?projectId=${encodeURIComponent(projectId)}` +
        `&sections=${encodeURIComponent(sections)}`;

      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Export failed (${res.status})`);
      }

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "brief.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {/* Sidebar trigger */}
      <button
        onClick={() => handleOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "9px 10px",
          borderRadius: 8,
          border: "1px solid var(--cse-border)",
          background: "transparent",
          cursor: "pointer",
          fontSize: 13,
          color: "var(--ink-2)",
          transition: "background .12s, border-color .12s",
          fontFamily: "inherit",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink-3)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--cse-border)";
        }}
      >
        <FileText size={14} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
        <span>Export Brief</span>
      </button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
            <DialogTitle
              className="text-sm font-semibold leading-tight"
              style={{
                fontFamily: "var(--font-hahmlet), serif",
                letterSpacing: "-0.02em",
              }}
            >
              Export Strategy Brief
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Choose sections to include in your PDF.
            </p>
          </DialogHeader>

          {/* Section list */}
          <div className="px-5 py-4 space-y-5 max-h-[58vh] overflow-y-auto">
            {/* Select all row */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                Sections
              </span>
              <button
                onClick={toggleAll}
                className="text-[11px] hover:underline transition-opacity"
                style={{ color: "var(--strike)" }}
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>

            {SECTION_GROUPS.map((group) => (
              <div key={group.group}>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1.5">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const checked = selected.has(item.key);
                    return (
                      <label
                        key={item.key}
                        className="flex items-start gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-accent/40 transition-colors"
                      >
                        {/* Hidden native checkbox for a11y */}
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => toggle(item.key)}
                        />
                        {/* Custom checkbox tick box */}
                        <div
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors",
                            checked
                              ? "border-[var(--strike)] bg-[var(--strike)]"
                              : "border-border bg-background"
                          )}
                        >
                          {checked && (
                            <svg viewBox="0 0 10 8" className="w-2.5 h-[7px]" fill="none">
                              <path
                                d="M1 4l2.5 2.5L9 1"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        {/* Label text */}
                        <div className="min-w-0">
                          <p
                            className="text-xs font-medium leading-tight"
                            style={{ color: "var(--ink)" }}
                          >
                            {item.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-border flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground shrink-0">
              {selected.size} / {ALL_SECTION_KEYS.length} sections
            </span>
            {error && (
              <span className="text-[11px] text-destructive truncate flex-1">{error}</span>
            )}
            <div className="flex gap-2 ml-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleOpen(false)}
                disabled={exporting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                style={{ backgroundColor: "var(--ink)", color: "var(--surface)" }}
                onClick={handleExport}
                disabled={selected.size === 0 || exporting}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
