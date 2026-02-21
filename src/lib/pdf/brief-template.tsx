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
  painDesireTitle: string;
  painDesireType: "pain" | "desire";
  audienceName: string;
}

export interface BriefFormat {
  hookId: string;
  template_id: string | null;
  concept_notes: string | null;
  hookContent: string;
  hookIsStarred: boolean;
  hookAwarenessStage: string;
  hookAngleName: string;
  hookPainDesireType: "pain" | "desire";
  hookPainDesireTitle: string;
  hookAudienceName: string;
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
  /** Section keys to render; all sections rendered when absent. */
  includedSections: string[];
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

const STAGE_ORDER = [
  "unaware",
  "problem_aware",
  "solution_aware",
  "product_aware",
  "most_aware",
] as const;

const PRINCIPLE_LABELS: Record<string, string> = {
  brand: "Brand",
  campaign: "Campaign",
  audience: "Audience",
  channel: "Channel",
  product: "Product",
  theme: "Theme",
};

// ─── Stage colours (cold → hot) ───────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  unaware: "#9A958E",       // muted
  problem_aware: "#C8912A", // amber
  solution_aware: "#D4622A",// warm
  product_aware: "#E11D48", // rose
  most_aware: "#1A1814",    // obsidian
};

// ─── Format template lookups ──────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<string, string> = {
  "story-origin": "Origin Story",
  "story-customer-journey": "Customer Journey",
  "story-day-in-life": "Day in the Life",
  "story-unexpected-lesson": "Unexpected Lesson",
  "story-open-loop": "Open Loop Narrative",
  "ba-transformation": "Full Transformation",
  "ba-side-by-side": "Side-by-Side Compare",
  "ba-time-machine": "Time Machine",
  "ba-metrics-shift": "Metrics Shift",
  "ba-emotional-state": "Emotional State Change",
  "founder-struggle": "The Struggle That Started It",
  "founder-contrarian": "Contrarian Bet",
  "founder-behind-scenes": "Behind the Scenes",
  "founder-mission": "Mission Statement",
  "uvt-old-way-new-way": "Old Way vs New Way",
  "uvt-myth-buster": "Myth Buster",
  "uvt-category-comparison": "Category Comparison",
  "uvt-hidden-cost": "Hidden Cost Exposé",
  "sp-testimonial-stack": "Testimonial Stack",
  "sp-case-study-mini": "Mini Case Study",
  "sp-social-surge": "Social Surge",
  "sp-results-collage": "Results Collage",
};

