import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a creative strategy expert specializing in marketing psychology. Given a product or service description, you must recommend whether a "pain-first" or "desire-first" messaging approach will be more effective.

Analyze the product category, target market signals, and emotional dynamics to make your recommendation.

Respond in this exact JSON format:
{
  "recommendation": "pain" | "desire",
  "confidence": number between 0.6 and 1.0,
  "rationale": "2-3 sentence explanation of why this approach fits",
  "product_category": "inferred category name",
  "key_factors": ["factor1", "factor2", "factor3"]
}

Guidelines:
- Pain-first works best for: compliance/risk products, problem-solving tools, insurance, security, health remediation, productivity bottlenecks, cost reduction
- Desire-first works best for: aspirational brands, lifestyle products, growth tools, creative platforms, luxury goods, status symbols, personal development
- Consider the emotional weight: urgent problems lean pain-first, ambitious goals lean desire-first
- If truly ambiguous, lean toward pain-first (it typically has stronger conversion rates)

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
  const { productDescription, projectId } = body;

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
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Product/Service Description:\n\n${productDescription}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const recommendation = JSON.parse(textBlock.text);

    return NextResponse.json({
      recommendation: recommendation.recommendation,
      confidence: recommendation.confidence,
      rationale: recommendation.rationale,
      productCategory: recommendation.product_category,
      keyFactors: recommendation.key_factors,
    });
  } catch (error) {
    console.error("AI step1 error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
