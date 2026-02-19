import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const FORMAT_CATALOG: Record<
  string,
  { name: string; category: string; description: string; structure: string }
> = {
  "story-origin": { name: "Origin Story", category: "Storytelling", description: "How the product/idea came to be — the 'aha' moment", structure: "Setup → Inciting incident → Discovery → Resolution → CTA" },
  "story-customer-journey": { name: "Customer Journey", category: "Storytelling", description: "A real customer's path from struggle to success", structure: "Meet [name] → Their struggle → Finding you → The result → CTA" },
  "story-day-in-life": { name: "Day in the Life", category: "Storytelling", description: "Show how the product fits into daily routine", structure: "Morning without → Discovery moment → Evening with → Contrast → CTA" },
  "story-unexpected-lesson": { name: "Unexpected Lesson", category: "Storytelling", description: "A surprising insight that reframes the problem", structure: "Conventional wisdom → The twist → New understanding → Application → CTA" },
  "story-open-loop": { name: "Open Loop Narrative", category: "Storytelling", description: "Start mid-action to hook curiosity, then close the loop", structure: "In medias res → Backstory → Climax → Resolution → CTA" },
  "ba-transformation": { name: "Full Transformation", category: "Before/After", description: "Vivid contrast between the old life and the new life", structure: "Paint the 'before' → Bridge moment → Paint the 'after' → How to get there → CTA" },
  "ba-side-by-side": { name: "Side-by-Side Compare", category: "Before/After", description: "Two parallel scenarios running simultaneously", structure: "Without [product] → With [product] → Key differences → Social proof → CTA" },
  "ba-time-machine": { name: "Time Machine", category: "Before/After", description: "Letter to past self or future projection", structure: "Dear past me → What I wish I knew → What changed → The result today → CTA" },
  "ba-metrics-shift": { name: "Metrics Shift", category: "Before/After", description: "Hard numbers before and after, data-driven proof", structure: "Before metrics → The change → After metrics → Timeline → CTA" },
  "ba-emotional-state": { name: "Emotional State Change", category: "Before/After", description: "Focus on feelings and mindset transformation", structure: "Frustration/fear → Turning point → Relief/confidence → Identity shift → CTA" },
  "founder-struggle": { name: "The Struggle That Started It", category: "Founder Story", description: "Personal pain that led to building the solution", structure: "My problem → Failed attempts → The breakthrough → Why I built this → CTA" },
  "founder-contrarian": { name: "Contrarian Bet", category: "Founder Story", description: "Why the founder went against industry norms", structure: "What everyone does → Why I disagreed → The risk I took → The result → CTA" },
  "founder-behind-scenes": { name: "Behind the Scenes", category: "Founder Story", description: "Transparent look at how decisions are made", structure: "The decision we faced → Our reasoning → What we chose → Why it matters to you → CTA" },
  "founder-mission": { name: "Mission Statement", category: "Founder Story", description: "The 'why' behind the company, values-driven", structure: "What we believe → What we saw wrong → What we're building → Join us → CTA" },
  "uvt-old-way-new-way": { name: "Old Way vs New Way", category: "Us Vs Them", description: "Position your approach as the evolution", structure: "The old way (pain) → Why it's broken → The new way → Proof it works → CTA" },
  "uvt-myth-buster": { name: "Myth Buster", category: "Us Vs Them", description: "Debunk a common belief, position as the truth-teller", structure: "Common belief → Why it's wrong → The real truth → Our approach → CTA" },
  "uvt-category-comparison": { name: "Category Comparison", category: "Us Vs Them", description: "Compare entire categories, not just competitors", structure: "Category A problems → Category B problems → Our category → Why different → CTA" },
  "uvt-hidden-cost": { name: "Hidden Cost Expose", category: "Us Vs Them", description: "Reveal what alternatives really cost (time, money, stress)", structure: "Surface cost → Hidden costs → True total → Our alternative → CTA" },
  "sp-testimonial-stack": { name: "Testimonial Stack", category: "Social Proof", description: "Layer multiple testimonials around a single theme", structure: "Bold claim → Proof 1 → Proof 2 → Proof 3 → Your turn → CTA" },
  "sp-case-study-mini": { name: "Mini Case Study", category: "Social Proof", description: "Condensed success story with specific results", structure: "Client situation → Challenge → What we did → Results (numbers) → CTA" },
  "sp-social-surge": { name: "Social Surge", category: "Social Proof", description: "Momentum-based proof — everyone is switching", structure: "Trend/movement → Who's joining → Why now → FOMO trigger → CTA" },
  "sp-results-collage": { name: "Results Collage", category: "Social Proof", description: "Rapid-fire results from different customers", structure: "Result 1 → Result 2 → Result 3 → Pattern reveal → CTA" },
};

