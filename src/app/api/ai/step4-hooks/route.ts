import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const AWARENESS_STAGE_GUIDANCE: Record<string, string> = {
  unaware:
    "The prospect doesn't know they have a problem. Use pattern interrupts, curiosity gaps, provocative questions, or surprising statistics to stop the scroll and surface a hidden frustration.",
  problem_aware:
    "The prospect knows the problem but not any solution. Agitate the pain, validate the struggle, reframe the problem from a new angle, or use stories that mirror their experience.",
  solution_aware:
    "The prospect knows solutions exist but hasn't chosen yours. Differentiate with a unique mechanism, challenge conventional approaches, compare without naming competitors, or highlight what others get wrong.",
  product_aware:
    "The prospect knows your product but hasn't bought. Handle objections head-on, stack social proof, create urgency, demonstrate transformation, or address the 'why now' question.",
  most_aware:
    "The prospect is ready to buy and just needs a push. Lead with the offer, add risk reversal, set a deadline, remind them of the pain of inaction, or make the next step effortless.",
};

const STAGE_KEYS = Object.keys(AWARENESS_STAGE_GUIDANCE);

const SYSTEM_PROMPT = `You are a world-class direct-response copywriter who writes scroll-stopping hooks for marketing campaigns.

A "hook" is the first 1-3 sentences of an ad, email, or post that grabs attention and compels the reader to keep going. Great hooks are specific, emotionally resonant, and create an open loop.

You will receive:
- A product/project description
- A messaging angle (the strategic perspective)
- A target awareness stage with guidance on what works at that level
- A brand tone to match
- Context about the audience and pain/desire

Generate 3-5 distinct hook variations. Each hook should:
- Be 1-3 sentences long
- Match the specified awareness stage strategy
- Use the specified brand tone
- Be ready to use as opening copy (not a headline — a conversational opener)
- Each variation should use a DIFFERENT hook type (question, statistic, story, contradiction, challenge, or metaphor) where possible

Respond in this exact JSON format:
{
  "hooks": [
    { "content": "hook text here", "type": "question" },
    { "content": "hook text here", "type": "story" },
    { "content": "hook text here", "type": "statistic" }
  ]
}

Valid types: question, statistic, story, contradiction, challenge, metaphor.

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
  const { projectId, angleId, awarenessStage, brandTone } = body;

  if (!projectId || !angleId || !awarenessStage) {
    return NextResponse.json(
      { error: "projectId, angleId, and awarenessStage are required" },
      { status: 400 }
    );
  }

  if (!STAGE_KEYS.includes(awarenessStage)) {
    return NextResponse.json(
      { error: `Invalid awarenessStage: ${awarenessStage}` },
      { status: 400 }
    );
  }

  // Verify project ownership
  const { data: projectData } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  const project = projectData as any;

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch the messaging angle
  const { data: angleData } = await supabase
    .from("messaging_angles")
    .select("title, description, tone, pain_desire_id, audience_id, lenses")
    .eq("id", angleId)
    .single();

  const angle = angleData as any;

  if (!angle) {
    return NextResponse.json({ error: "Angle not found" }, { status: 404 });
  }

  // Build context from angle's pain/desire and audience
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

  // Build existing hooks context to avoid duplicates
  const { data: existingHooks } = await supabase
    .from("hooks")
    .select("content")
    .eq("messaging_angle_id", angleId);

  const existingContext = existingHooks?.length
    ? `\n\nEXISTING HOOKS (generate different ones):\n${(existingHooks as any[]).map((h) => `- "${h.content}"`).join("\n")}`
    : "";

  // Build lens context
  const lenses = angle.lenses as Record<string, string> | null;
  const lensContext = lenses
    ? Object.entries(lenses)
        .filter(([, v]) => v?.trim())
        .slice(0, 5)
        .map(([key, val]) => `- ${key.replace(/_/g, " ")}: ${val}`)
        .join("\n")
    : "";

  const tone = brandTone || angle.tone || "conversational";
  const stageGuidance = AWARENESS_STAGE_GUIDANCE[awarenessStage];

  const userPrompt = [
    `PROJECT: ${project.name}`,
    project.description ? `PRODUCT: ${project.description}` : "",
    "",
    painDesireContext ? `PAIN/DESIRE: ${painDesireContext}` : "",
    audienceContext ? `TARGET AUDIENCE: ${audienceContext}` : "",
    "",
    `MESSAGING ANGLE: "${angle.title}"`,
    angle.description ? `ANGLE DESCRIPTION: ${angle.description}` : "",
    "",
    lensContext ? `STRATEGIC LENS INSIGHTS:\n${lensContext}\n` : "",
    `AWARENESS STAGE: ${awarenessStage.replace(/_/g, " ").toUpperCase()}`,
    `STAGE GUIDANCE: ${stageGuidance}`,
    "",
    `BRAND TONE: ${tone}`,
    existingContext,
    "",
    "Generate 3-5 distinct hook variations for this angle and awareness stage.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const result = JSON.parse(textBlock.text);
    const hooks: string[] = (result.hooks ?? []).map(
      (h: { content: string; type?: string }) => h.content
    );

    return NextResponse.json({ hooks });
  } catch (error) {
    console.error("AI step4-hooks error:", error);
    return NextResponse.json(
      { error: "Failed to generate hooks" },
      { status: 500 }
    );
  }
}
