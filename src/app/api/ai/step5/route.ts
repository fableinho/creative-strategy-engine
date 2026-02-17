import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

// Mirrors FORMAT_TEMPLATES from format-card-grid.tsx — kept server-side to avoid client import
const FORMAT_CATALOG = [
  { id: "story-origin", category: "Storytelling", name: "Origin Story", description: "How the product/idea came to be — the 'aha' moment", structure: "Setup → Inciting incident → Discovery → Resolution → CTA" },
  { id: "story-customer-journey", category: "Storytelling", name: "Customer Journey", description: "A real customer's path from struggle to success", structure: "Meet [name] → Their struggle → Finding you → The result → CTA" },
  { id: "story-day-in-life", category: "Storytelling", name: "Day in the Life", description: "Show how the product fits into daily routine", structure: "Morning without → Discovery moment → Evening with → Contrast → CTA" },
  { id: "story-unexpected-lesson", category: "Storytelling", name: "Unexpected Lesson", description: "A surprising insight that reframes the problem", structure: "Conventional wisdom → The twist → New understanding → Application → CTA" },
  { id: "story-open-loop", category: "Storytelling", name: "Open Loop Narrative", description: "Start mid-action to hook curiosity, then close the loop", structure: "In medias res → Backstory → Climax → Resolution → CTA" },
  { id: "ba-transformation", category: "Before/After", name: "Full Transformation", description: "Vivid contrast between the old life and the new life", structure: "Paint the 'before' → Bridge moment → Paint the 'after' → How to get there → CTA" },
  { id: "ba-side-by-side", category: "Before/After", name: "Side-by-Side Compare", description: "Two parallel scenarios running simultaneously", structure: "Without [product] → With [product] → Key differences → Social proof → CTA" },
  { id: "ba-time-machine", category: "Before/After", name: "Time Machine", description: "Letter to past self or future projection", structure: "Dear past me → What I wish I knew → What changed → The result today → CTA" },
  { id: "ba-metrics-shift", category: "Before/After", name: "Metrics Shift", description: "Hard numbers before and after, data-driven proof", structure: "Before metrics → The change → After metrics → Timeline → CTA" },
  { id: "ba-emotional-state", category: "Before/After", name: "Emotional State Change", description: "Focus on feelings and mindset transformation", structure: "Frustration/fear → Turning point → Relief/confidence → Identity shift → CTA" },
  { id: "founder-struggle", category: "Founder Story", name: "The Struggle That Started It", description: "Personal pain that led to building the solution", structure: "My problem → Failed attempts → The breakthrough → Why I built this → CTA" },
  { id: "founder-contrarian", category: "Founder Story", name: "Contrarian Bet", description: "Why the founder went against industry norms", structure: "What everyone does → Why I disagreed → The risk I took → The result → CTA" },
  { id: "founder-behind-scenes", category: "Founder Story", name: "Behind the Scenes", description: "Transparent look at how decisions are made", structure: "The decision we faced → Our reasoning → What we chose → Why it matters to you → CTA" },
  { id: "founder-mission", category: "Founder Story", name: "Mission Statement", description: "The 'why' behind the company, values-driven", structure: "What we believe → What we saw wrong → What we're building → Join us → CTA" },
  { id: "uvt-old-way-new-way", category: "Us Vs Them", name: "Old Way vs New Way", description: "Position your approach as the evolution", structure: "The old way (pain) → Why it's broken → The new way → Proof it works → CTA" },
  { id: "uvt-myth-buster", category: "Us Vs Them", name: "Myth Buster", description: "Debunk a common belief, position as the truth-teller", structure: "Common belief → Why it's wrong → The real truth → Our approach → CTA" },
  { id: "uvt-category-comparison", category: "Us Vs Them", name: "Category Comparison", description: "Compare entire categories, not just competitors", structure: "Category A problems → Category B problems → Our category → Why different → CTA" },
  { id: "uvt-hidden-cost", category: "Us Vs Them", name: "Hidden Cost Expose", description: "Reveal what alternatives really cost (time, money, stress)", structure: "Surface cost → Hidden costs → True total → Our alternative → CTA" },
  { id: "sp-testimonial-stack", category: "Social Proof", name: "Testimonial Stack", description: "Layer multiple testimonials around a single theme", structure: "Bold claim → Proof 1 → Proof 2 → Proof 3 → Your turn → CTA" },
  { id: "sp-case-study-mini", category: "Social Proof", name: "Mini Case Study", description: "Condensed success story with specific results", structure: "Client situation → Challenge → What we did → Results (numbers) → CTA" },
  { id: "sp-social-surge", category: "Social Proof", name: "Social Surge", description: "Momentum-based proof — everyone is switching", structure: "Trend/movement → Who's joining → Why now → FOMO trigger → CTA" },
  { id: "sp-results-collage", category: "Social Proof", name: "Results Collage", description: "Rapid-fire results from different customers", structure: "Result 1 → Result 2 → Result 3 → Pattern reveal → CTA" },
];

