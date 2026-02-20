import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a senior creative strategist with deep expertise in consumer psychology, brand positioning, and category-level marketing insight. Your job is to generate hyper-specific, commercially grounded pain points, desires, and audience segments for a given product — not generic marketing speak.

Respond in this exact JSON format:
{
  "pains": [
    { "title": "short pain point title", "description": "1-2 sentence elaboration", "intensity": 1-10 }
  ],
  "desires": [
    { "title": "short desire title", "description": "1-2 sentence elaboration", "intensity": 1-10 }
  ],
  "audiences": [
    { "name": "audience segment name", "description": "1-2 sentence description of this audience" }
  ]
}

Guidelines:
- Every pain, desire, and audience must be SPECIFIC to this exact product, category, and brand — never generic
- Pain points must name the real, felt frustration in the customer's own language — not a product feature restated as a problem
- Desires must describe a concrete outcome or identity shift the customer is chasing — not a feature or benefit list
- Audiences must be specific enough that you could write a single ad targeting only them — avoid broad labels like "young women" or "busy professionals"
- If approach is "pain", generate 5-6 pain points (higher intensity scores) and 2-3 desires
- If approach is "desire", generate 5-6 desires (higher intensity scores) and 2-3 pain points
- Always generate 3-5 audience segments
- Use the brand name, client name, and full product description to ground everything in the real category context
- Intensity reflects how acutely the audience experiences this (1=mild background irritation, 10=keeps them up at night)
- If a Step 1 AI rationale is provided, use it to sharpen your product category understanding

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
  const { projectId } = body;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    );
  }

  // Fetch full project context server-side for rich, specific suggestions
  const { data: projectData } = await (supabase
    .from("projects") as any)
    .select("id, name, description, principle_rationale, metadata, clients (name)")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (!projectData) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projectData as {
    id: string;
    name: string;
    description: string | null;
    principle_rationale: string | null;
    metadata: { organizing_approach?: string; ai_recommendation?: { rationale?: string } } | null;
    clients: { name: string } | null;
  };

  const approach = project.metadata?.organizing_approach ?? "pain";
  const clientName = project.clients?.name ?? null;
  const aiRationale = project.metadata?.ai_recommendation?.rationale ?? project.principle_rationale ?? null;

  // Build a rich, grounded user prompt
  const contextLines: string[] = [];

  if (clientName) {
    contextLines.push(`Brand / Client: ${clientName}`);
  }
  contextLines.push(`Project: ${project.name}`);
  if (project.description?.trim()) {
    contextLines.push(`Product / Service Description:\n${project.description.trim()}`);
  } else {
    contextLines.push(`Product / Service: ${project.name}`);
  }
  contextLines.push(`Chosen Messaging Approach: ${approach}-first`);
  if (aiRationale) {
    contextLines.push(`Step 1 Strategic Rationale: ${aiRationale}`);
  }

  const userPrompt = contextLines.join("\n\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const cleaned = textBlock.text
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json({
      pains: result.pains ?? [],
      desires: result.desires ?? [],
      audiences: result.audiences ?? [],
    });
  } catch (error) {
    console.error("AI step2 error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
