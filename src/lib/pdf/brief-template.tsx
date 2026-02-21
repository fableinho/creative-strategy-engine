import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BriefAudience {
  name: string;
  description: string | null;
}

export interface BriefPainDesire {
  type: "pain" | "desire";
  title: string;
  description: string | null;
  intensity: number | null;
}

export interface BriefAngle {
  title: string;
  description: string | null;
  tone: string | null;
  painDesireTitle: string;
  painDesireType: "pain" | "desire";
  audienceName: string;
  is_ai_generated: boolean;
}

export interface BriefHook {
  content: string;
  type: string;
  awareness_stage: string;
  is_starred: boolean;
  is_ai_generated: boolean;
  angleName: string;
}

export interface BriefFormat {
  template_id: string | null;
  concept_notes: string | null;
  hookContent: string;
}

export interface BriefData {
  projectName: string;
  projectDescription: string | null;
  generatedAt: string;
  audiences: BriefAudience[];
  painDesires: BriefPainDesire[];
  angles: BriefAngle[];
  hooks: BriefHook[];
  formats: BriefFormat[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  unaware: "Unaware",
  problem_aware: "Problem Aware",
  solution_aware: "Solution Aware",
  product_aware: "Product Aware",
  most_aware: "Most Aware",
};

const HOOK_TYPE_LABELS: Record<string, string> = {
  question: "Question",
  statistic: "Statistic",
  story: "Story",
  contradiction: "Contradiction",
  challenge: "Challenge",
  metaphor: "Metaphor",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const c = {
  black: "#0A0A0A",
  gray700: "#374151",
  gray500: "#6B7280",
  gray400: "#9CA3AF",
  gray200: "#E5E7EB",
  gray100: "#F3F4F6",
  gray50: "#F9FAFB",
  rose: "#E11D48",
  roseLight: "#FFF1F2",
  violet: "#7C3AED",
  violetLight: "#F5F3FF",
  amber: "#D97706",
  amberLight: "#FFFBEB",
  white: "#FFFFFF",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: c.black,
    paddingTop: 52,
    paddingBottom: 52,
    paddingLeft: 48,
    paddingRight: 48,
    backgroundColor: c.white,
  },

  // Cover
  coverLabel: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: c.gray400,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 28,
    color: c.black,
    lineHeight: 1.15,
    marginBottom: 10,
  },
  coverDescription: {
    fontSize: 10,
    color: c.gray500,
    lineHeight: 1.6,
    maxWidth: 440,
    marginBottom: 24,
  },
  coverMeta: {
    fontSize: 8,
    color: c.gray400,
  },
  coverDivider: {
    borderBottomWidth: 1,
    borderBottomColor: c.gray200,
    marginTop: 28,
    marginBottom: 32,
  },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: c.gray400,
  },
  sectionLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: c.gray200,
    marginTop: 4,
  },
  sectionGap: {
    marginBottom: 28,
  },

  // Cards / Rows
  card: {
    borderWidth: 1,
    borderColor: c.gray200,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: c.white,
  },
  cardTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: c.black,
    marginBottom: 3,
  },
  cardBody: {
    fontSize: 9,
    color: c.gray500,
    lineHeight: 1.55,
  },

  // Badges
  badge: {
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  badgeText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  badgePain: {
    backgroundColor: c.roseLight,
  },
  badgePainText: {
    color: c.rose,
  },
  badgeDesire: {
    backgroundColor: c.violetLight,
  },
  badgeDesireText: {
    color: c.violet,
  },
  badgeStage: {
    backgroundColor: c.gray100,
  },
  badgeStageText: {
    color: c.gray500,
  },
  badgeType: {
    backgroundColor: c.amberLight,
  },
  badgeTypeText: {
    color: c.amber,
  },

  // Angle group
  intersectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    marginTop: 4,
  },
  intersectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: c.gray700,
  },
  intersectionSep: {
    fontSize: 9,
    color: c.gray400,
  },
  intersectionAudience: {
    fontSize: 9,
    color: c.gray500,
  },

  // Hook rows
  hookRow: {
    borderLeftWidth: 2,
    borderLeftColor: c.gray200,
    paddingLeft: 10,
    marginBottom: 8,
  },
  hookRowStarred: {
    borderLeftColor: c.amber,
  },
  hookContent: {
    fontSize: 9,
    color: c.black,
    lineHeight: 1.55,
    marginBottom: 4,
  },
  hookMeta: {
    flexDirection: "row",
    gap: 6,
  },

  // Format entries
  formatEntry: {
    backgroundColor: c.gray50,
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
  },
  formatHookRef: {
    fontSize: 8,
    color: c.gray400,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  formatNotes: {
    fontSize: 9,
    color: c.gray700,
    lineHeight: 1.6,
  },

  // Tone tag
  toneTag: {
    fontSize: 8,
    color: c.violet,
    fontFamily: "Helvetica-Oblique",
  },

  // Empty
  emptyText: {
    fontSize: 9,
    color: c.gray400,
    fontFamily: "Helvetica-Oblique",
  },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionLabel}>{label}</Text>
      <View style={s.sectionLine} />
    </View>
  );
}

