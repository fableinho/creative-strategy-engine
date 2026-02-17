import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const AWARENESS_STAGES = [
  {
    key: "unaware",
    label: "Unaware",
    description: "Doesn't know they have a problem",
  },
  {
    key: "problem_aware",
    label: "Problem Aware",
    description: "Knows the problem, not the solution",
  },
  {
    key: "solution_aware",
    label: "Solution Aware",
    description: "Knows solutions exist, not yours specifically",
  },
  {
    key: "product_aware",
    label: "Product Aware",
    description: "Knows your product, hasn't bought yet",
  },
  {
    key: "most_aware",
    label: "Most Aware",
    description: "Ready to buy, just needs a final push",
  },
] as const;

const STAGE_KEYS = AWARENESS_STAGES.map((s) => s.key);

const SYSTEM_PROMPT = `You are an expert direct-response strategist who classifies messaging hooks into Eugene Schwartz's 5 levels of market awareness.

The 5 awareness stages are:
1. Unaware — The prospect doesn't know they have a problem. Hooks should create pattern interrupts, provoke curiosity, or surface hidden frustrations.
2. Problem Aware — The prospect knows the problem but not any solution. Hooks should agitate the pain, validate the struggle, or reframe the problem.
3. Solution Aware — The prospect knows solutions exist but hasn't chosen yours. Hooks should differentiate, compare, or highlight a unique mechanism.
4. Product Aware — The prospect knows your product but hasn't purchased. Hooks should handle objections, provide social proof, or create urgency.
5. Most Aware — The prospect is ready to buy and just needs a push. Hooks should offer deals, deadlines, risk reversal, or remind them why they wanted it.

Given a hook (its content, type, and the messaging angle it belongs to), classify it into the most appropriate awareness stage.

Respond in this exact JSON format:
{
  "stage": "unaware" | "problem_aware" | "solution_aware" | "product_aware" | "most_aware",
  "reason": "1-2 sentence explanation of why this hook fits this stage"
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
  const { projectId, hookId } = body;

  if (!projectId || !hookId) {
    return NextResponse.json(
      { error: "projectId and hookId are required" },
      { status: 400 }
    );
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch hook
  const { data: hook } = await supabase
    .from("hooks")
    .select("id, content, type, messaging_angle_id")
    .eq("id", hookId)
    .single();

  if (!hook) {
    return NextResponse.json({ error: "Hook not found" }, { status: 404 });
  }

  // Fetch the messaging angle for context
  const { data: angle } = await supabase
    .from("messaging_angles")
    .select("title, description, tone, pain_desire_id, audience_id")
    .eq("id", hook.messaging_angle_id)
    .single();

  // Build context from angle's pain/desire and audience
  let painDesireContext = "";
  let audienceContext = "";

  if (angle?.pain_desire_id) {
    const { data: pd } = await supabase
      .from("pain_desires")
      .select("type, title, description")
      .eq("id", angle.pain_desire_id)
      .single();

    if (pd) {
      painDesireContext = `${pd.type.toUpperCase()}: "${pd.title}"${pd.description ? ` — ${pd.description}` : ""}`;
    }
  }

  if (angle?.audience_id) {
    const { data: aud } = await supabase
      .from("audiences")
      .select("name, description")
      .eq("id", angle.audience_id)
      .single();

    if (aud) {
      audienceContext = `"${aud.name}"${aud.description ? ` — ${aud.description}` : ""}`;
    }
  }

  const userPrompt = [
    `PROJECT: ${project.name}`,
    project.description ? `PRODUCT: ${project.description}` : "",
    "",
    painDesireContext ? `PAIN/DESIRE: ${painDesireContext}` : "",
    audienceContext ? `TARGET AUDIENCE: ${audienceContext}` : "",
    "",
    angle ? `MESSAGING ANGLE: "${angle.title}"` : "",
    angle?.description ? `ANGLE DESCRIPTION: ${angle.description}` : "",
    angle?.tone ? `TONE: ${angle.tone}` : "",
    "",
    `HOOK TYPE: ${hook.type}`,
    `HOOK CONTENT: "${hook.content}"`,
    "",
    "Classify this hook into the most appropriate awareness stage.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const result = JSON.parse(textBlock.text);

    // Validate the returned stage
    const stage = STAGE_KEYS.includes(result.stage) ? result.stage : null;
    if (!stage) {
      throw new Error(`Invalid stage returned: ${result.stage}`);
    }

    return NextResponse.json({
      stage,
      reason: result.reason ?? "",
    });
  } catch (error) {
    console.error("AI step4-stage error:", error);
    return NextResponse.json(
      { error: "Failed to classify hook" },
      { status: 500 }
    );
  }
}
