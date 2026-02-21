import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import {
  BriefDocument,
  type BriefData,
  type BriefAngle,
  type BriefHook,
  type BriefFormat,
} from "@/lib/pdf/brief-template";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. Fetch project (verify ownership) ──────────────────────────────────────
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, organizing_principle, principle_rationale, metadata")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (projectError || !projectData) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projectData as {
    id: string;
    name: string;
    description: string | null;
    organizing_principle: string | null;
    principle_rationale: string | null;
    metadata: { organizing_approach?: string; current_step?: number } | null;
  };

  // ── 2. First parallel batch: audiences, pain/desires, angles ──────────────────
  const [audiencesRes, painDesiresRes, anglesRes] = await Promise.all([
    supabase
      .from("audiences")
      .select("id, name, description")
      .eq("project_id", projectId)
      .order("sort_order"),
    supabase
      .from("pain_desires")
      .select("id, type, title, description, intensity")
      .eq("project_id", projectId)
      .order("sort_order"),
    supabase
      .from("messaging_angles")
      .select("id, title, description, tone, pain_desire_id, audience_id, is_ai_generated")
      .eq("project_id", projectId)
      .order("sort_order"),
  ]);

  const audiences = (audiencesRes.data ?? []) as {
    id: string;
    name: string;
    description: string | null;
  }[];

  const painDesires = (painDesiresRes.data ?? []) as {
    id: string;
    type: "pain" | "desire";
    title: string;
    description: string | null;
    intensity: number | null;
  }[];

  const angles = (anglesRes.data ?? []) as {
    id: string;
    title: string;
    description: string | null;
    tone: string | null;
    pain_desire_id: string | null;
    audience_id: string | null;
    is_ai_generated: boolean;
  }[];

  // ── 3. Second parallel batch: links + hooks (needs IDs from batch 1) ──────────
  const painDesireIds = painDesires.map((p) => p.id);
  const angleIds = angles.map((a) => a.id);

  const [linksRes, hooksRes] = await Promise.all([
    painDesireIds.length > 0
      ? supabase
          .from("pain_desire_audiences")
          .select("pain_desire_id, audience_id")
          .in("pain_desire_id", painDesireIds)
      : Promise.resolve({ data: [] }),
    angleIds.length > 0
      ? supabase
          .from("hooks")
          .select("id, messaging_angle_id, content, type, awareness_stage, is_starred, is_ai_generated")
          .in("messaging_angle_id", angleIds)
          .order("sort_order")
      : Promise.resolve({ data: [] }),
  ]);

  const painAudienceLinks = (linksRes.data ?? []) as {
    pain_desire_id: string;
    audience_id: string;
  }[];

  const hooks = (hooksRes.data ?? []) as {
    id: string;
    messaging_angle_id: string;
    content: string;
    type: string;
    awareness_stage: string;
    is_starred: boolean;
    is_ai_generated: boolean;
  }[];

  // ── 4. Third batch: format executions (needs hook IDs) ────────────────────────
  let formats: {
    hook_id: string;
    template_id: string | null;
    concept_notes: string | null;
  }[] = [];

  if (hooks.length > 0) {
    const hookIds = hooks.map((h) => h.id);
    const { data: formatsData } = await supabase
      .from("format_executions")
      .select("hook_id, template_id, concept_notes")
      .in("hook_id", hookIds)
      .order("sort_order");
    formats = (formatsData ?? []) as typeof formats;
  }

  // ── 5. Assemble brief data ────────────────────────────────────────────────────
  const audienceMap = new Map(audiences.map((a) => [a.id, a]));
  const painDesireMap = new Map(painDesires.map((p) => [p.id, p]));
  const angleMap = new Map(angles.map((a) => [a.id, a]));
  const hookMap = new Map(hooks.map((h) => [h.id, h]));

  const briefAngles: BriefAngle[] = angles.map((angle) => {
    const pd = angle.pain_desire_id ? painDesireMap.get(angle.pain_desire_id) : null;
    const audience = angle.audience_id ? audienceMap.get(angle.audience_id) : null;
    return {
      title: angle.title,
      description: angle.description,
      tone: angle.tone,
      painDesireTitle: pd?.title ?? "Unknown",
      painDesireType: (pd?.type ?? "pain") as "pain" | "desire",
      audienceName: audience?.name ?? "Unknown",
      is_ai_generated: angle.is_ai_generated,
    };
  });

  const briefHooks: BriefHook[] = hooks.map((hook) => {
    const angle = angleMap.get(hook.messaging_angle_id);
    const pd = angle?.pain_desire_id ? painDesireMap.get(angle.pain_desire_id) : null;
    const audience = angle?.audience_id ? audienceMap.get(angle.audience_id) : null;
    return {
      content: hook.content,
      type: hook.type,
      awareness_stage: hook.awareness_stage,
      is_starred: hook.is_starred,
      is_ai_generated: hook.is_ai_generated,
      angleName: angle?.title ?? "Unknown Angle",
      painDesireTitle: pd?.title ?? "Unknown",
      painDesireType: (pd?.type ?? "pain") as "pain" | "desire",
      audienceName: audience?.name ?? "Unknown",
    };
  });

  const briefFormats: BriefFormat[] = formats.map((fe) => {
    const hook = hookMap.get(fe.hook_id);
    const angle = hook ? angleMap.get(hook.messaging_angle_id) : null;
    const pd = angle?.pain_desire_id ? painDesireMap.get(angle.pain_desire_id) : null;
    const audience = angle?.audience_id ? audienceMap.get(angle.audience_id) : null;
    return {
      hookId: fe.hook_id,
      template_id: fe.template_id,
      concept_notes: fe.concept_notes,
      hookContent: hook?.content ?? "",
      hookIsStarred: hook?.is_starred ?? false,
      hookAwarenessStage: hook?.awareness_stage ?? "",
      hookAngleName: angle?.title ?? "Unknown Angle",
      hookPainDesireType: (pd?.type ?? "pain") as "pain" | "desire",
      hookPainDesireTitle: pd?.title ?? "Unknown",
      hookAudienceName: audience?.name ?? "Unknown",
    };
  });

  const now = new Date();
  const generatedAt = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const briefData: BriefData = {
    projectName: project.name,
    projectDescription: project.description,
    organizingPrinciple: project.organizing_principle,
    principleRationale: project.principle_rationale,
    organizingApproach: project.metadata?.organizing_approach ?? null,
    generatedAt,
    audiences: audiences.map((a) => ({ name: a.name, description: a.description })),
    painDesires: painDesires.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      description: p.description,
      intensity: p.intensity,
    })),
    audienceIds: audiences.map((a) => ({ id: a.id, name: a.name })),
    painAudienceLinks,
    angles: briefAngles,
    hooks: briefHooks,
    formats: briefFormats,
  };

  // ── 6. Render PDF ─────────────────────────────────────────────────────────────
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(
      React.createElement(BriefDocument, { data: briefData }) as any
    );

    const slug = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `${slug}-brief.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF render error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