function PainDesireBadge({ type }: { type: "pain" | "desire" }) {
  return (
    <View style={[s.badge, type === "pain" ? s.badgePain : s.badgeDesire]}>
      <Text style={[s.badgeText, type === "pain" ? s.badgePainText : s.badgeDesireText]}>
        {type}
      </Text>
    </View>
  );
}

function HookTypeBadge({ label }: { label: string }) {
  return (
    <View style={[s.badge, s.badgeType]}>
      <Text style={[s.badgeText, s.badgeTypeText]}>{label}</Text>
    </View>
  );
}

function StageBadge({ label }: { label: string }) {
  return (
    <View style={[s.badge, s.badgeStage]}>
      <Text style={[s.badgeText, s.badgeStageText]}>{label}</Text>
    </View>
  );
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function BriefDocument({ data }: { data: BriefData }) {
  const painsOnly = data.painDesires.filter((p) => p.type === "pain");
  const desiresOnly = data.painDesires.filter((p) => p.type === "desire");

  // Group angles by intersection key
  const angleGroups = data.angles.reduce<Record<string, BriefAngle[]>>(
    (acc, angle) => {
      const key = `${angle.painDesireTitle}__${angle.audienceName}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(angle);
      return acc;
    },
    {}
  );

  // Group hooks by angleName
  const hookGroups = data.hooks.reduce<Record<string, BriefHook[]>>(
    (acc, hook) => {
      if (!acc[hook.angleName]) acc[hook.angleName] = [];
      acc[hook.angleName].push(hook);
      return acc;
    },
    {}
  );

  const formatsWithNotes = data.formats.filter((f) => f.concept_notes?.trim());

  return (
    <Document
      title={`${data.projectName} — Creative Strategy Brief`}
      author="Creative Strategy Engine"
    >
      <Page size="A4" style={s.page}>

        {/* ── Cover ── */}
        <Text style={s.coverLabel}>Creative Strategy Brief</Text>
        <Text style={s.coverTitle}>{data.projectName}</Text>
        {data.projectDescription && (
          <Text style={s.coverDescription}>{data.projectDescription}</Text>
        )}
        <Text style={s.coverMeta}>Generated {data.generatedAt}</Text>
        <View style={s.coverDivider} />

        {/* ── Audiences ── */}
        <SectionHeader label="Audiences" />
        {data.audiences.length === 0 ? (
          <Text style={s.emptyText}>No audiences defined.</Text>
        ) : (
          data.audiences.map((a, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardTitle}>{a.name}</Text>
              {a.description && (
                <Text style={s.cardBody}>{a.description}</Text>
              )}
            </View>
          ))
        )}
        <View style={s.sectionGap} />

        {/* ── Pain Points ── */}
        {painsOnly.length > 0 && (
          <>
            <SectionHeader label="Pain Points" />
            {painsOnly.map((p, i) => (
              <View key={i} style={s.card}>
                <PainDesireBadge type="pain" />
                <Text style={s.cardTitle}>{p.title}</Text>
                {p.description && (
                  <Text style={s.cardBody}>{p.description}</Text>
                )}
                {p.intensity != null && (
                  <Text style={[s.cardBody, { marginTop: 3 }]}>
                    Intensity: {p.intensity}/10
                  </Text>
                )}
              </View>
            ))}
            <View style={s.sectionGap} />
          </>
        )}

        {/* ── Desires ── */}
        {desiresOnly.length > 0 && (
          <>
            <SectionHeader label="Desires" />
            {desiresOnly.map((d, i) => (
              <View key={i} style={s.card}>
                <PainDesireBadge type="desire" />
                <Text style={s.cardTitle}>{d.title}</Text>
                {d.description && (
                  <Text style={s.cardBody}>{d.description}</Text>
                )}
              </View>
            ))}
            <View style={s.sectionGap} />
          </>
        )}

        {/* ── Messaging Angles ── */}
        <SectionHeader label="Messaging Angles" />
        {data.angles.length === 0 ? (
          <Text style={s.emptyText}>No messaging angles yet.</Text>
        ) : (
          Object.entries(angleGroups).map(([key, angles], gi) => {
            const first = angles[0];
            return (
              <View key={gi} style={{ marginBottom: 12 }}>
                <View style={s.intersectionHeader}>
                  <PainDesireBadge type={first.painDesireType} />
                  <Text style={s.intersectionTitle}>{first.painDesireTitle}</Text>
                  <Text style={s.intersectionSep}>×</Text>
                  <Text style={s.intersectionAudience}>{first.audienceName}</Text>
                </View>
                {angles.map((angle, ai) => (
                  <View key={ai} style={[s.card, { marginLeft: 8 }]}>
                    <Text style={s.cardTitle}>{angle.title}</Text>
                    {angle.description && (
                      <Text style={s.cardBody}>{angle.description}</Text>
                    )}
                    {angle.tone && (
                      <Text style={[s.toneTag, { marginTop: 4 }]}>
                        tone: {angle.tone}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            );
          })
        )}
        <View style={s.sectionGap} />

        {/* ── Hooks ── */}
        <SectionHeader label="Hooks" />
        {data.hooks.length === 0 ? (
          <Text style={s.emptyText}>No hooks yet.</Text>
        ) : (
          Object.entries(hookGroups).map(([angleName, hooks], gi) => (
            <View key={gi} style={{ marginBottom: 14 }}>
              <Text style={[s.cardTitle, { marginBottom: 6, color: c.gray500 }]}>
                {angleName}
              </Text>
              {hooks.map((hook, hi) => (
                <View
                  key={hi}
                  style={hook.is_starred ? [s.hookRow, s.hookRowStarred] : s.hookRow}
                >
                  <Text style={s.hookContent}>{hook.content}</Text>
                  <View style={s.hookMeta}>
                    <HookTypeBadge
                      label={HOOK_TYPE_LABELS[hook.type] ?? hook.type}
                    />
                    <StageBadge
                      label={STAGE_LABELS[hook.awareness_stage] ?? hook.awareness_stage}
                    />
                    {hook.is_starred && (
                      <View style={[s.badge, { backgroundColor: c.amberLight }]}>
                        <Text style={[s.badgeText, { color: c.amber }]}>★ Starred</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}

        {/* ── Format Concepts ── */}
        {formatsWithNotes.length > 0 && (
          <>
            <View style={s.sectionGap} />
            <SectionHeader label="Format Concepts" />
            {formatsWithNotes.map((f, i) => (
              <View key={i} style={s.formatEntry}>
                <Text style={s.formatHookRef}>
                  Hook: "{f.hookContent.slice(0, 100)}{f.hookContent.length > 100 ? "…" : ""}"
                </Text>
                {f.template_id && (
                  <Text style={[s.cardTitle, { marginBottom: 4, fontSize: 9 }]}>
                    {f.template_id}
                  </Text>
                )}
                <Text style={s.formatNotes}>{f.concept_notes}</Text>
              </View>
            ))}
          </>
        )}

      </Page>
    </Document>
  );
}
