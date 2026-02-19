import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a creative strategist who generates sharp, specific messaging angles for marketing campaigns.

A messaging angle is a strategic perspective that connects a specific pain point or desire to a target audience. It defines the "angle of attack" for copy — the framing, emotion, and logical argument that will resonate.

Given a product, a pain point or desire, and a target audience, generate 2-3 distinct messaging angle candidates.

Each candidate should include:
- title: A concise, punchy angle name (5-10 words)
- description: 1-2 sentences explaining the strategic rationale
- tone: The emotional register (e.g. "urgent", "empathetic", "aspirational", "confrontational", "educational")

The angles should be meaningfully different from each other — not just word variations. Think different emotional triggers, different logical frameworks, different entry points into the conversation.

Respond in this exact JSON format:
{
  "angles": [
    { "title": "...", "description": "...", "tone": "..." }
  ]
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
  const { projectId, painDesireId, audienceId } = body;

  if (!projectId || !painDesireId || !audienceId) {
    return NextResponse.json(
      { error: "projectId, painDesireId, and audienceId are required" },
      { status: 400 }
    );
  }

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

  const { data: painDesireData } = await supabase
    .from("pain_desires")
    .select("type, title, description, intensity")
    .eq("id", painDesireId)
    .single();

  const painDesire = painDesireData as any;

  const { data: audienceData } = await supabase
    .from("audiences")
    .select("name, description")
    .eq("id", audienceId)
    .single();

  const audience = audienceData as any;

  if (!painDesire || !audience) {
    return NextResponse.json(
      { error: "Pain/desire or audience not found" },
      { status: 404 }
    );
  }

  // Check for existing angles to avoid duplicates
  const { data: existingAngles } = await supabase
    .from("messaging_angles")
    .select("title")
    .eq("project_id", projectId)
    .eq("pain_desire_id", painDesireId)
    .eq("audience_id", audienceId);

  const existingContext = existingAngles?.length
    ? `\n\nEXISTING ANGLES (generate different ones):\n${(existingAngles as any[]).map((a) => `- ${a.title}`).join("\n")}`
    : "";

  const userPrompt = [
    `PROJECT: ${project.name}`,
    project.description ? `PRODUCT: ${project.description}` : "",
    "",
    `${painDesire.type.toUpperCase()}: "${painDesire.title}"`,
    painDesire.description ? `Details: ${painDesire.description}` : "",
    `Intensity: ${painDesire.intensity}/10`,
    "",
    `TARGET AUDIENCE: "${audience.name}"`,
    audience.description ? `Details: ${audience.description}` : "",
    existingContext,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 768,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const cleaned = textBlock.text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim(); const result = JSON.parse(cleaned);
    return NextResponse.json({ angles: result.angles ?? [] });
  } catch (error) {
    console.error("AI angles error:", error);
    return NextResponse.json(
      { error: "Failed to generate angles" },
      { status: 500 }
    );
  }
}
