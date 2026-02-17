import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a creative strategy expert who deeply understands customer psychology and market segmentation. Given a product/service description and the chosen messaging approach (pain-first or desire-first), generate relevant pain points, desires, and target audiences.

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
- Generate 4-6 pain points that are specific and emotionally resonant (not generic)
- Generate 3-5 desires that represent real aspirations of the target market
- Generate 3-5 distinct audience segments that would buy this product
- If approach is "pain", weight pain points with higher intensity and more entries
- If approach is "desire", weight desires with higher intensity and more entries
- Pain points should describe real frustrations, not just the absence of the product
- Desires should describe outcomes, not features
- Audiences should be specific enough to write targeted copy for
- Intensity reflects how strongly the audience feels this pain/desire (1=mild, 10=acute)

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
  const { productDescription, projectId, approach } = body;

  if (!productDescription || typeof productDescription !== "string") {
    return NextResponse.json(
      { error: "productDescription is required" },
      { status: 400 }
    );
  }

  if (projectId) {
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("owner_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
  }

  try {
    const userPrompt = [
      `Product/Service Description:\n${productDescription}`,
      approach ? `\nMessaging Approach: ${approach}-first` : "",
    ].join("");

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