const AWARENESS_LABELS: Record<string, string> = {
  unaware: "Unaware — doesn't know they have a problem",
  problem_aware: "Problem Aware — knows the problem, not the solution",
  solution_aware: "Solution Aware — knows solutions exist, not yours",
  product_aware: "Product Aware — knows your product, hasn't bought",
  most_aware: "Most Aware — ready to buy, needs a push",
};

const SYSTEM_PROMPT = `You are an expert creative director who writes detailed concept outlines and scripts for marketing content.

Given a hook (the opening), a creative format template (the narrative structure), and strategic context (product, audience, pain/desire, messaging angle), produce a concept outline that a copywriter or content creator can immediately execute.

Your concept outline should:
- Start with the hook as the opening line(s)
- Follow the format's narrative structure step by step
- Include specific talking points, emotional beats, and transitions for each section
- Suggest concrete examples, metaphors, or data points to include
- End with a clear, compelling call to action
- Be 150-300 words — detailed enough to execute but concise enough to scan quickly
- Match the tone of the messaging angle

Format the outline with clear section headers using the format's structure steps (e.g. "SETUP:", "INCITING INCIDENT:", etc.).

Return your response in this exact JSON format:
{
  "concept_notes": "The full concept outline text with section headers and content"
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
  const { projectId, formatExecutionId } = body;

  if (!projectId || !formatExecutionId) {
    return NextResponse.json(
      { error: "projectId and formatExecutionId are required" },
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

  // Fetch format execution
  const { data: feData } = await supabase
    .from("format_executions")
    .select("id, hook_id, template_id")
    .eq("id", formatExecutionId)
    .single();

  const fe = feData as any;

  if (!fe) {
    return NextResponse.json(
      { error: "Format execution not found" },
      { status: 404 }
    );
  }

  if (!fe.template_id || !FORMAT_CATALOG[fe.template_id]) {
    return NextResponse.json(
      { error: "Invalid or missing template_id" },
      { status: 400 }
    );
  }

  const template = FORMAT_CATALOG[fe.template_id];

  // Fetch hook
  const { data: hookData } = await supabase
    .from("hooks")
    .select("id, content, type, awareness_stage, messaging_angle_id")
    .eq("id", fe.hook_id)
    .single();

  const hook = hookData as any;

  if (!hook) {
    return NextResponse.json({ error: "Hook not found" }, { status: 404 });
  }

  // Fetch the messaging angle
  const { data: angleData } = await supabase
    .from("messaging_angles")
    .select("title, description, tone, pain_desire_id, audience_id, lenses")
    .eq("id", hook.messaging_angle_id)
    .single();

  const angle = angleData as any;

  // Build context
  let painDesireContext = "";
  let audienceContext = "";

  if (angle?.pain_desire_id) {
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

  if (angle?.audience_id) {
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

  // Lens context
  const lenses = angle?.lenses as Record<string, string> | null;
  const lensContext = lenses
    ? Object.entries(lenses)
        .filter(([, v]) => v?.trim())
        .slice(0, 5)
        .map(([key, val]) => `- ${key.replace(/_/g, " ")}: ${val}`)
        .join("\n")
    : "";

  const stageLabel =
    AWARENESS_LABELS[hook.awareness_stage] ?? hook.awareness_stage;

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
    lensContext ? `STRATEGIC LENS INSIGHTS:\n${lensContext}\n` : "",
    `AWARENESS STAGE: ${stageLabel}`,
    "",
    `HOOK TYPE: ${hook.type}`,
    `HOOK CONTENT: "${hook.content}"`,
    "",
    `CREATIVE FORMAT: "${template.name}" (${template.category})`,
    `FORMAT DESCRIPTION: ${template.description}`,
    `FORMAT STRUCTURE: ${template.structure}`,
    "",
    "Write a detailed concept outline following this format's structure, starting with the hook as the opening.",
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

    const cleaned = textBlock.text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim(); const result = JSON.parse(cleaned);
    const conceptNotes = result.concept_notes ?? "";

    // Save to DB
    const { error: updateError } = await (supabase
      .from("format_executions") as any)
      .update({ concept_notes: conceptNotes })
      .eq("id", formatExecutionId);

    if (updateError) {
      console.error("Failed to save concept_notes:", updateError);
    }

    return NextResponse.json({ concept_notes: conceptNotes });
  } catch (error) {
    console.error("AI step5-concept error:", error);
    return NextResponse.json(
      { error: "Failed to generate concept" },
      { status: 500 }
    );
  }
}
