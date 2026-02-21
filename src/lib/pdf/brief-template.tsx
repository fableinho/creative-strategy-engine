import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BriefAudience {
  name: string;
  description: string | null;
}

export interface BriefPainDesire {
  id: string;
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
  organizingPrinciple: string | null;
  principleRationale: string | null;
  organizingApproach: string | null; // "pain" | "desire"
  generatedAt: string;
  audiences: BriefAudience[];
  audienceIds: { id: string; name: string }[];
  painDesires: BriefPainDesire[];
  painAudienceLinks: { pain_desire_id: string; audience_id: string }[];
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

const PRINCIPLE_LABELS: Record<string, string> = {
  brand: "Brand",
  campaign: "Campaign",
  audience: "Audience",
  channel: "Channel",
  product: "Product",
  theme: "Theme",
};

// ─── Brand colours ────────────────────────────────────────────────────────────

const c = {
  obsidian: "#1A1814",
  ink2: "#4A4640",
  muted: "#9A958E",
  paper: "#F5F2EC",
  linen: "#EDE9E1",
  border: "#DDD9D2",
  white: "#FFFFFF",
  strike: "#C8502A",
  strikeLight: "#FBF0EB",
  rose: "#E11D48",
  roseLight: "#FFF1F2",
  amber: "#C8912A",
  amberLight: "#FEF8EE",
  gray500: "#6B7280",
  gray400: "#9CA3AF",
  gray200: "#E5E7EB",
  gray50: "#F9FAFB",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: c.obsidian,
    paddingTop: 52,
    paddingBottom: 52,
    paddingLeft: 48,
    paddingRight: 48,
    backgroundColor: c.white,
  },