const VALID_FORMAT_IDS = new Set(FORMAT_CATALOG.map((f) => f.id));

const AWARENESS_LABELS: Record<string, string> = {
  unaware: "Unaware — doesn't know they have a problem",
  problem_aware: "Problem Aware — knows the problem, not the solution",
  solution_aware: "Solution Aware — knows solutions exist, not yours",
  product_aware: "Product Aware — knows your product, hasn't bought",
  most_aware: "Most Aware — ready to buy, needs a push",
};

const formatCatalogBlock = FORMAT_CATALOG.map(
  (f) => `- ${f.id} | ${f.category} | "${f.name}" — ${f.description} | Structure: ${f.structure}`
).join("\n");

const SYSTEM_PROMPT = `You are a creative strategist who matches marketing hooks to the best creative format templates.

You will receive a hook (its content, type, and awareness stage) along with context about the product, messaging angle, audience, and pain/desire.

Your job is to rank the available creative format templates from best fit to worst fit for this specific hook and awareness stage. Return the top 5-8 best matches.

Consider:
- How well the format's narrative structure complements the hook's opening
- Whether the format matches the awareness stage (e.g. "Before/After" is great for problem-aware, "Social Proof" for product-aware)
- Whether the hook type (question, story, statistic, etc.) naturally leads into the format's structure
- Whether the format can leverage the specific pain/desire and audience context

AVAILABLE FORMAT TEMPLATES:
${formatCatalogBlock}

Respond in this exact JSON format:
{
  "recommendations": [
    { "format_id": "story-origin", "rank": 1, "rationale": "1-2 sentence explanation of why this format fits" },
    { "format_id": "ba-transformation", "rank": 2, "rationale": "..." }
  ]
}

Return ONLY valid JSON, no markdown or extra text. Use only format_id values from the list above.`;

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
    .select("id, content, type, awareness_stage, messaging_angle_id")
    .eq("id", hookId)
    .single();

  if (!hook) {
    return NextResponse.json({ error: "Hook not found" }, { status: 404 });
  }

  // Fetch the messaging angle for context
  const { data: angle } = await supabase
    .from("messaging_angles")
    .select("title, description, tone, pain_desire_id, audience_id, lenses")
    .eq("id", hook.messaging_angle_id)
    .single();

  // Build context
  let painDesireContext = "";
  let audienceContext = "";

  if (angle?.pain_desire_id) {
    const { data: pd } = await supabase
      .from("pain_desires")
      .select("type, title, description, intensity")
      .eq("id", angle.pain_desire_id)
      .single();

    if (pd) {
      painDesireContext = `${pd.type.toUpperCase()}: "${pd.title}"${pd.description ? ` — ${pd.description}` : ""} (intensity: ${pd.intensity}/10)`;
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

  // Build lens context
  const lenses = angle?.lenses as Record<string, string> | null;
  const lensContext = lenses
    ? Object.entries(lenses)
        .filter(([, v]) => v?.trim())
        .slice(0, 5)
        .map(([key, val]) => `- ${key.replace(/_/g, " ")}: ${val}`)
        .join("\n")
    : "";

  const stageLabel = AWARENESS_LABELS[hook.awareness_stage] ?? hook.awareness_stage;

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
    "Rank the top 5-8 best creative format templates for this hook.",
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

    // Validate and filter to only known format IDs
    const recommendations = (result.recommendations ?? [])
      .filter(
        (r: { format_id: string }) => VALID_FORMAT_IDS.has(r.format_id)
      )
      .map((r: { format_id: string; rank: number; rationale: string }, i: number) => ({
        format_id: r.format_id,
        rank: r.rank ?? i + 1,
        rationale: r.rationale ?? "",
      }));

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("AI step5 error:", error);
    return NextResponse.json(
      { error: "Failed to suggest formats" },
      { status: 500 }
    );
  }
}
