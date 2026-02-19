import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const LENS_LABELS: Record<string, string> = {
  desired_outcome: "Desired Outcome — What does success look like for this audience?",
  objections: "Objections — What reasons might they have to say no?",
  features_benefits: "Features & Benefits — Which features matter most and what benefits do they unlock?",
  use_case: "Use Case — What specific scenario does this angle address?",
  consequences: "Consequences — What happens if they don't act?",
  misconceptions: "Misconceptions — What do they incorrectly believe about this space?",
  education: "Education — What do they need to learn before they can buy?",
  acceptance: "Acceptance — What must they accept or acknowledge to move forward?",
  failed_solutions: "Failed Solutions — What have they already tried that didn't work?",
  identity: "Identity — How does this relate to how they see themselves?",
};

const SYSTEM_PROMPT = `You are an expert creative strategist who generates sharp, specific messaging angle content for a given strategic lens.

You will receive:
- A product/project description
- A pain point or desire
- A target audience
- A messaging angle title and description
- A specific strategic lens to fill

Generate 2-3 distinct candidate responses for the given lens. Each candidate should:
- Be 1-3 sentences long
- Be specific to the product, audience, and pain/desire combination
- Offer a unique perspective or framing
- Be written in a way that could directly inform ad copy, landing pages, or sales messaging
- Avoid generic platitudes — be concrete and actionable

Respond in this exact JSON format:
{
  "candidates": ["candidate 1 text", "candidate 2 text", "candidate 3 text"]
}

Return ONLY valid JSON, no markdown or extra text.`;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, angleId, lens } = body;

  if (!projectId || !angleId || !lens) {
    return NextResponse.json(
      { error: "projectId, angleId, and lens are required" },
      { status: 400 }
    );
  }

  if (!LENS_LABELS[lens]) {
    return NextResponse.json(
      { error: `Invalid lens: ${lens}` },
      { status: 400 }
    );
  }

  // Fetch project
  const { data: projectData } = await supabase
    .from("projects")
    .select("id, name, description, metadata")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  const project = projectData as any;

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch angle with related data
  const { data: angleData } = await supabase
    .from("messaging_angles")
    .select("id, title, description, tone, pain_desire_id, audience_id, lenses")
    .eq("id", angleId)
    .single();

  const angle = angleData as any;

  if (!angle) {
    return NextResponse.json({ error: "Angle not found" }, { status: 404 });
  }

  // Fetch pain/desire and audience
  let painDesireContext = "";
  let audienceContext = "";

  if (angle.pain_desire_id) {
    const { data: pdData } = await supabase
      .from("pain_desires")
      .select("type, title, description, intensity")
      .eq("id", angle.pain_desire_id)
      .single();

    const pd = pdData as any;

    if (pd) {
      painDesireContext = `${pd.type.toUpperCase()}: "${pd.title}"${pd.description ? ` — ${pd.description}` : ""} (intensity: ${pd.intensity}/10)`;
    }
  }

  if (angle.audience_id) {
    const { data: audData } = await supabase
      .from("audiences")
      .select("name, description")
      .eq("id", angle.audience_id)
      .single();

    const aud = audData as any;

    if (aud) {
      audienceContext = `"${aud.name}"${aud.description ? ` — ${aud.description}` : ""}`;
    }
  }

  // Build existing lenses context
  const existingLenses = angle.lenses as Record<string, string> | null;
  const filledLenses = existingLenses
    ? Object.entries(existingLenses)
        .filter(([key, val]) => key !== lens && val?.trim())
        .map(([key, val]) => `- ${LENS_LABELS[key]?.split(" — ")[0] ?? key}: ${val}`)
        .join("\n")
    : "";

  const userPrompt = [
    `PROJECT: ${project.name}`,
    project.description ? `PRODUCT DESCRIPTION: ${project.description}` : "",
    "",
    painDesireContext ? `PAIN/DESIRE: ${painDesireContext}` : "",
    audienceContext ? `TARGET AUDIENCE: ${audienceContext}` : "",
    "",
    `MESSAGING ANGLE: "${angle.title}"`,
    angle.description ? `ANGLE DESCRIPTION: ${angle.description}` : "",
    angle.tone ? `TONE: ${angle.tone}` : "",
    "",
    filledLenses ? `ALREADY FILLED LENSES:\n${filledLenses}\n` : "",
    `LENS TO FILL: ${LENS_LABELS[lens]}`,
    "",
    "Generate 2-3 distinct candidates for this lens.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const cleaned = textBlock.text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim(); const result = JSON.parse(cleaned);

    return NextResponse.json({
      candidates: result.candidates ?? [],
    });
  } catch (error) {
    console.error("AI step3 error:", error);
    return NextResponse.json(
      { error: "Failed to generate candidates" },
      { status: 500 }
    );
  }
}