const TEMPLATE_CATEGORY: Record<string, string> = {
  "story-origin": "Storytelling",
  "story-customer-journey": "Storytelling",
  "story-day-in-life": "Storytelling",
  "story-unexpected-lesson": "Storytelling",
  "story-open-loop": "Storytelling",
  "ba-transformation": "Before / After",
  "ba-side-by-side": "Before / After",
  "ba-time-machine": "Before / After",
  "ba-metrics-shift": "Before / After",
  "ba-emotional-state": "Before / After",
  "founder-struggle": "Founder Story",
  "founder-contrarian": "Founder Story",
  "founder-behind-scenes": "Founder Story",
  "founder-mission": "Founder Story",
  "uvt-old-way-new-way": "Us vs Them",
  "uvt-myth-buster": "Us vs Them",
  "uvt-category-comparison": "Us vs Them",
  "uvt-hidden-cost": "Us vs Them",
  "sp-testimonial-stack": "Social Proof",
  "sp-case-study-mini": "Social Proof",
  "sp-social-surge": "Social Proof",
  "sp-results-collage": "Social Proof",
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

const CATEGORY_COLORS: Record<string, string> = {
  Storytelling: c.amber,
  "Before / After": c.strike,
  "Founder Story": c.obsidian,
  "Us vs Them": c.rose,
  "Social Proof": "#5E7A6F",
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

  // ── Funnel map ────────────────────────────────────────────────
  funnelStage: {
    marginBottom: 14,
  },
  funnelStageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  funnelStageDot: {
    width: 7,
    height: 7,
    borderRadius: 100,
  },
  funnelStageLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  funnelStageLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    marginTop: 3,
  },
  funnelAngleGroup: {
    marginLeft: 14,
    marginBottom: 8,
  },
  funnelAngleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
    flexWrap: "wrap",
  },
  funnelAngleName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: c.obsidian,
  },
  funnelAngleContext: {
    fontSize: 7,
    color: c.muted,
    fontFamily: "Helvetica-Oblique",
  },
  funnelHookRow: {
    borderLeftWidth: 2,
    borderLeftColor: c.strike,
    paddingLeft: 8,
    marginBottom: 5,
  },
  funnelHookContent: {
    fontSize: 9,
    color: c.obsidian,
    lineHeight: 1.5,
  },

  // ── Execution matrix ──────────────────────────────────────────
  execHookBlock: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 14,
  },
  execHookHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: c.linen,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexWrap: "wrap",
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  execAngleName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: c.obsidian,
  },
  execAngleContext: {
    fontSize: 7,
    color: c.muted,
    fontFamily: "Helvetica-Oblique",
  },
  execHookContent: {
    fontSize: 9,
    color: c.obsidian,
    lineHeight: 1.55,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  execFormatEntry: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  execFormatEntryLast: {
    borderBottomWidth: 0,
  },
  execFormatLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  execCategoryTag: {
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  execCategoryTagText: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: c.white,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  execTemplateName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: c.ink2,
  },
  execFormatNotes: {
    fontSize: 8.5,
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

// ─── Funnel Map section ───────────────────────────────────────────────────────

function FunnelMapSection({ hooks }: { hooks: BriefHook[] }) {
  const starredHooks = hooks.filter((h) => h.is_starred);
  if (starredHooks.length === 0) return null;

  // Build stage → angleName → BriefHook[] map
  const stageMap: Record<string, Record<string, BriefHook[]>> = {};
  for (const hook of starredHooks) {
    const stage = hook.awareness_stage;
    if (!stageMap[stage]) stageMap[stage] = {};
    if (!stageMap[stage][hook.angleName]) stageMap[stage][hook.angleName] = [];
    stageMap[stage][hook.angleName].push(hook);
  }

  const activeStages = STAGE_ORDER.filter((stage) => stageMap[stage]);
  if (activeStages.length === 0) return null;

  return (
    <>
      <SectionHeader label="Funnel Map" />
      {activeStages.map((stage) => {
        const angleGroups = stageMap[stage];
        const stageColor = STAGE_COLORS[stage] ?? c.muted;
        return (
          <View key={stage} style={s.funnelStage}>
            {/* Stage header */}
            <View style={s.funnelStageHeader}>
              <View style={[s.funnelStageDot, { backgroundColor: stageColor }]} />
              <Text style={[s.funnelStageLabel, { color: stageColor }]}>
                {STAGE_LABELS[stage] ?? stage}
              </Text>
              <View style={s.funnelStageLine} />
            </View>

            {/* Angle groups within this stage */}
            {Object.entries(angleGroups).map(([angleName, angleHooks]) => {
              const first = angleHooks[0];
              return (
                <View key={angleName} style={s.funnelAngleGroup}>
                  {/* Angle label row */}
                  <View style={s.funnelAngleLabelRow}>
                    <PainDesireBadge type={first.painDesireType} />
                    <Text style={s.funnelAngleName}>{angleName}</Text>
                    <Text style={s.funnelAngleContext}>
                      {first.painDesireTitle} × {first.audienceName}
                    </Text>
                  </View>

                  {/* Starred hooks */}
                  {angleHooks.map((hook, hi) => (
                    <View key={hi} style={s.funnelHookRow}>
                      <Text style={s.funnelHookContent}>{hook.content}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );
      })}
      <View style={s.sectionGap} />
    </>
  );
}

// ─── Execution Matrix section ─────────────────────────────────────────────────

function ExecutionMatrixSection({ formats }: { formats: BriefFormat[] }) {
  const withNotes = formats.filter((f) => f.concept_notes?.trim());
  if (withNotes.length === 0) return null;

  // Group by hookId, preserving first-encounter insertion order
  const hookGroups = new Map<string, BriefFormat[]>();
  for (const fmt of withNotes) {
    if (!hookGroups.has(fmt.hookId)) hookGroups.set(fmt.hookId, []);
    hookGroups.get(fmt.hookId)!.push(fmt);
  }

  // Sort hook groups by awareness stage (funnel order)
  const stageIndex = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, i]));
  const sortedHookIds = [...hookGroups.keys()].sort((a, b) => {
    const aStage = hookGroups.get(a)![0].hookAwarenessStage;
    const bStage = hookGroups.get(b)![0].hookAwarenessStage;
    return (stageIndex[aStage] ?? 99) - (stageIndex[bStage] ?? 99);
  });

  return (
    <>
      <SectionHeader label="Execution Matrix" />
      {sortedHookIds.map((hookId) => {
        const fmts = hookGroups.get(hookId)!;
        const first = fmts[0];
        const stageColor = STAGE_COLORS[first.hookAwarenessStage] ?? c.muted;

        return (
          <View key={hookId} style={s.execHookBlock}>
            {/* Hook header: stage → pain/desire → angle → context */}
            <View style={s.execHookHeader}>
              <View style={[s.badge, { backgroundColor: stageColor + "22" }]}>
                <Text style={[s.badgeText, { color: stageColor }]}>
                  {STAGE_LABELS[first.hookAwarenessStage] ?? first.hookAwarenessStage}
                </Text>
              </View>
              <PainDesireBadge type={first.hookPainDesireType} />
              <Text style={s.execAngleName}>{first.hookAngleName}</Text>
              <Text style={s.execAngleContext}>
                · {first.hookPainDesireTitle} × {first.hookAudienceName}
              </Text>
            </View>

            {/* Hook content */}
            <Text style={s.execHookContent}>
              {first.hookIsStarred ? "★  " : ""}{first.hookContent}
            </Text>

            {/* Format executions */}
            {fmts.map((fmt, fi) => {
              const isLast = fi === fmts.length - 1;
              const templateName = fmt.template_id
                ? (TEMPLATE_LABELS[fmt.template_id] ?? fmt.template_id)
                : "Unknown Format";
              const category = fmt.template_id
                ? (TEMPLATE_CATEGORY[fmt.template_id] ?? "Other")
                : "Other";
              const catColor = CATEGORY_COLORS[category] ?? c.muted;

              return (
                <View
                  key={fi}
                  style={isLast ? [s.execFormatEntry, s.execFormatEntryLast] : s.execFormatEntry}
                >
                  <View style={s.execFormatLabelRow}>
                    <View style={[s.execCategoryTag, { backgroundColor: catColor }]}>
                      <Text style={s.execCategoryTagText}>{category}</Text>
                    </View>
                    <Text style={s.execTemplateName}>{templateName}</Text>
                  </View>
                  <Text style={s.execFormatNotes}>{fmt.concept_notes}</Text>
                </View>
              );
            })}
          </View>
        );
      })}
      <View style={s.sectionGap} />
    </>
  );
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function BriefDocument({ data }: { data: BriefData }) {
  const has = (key: string) => data.includedSections.includes(key);
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
        {has("organizingPrinciple") && (
          <OrganizingPrincipleSection
            principle={data.organizingPrinciple}
            rationale={data.principleRationale}
            approach={data.organizingApproach}
          />
        )}

        {/* ── Pain–Audience Map ── */}
        {has("painAudienceMap") && (
          <PainAudienceMatrix
            painDesires={data.painDesires}
            audienceIds={data.audienceIds}
            links={data.painAudienceLinks}
          />
        )}

        {/* ── Funnel Map ── */}
        {has("funnelMap") && <FunnelMapSection hooks={data.hooks} />}

        {/* ── Audiences ── */}
        {has("audiences") && (
          <>
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
          </>
        )}

        {/* ── Pain Points & Desires ── */}
        {has("painDesires") && (
          <>
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
          </>
        )}

        {/* ── Messaging Angles ── */}
        {has("messagingAngles") && (
          <>
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
          </>
        )}

        {/* ── Hooks ── */}
        {has("hooks") && (
          <>
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
            <View style={s.sectionGap} />
          </>
        )}

        {/* ── Execution Matrix ── */}
        {has("executionMatrix") && <ExecutionMatrixSection formats={data.formats} />}

      </Page>
    </Document>
  );
}