  // ── Cover ──────────────────────────────────────────────────────
  coverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  coverWordmark: {
    fontSize: 11,
    fontFamily: "Helvetica",
    color: c.muted,
    letterSpacing: 1,
  },
  coverPill: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: c.linen,
  },
  coverPillText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.ink2,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 32,
    color: c.obsidian,
    lineHeight: 1.15,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  coverDescription: {
    fontSize: 10,
    color: c.ink2,
    lineHeight: 1.65,
    maxWidth: 420,
    marginBottom: 20,
  },
  coverStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  coverStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coverStatNum: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: c.obsidian,
  },
  coverStatLabel: {
    fontSize: 9,
    color: c.muted,
  },
  coverStatDot: {
    width: 3,
    height: 3,
    borderRadius: 100,
    backgroundColor: c.border,
    marginTop: 1,
  },
  coverMeta: {
    fontSize: 8,
    color: c.muted,
    letterSpacing: 0.3,
  },
  coverDivider: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    marginTop: 28,
    marginBottom: 32,
  },

  // ── Sections ───────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: c.muted,
  },
  sectionLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    marginTop: 4,
  },
  sectionGap: {
    marginBottom: 28,
  },

  // ── Organizing principle ───────────────────────────────────────
  principleBox: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: c.paper,
    marginBottom: 8,
  },
  principleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  principleTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: c.obsidian,
  },
  principleTagText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.white,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  principleApproachTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: c.strikeLight,
  },
  principleApproachText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.strike,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  principleRationale: {
    fontSize: 9,
    color: c.ink2,
    lineHeight: 1.6,
  },

  // ── Pain-audience matrix ───────────────────────────────────────
  matrixWrap: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  matrixHeaderRow: {
    flexDirection: "row",
    backgroundColor: c.linen,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  matrixLabelCell: {
    width: 160,
    padding: 7,
    borderRightWidth: 1,
    borderRightColor: c.border,
  },
  matrixAudienceCell: {
    flex: 1,
    padding: 7,
    borderRightWidth: 1,
    borderRightColor: c.border,
    alignItems: "center",
  },
  matrixHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.ink2,
    letterSpacing: 0.3,
  },
  matrixRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  matrixRowAlt: {
    backgroundColor: c.paper,
  },
  matrixRowLast: {
    borderBottomWidth: 0,
  },
  matrixPdCell: {
    width: 160,
    padding: 7,
    borderRightWidth: 1,
    borderRightColor: c.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  matrixPdTypeDot: {
    width: 5,
    height: 5,
    borderRadius: 100,
  },
  matrixPdTitle: {
    fontSize: 8,
    color: c.obsidian,
    flex: 1,
  },
  matrixCheckCell: {
    flex: 1,
    padding: 7,
    borderRightWidth: 1,
    borderRightColor: c.border,
    alignItems: "center",
    justifyContent: "center",
  },
  matrixCheck: {
    fontSize: 9,
    color: c.strike,
    fontFamily: "Helvetica-Bold",
  },
  matrixEmpty: {
    fontSize: 9,
    color: c.border,
  },
  matrixOverflow: {
    fontSize: 8,
    color: c.muted,
    fontFamily: "Helvetica-Oblique",
    marginTop: 6,
  },

  // ── Cards / Rows ───────────────────────────────────────────────
  card: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: c.white,
  },
  cardTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: c.obsidian,
    marginBottom: 3,
  },
  cardBody: {
    fontSize: 9,
    color: c.gray500,
    lineHeight: 1.55,
  },

  // ── Badges ────────────────────────────────────────────────────
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
  badgePain: { backgroundColor: c.roseLight },
  badgePainText: { color: c.rose },
  badgeDesire: { backgroundColor: c.strikeLight },
  badgeDesireText: { color: c.strike },
  badgeStage: { backgroundColor: c.linen },
  badgeStageText: { color: c.ink2 },
  badgeType: { backgroundColor: c.amberLight },
  badgeTypeText: { color: c.amber },

  // ── Angle group ───────────────────────────────────────────────
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
    color: c.ink2,
  },
  intersectionSep: { fontSize: 9, color: c.muted },
  intersectionAudience: { fontSize: 9, color: c.muted },

  // ── Hook rows ─────────────────────────────────────────────────
  hookRow: {
    borderLeftWidth: 2,
    borderLeftColor: c.border,
    paddingLeft: 10,
    marginBottom: 8,
  },
  hookRowStarred: { borderLeftColor: c.strike },
  hookContent: {
    fontSize: 9,
    color: c.obsidian,
    lineHeight: 1.55,
    marginBottom: 4,
  },
  hookMeta: { flexDirection: "row", gap: 6 },

  // ── Format entries ────────────────────────────────────────────
  formatEntry: {
    backgroundColor: c.paper,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: c.border,
    padding: 10,
    marginBottom: 8,
  },
  formatHookRef: {
    fontSize: 8,
    color: c.muted,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  formatNotes: {
    fontSize: 9,
    color: c.ink2,
    lineHeight: 1.6,
  },

  // ── Misc ──────────────────────────────────────────────────────
  toneTag: {
    fontSize: 8,
    color: c.strike,
    fontFamily: "Helvetica-Oblique",
  },
  emptyText: {
    fontSize: 9,
    color: c.muted,
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

// ─── Organizing Principle section ─────────────────────────────────────────────

function OrganizingPrincipleSection({
  principle,
  rationale,
  approach,
}: {
  principle: string | null;
  rationale: string | null;
  approach: string | null;
}) {
  if (!principle && !approach) return null;
  return (
    <>
      <SectionHeader label="Organizing Principle" />
      <View style={s.principleBox}>
        <View style={s.principleRow}>
          {principle && (
            <View style={s.principleTag}>
              <Text style={s.principleTagText}>
                {PRINCIPLE_LABELS[principle] ?? principle}
              </Text>
            </View>
          )}
          {approach && (
            <View style={s.principleApproachTag}>
              <Text style={s.principleApproachText}>
                {approach === "pain" ? "Pain-First" : "Desire-First"}
              </Text>
            </View>
          )}
        </View>
        {rationale ? (
          <Text style={s.principleRationale}>{rationale}</Text>
        ) : (
          <Text style={[s.principleRationale, { color: c.muted, fontFamily: "Helvetica-Oblique" }]}>
            No rationale recorded.
          </Text>
        )}
      </View>
      <View style={s.sectionGap} />
    </>
  );
}

// ─── Pain-Audience Matrix ─────────────────────────────────────────────────────

const MAX_MATRIX_AUDIENCES = 5;

function PainAudienceMatrix({
  painDesires,
  audienceIds,
  links,
}: {
  painDesires: BriefPainDesire[];
  audienceIds: { id: string; name: string }[];
  links: { pain_desire_id: string; audience_id: string }[];
}) {
  if (painDesires.length === 0 || audienceIds.length === 0) return null;

  const linkSet = new Set(links.map((l) => `${l.pain_desire_id}::${l.audience_id}`));
  const visibleAudiences = audienceIds.slice(0, MAX_MATRIX_AUDIENCES);
  const overflowCount = audienceIds.length - visibleAudiences.length;

  return (
    <>
      <SectionHeader label="Pain–Audience Map" />
      <View style={s.matrixWrap}>
        {/* Header row */}
        <View style={s.matrixHeaderRow}>
          <View style={s.matrixLabelCell}>
            <Text style={s.matrixHeaderText}>Pain / Desire</Text>
          </View>
          {visibleAudiences.map((aud) => (
            <View key={aud.id} style={s.matrixAudienceCell}>
              <Text style={[s.matrixHeaderText, { textAlign: "center" }]}>
                {aud.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {painDesires.map((pd, i) => {
          const isLast = i === painDesires.length - 1;
          const isAlt = i % 2 === 1;
          return (
            <View
              key={pd.id}
              style={[
                s.matrixRow,
                isAlt ? s.matrixRowAlt : {},
                isLast ? s.matrixRowLast : {},
              ]}
            >
              <View style={s.matrixPdCell}>
                <View
                  style={[
                    s.matrixPdTypeDot,
                    { backgroundColor: pd.type === "pain" ? c.rose : c.strike },
                  ]}
                />
                <Text style={s.matrixPdTitle}>{pd.title}</Text>
              </View>
              {visibleAudiences.map((aud) => {
                const linked = linkSet.has(`${pd.id}::${aud.id}`);
                return (
                  <View key={aud.id} style={s.matrixCheckCell}>
                    {linked ? (
                      <Text style={s.matrixCheck}>✓</Text>
                    ) : (
                      <Text style={s.matrixEmpty}>·</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      {overflowCount > 0 && (
        <Text style={s.matrixOverflow}>
          + {overflowCount} more audience{overflowCount > 1 ? "s" : ""} not shown in map
        </Text>
      )}
      <View style={s.sectionGap} />
    </>
  );
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function BriefDocument({ data }: { data: BriefData }) {
  const painsOnly = data.painDesires.filter((p) => p.type === "pain");
  const desiresOnly = data.painDesires.filter((p) => p.type === "desire");

  const angleGroups = data.angles.reduce<Record<string, BriefAngle[]>>(
    (acc, angle) => {
      const key = `${angle.painDesireTitle}__${angle.audienceName}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(angle);
      return acc;
    },
    {}
  );

  const hookGroups = data.hooks.reduce<Record<string, BriefHook[]>>(
    (acc, hook) => {
      if (!acc[hook.angleName]) acc[hook.angleName] = [];
      acc[hook.angleName].push(hook);
      return acc;
    },
    {}
  );

  const formatsWithNotes = data.formats.filter((f) => f.concept_notes?.trim());

  const totalAngles = data.angles.length;
  const totalHooks = data.hooks.length;

  return (
    <Document
      title={`${data.projectName} — Creative Strategy Brief`}
      author="flnt"
    >
      <Page size="A4" style={s.page}>

        {/* ── Cover ── */}
        <View style={s.coverTop}>
          <Text style={s.coverWordmark}>flnt · creative strategy brief</Text>
          {data.organizingPrinciple && (
            <View style={s.coverPill}>
              <Text style={s.coverPillText}>
                {PRINCIPLE_LABELS[data.organizingPrinciple] ?? data.organizingPrinciple}
              </Text>
            </View>
          )}
        </View>

        <Text style={s.coverTitle}>{data.projectName}</Text>
        {data.projectDescription && (
          <Text style={s.coverDescription}>{data.projectDescription}</Text>
        )}

        {/* Stats row */}
        <View style={s.coverStats}>
          <View style={s.coverStat}>
            <Text style={s.coverStatNum}>{data.audiences.length}</Text>
            <Text style={s.coverStatLabel}>
              {data.audiences.length === 1 ? "audience" : "audiences"}
            </Text>
          </View>
          <View style={s.coverStatDot} />
          <View style={s.coverStat}>
            <Text style={s.coverStatNum}>{painsOnly.length}</Text>
            <Text style={s.coverStatLabel}>
              {painsOnly.length === 1 ? "pain point" : "pain points"}
            </Text>
          </View>
          {desiresOnly.length > 0 && (
            <>
              <View style={s.coverStatDot} />
              <View style={s.coverStat}>
                <Text style={s.coverStatNum}>{desiresOnly.length}</Text>
                <Text style={s.coverStatLabel}>
                  {desiresOnly.length === 1 ? "desire" : "desires"}
                </Text>
              </View>
            </>
          )}
          {totalAngles > 0 && (
            <>
              <View style={s.coverStatDot} />
              <View style={s.coverStat}>
                <Text style={s.coverStatNum}>{totalAngles}</Text>
                <Text style={s.coverStatLabel}>
                  {totalAngles === 1 ? "angle" : "angles"}
                </Text>
              </View>
            </>
          )}
          {totalHooks > 0 && (
            <>
              <View style={s.coverStatDot} />
              <View style={s.coverStat}>
                <Text style={s.coverStatNum}>{totalHooks}</Text>
                <Text style={s.coverStatLabel}>
                  {totalHooks === 1 ? "hook" : "hooks"}
                </Text>
              </View>
            </>
          )}
        </View>

        <Text style={s.coverMeta}>Generated {data.generatedAt}</Text>
        <View style={s.coverDivider} />

        {/* ── Organizing Principle ── */}
        <OrganizingPrincipleSection
          principle={data.organizingPrinciple}
          rationale={data.principleRationale}
          approach={data.organizingApproach}
        />

        {/* ── Pain–Audience Map ── */}
        <PainAudienceMatrix
          painDesires={data.painDesires}
          audienceIds={data.audienceIds}
          links={data.painAudienceLinks}
        />

        {/* ── Audiences ── */}
        <SectionHeader label="Audiences" />
        {data.audiences.length === 0 ? (
          <Text style={s.emptyText}>No audiences defined.</Text>
        ) : (
          data.audiences.map((a, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardTitle}>{a.name}</Text>
              {a.description && <Text style={s.cardBody}>{a.description}</Text>}
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
                {p.description && <Text style={s.cardBody}>{p.description}</Text>}
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
                {d.description && <Text style={s.cardBody}>{d.description}</Text>}
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
              <Text style={[s.cardTitle, { marginBottom: 6, color: c.muted }]}>
                {angleName}
              </Text>
              {hooks.map((hook, hi) => (
                <View
                  key={hi}
                  style={hook.is_starred ? [s.hookRow, s.hookRowStarred] : s.hookRow}
                >
                  <Text style={s.hookContent}>{hook.content}</Text>
                  <View style={s.hookMeta}>
                    <HookTypeBadge label={HOOK_TYPE_LABELS[hook.type] ?? hook.type} />
                    <StageBadge
                      label={STAGE_LABELS[hook.awareness_stage] ?? hook.awareness_stage}
                    />
                    {hook.is_starred && (
                      <View style={[s.badge, { backgroundColor: c.strikeLight }]}>
                        <Text style={[s.badgeText, { color: c.strike }]}>★ Starred</Text>
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
                  Hook: &ldquo;{f.hookContent.slice(0, 100)}
                  {f.hookContent.length > 100 ? "…" : ""}&rdquo;
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
