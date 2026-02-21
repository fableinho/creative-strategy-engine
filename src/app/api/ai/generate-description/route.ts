import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a creative strategist writing a product/brand description for a marketing brief.

Given a project name and client or brand name, write a concise description that explains:
- What the product or service is and what it does
- Who it's for (infer from the name if possible)
- The core value it delivers

Rules:
- 2–3 sentences maximum
- Plain, specific language — no marketing fluff or superlatives
- Write as if briefing a copywriter who has never heard of this brand
- If the project or brand name is ambiguous, make a reasonable assumption and write confidently

Respond with ONLY the description text. No preamble, labels, or formatting.`;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectName, clientName } = body;

  if (!projectName || typeof projectName !== "string") {
    return NextResponse.json(
      { error: "projectName is required" },
      { status: 400 }
    );
  }

  if (!clientName || typeof clientName !== "string") {
    return NextResponse.json(
      { error: "clientName is required" },
      { status: 400 }
    );
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Project: ${projectName.trim()}\nBrand / Client: ${clientName.trim()}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    return NextResponse.json({ description: textBlock.text.trim() });
  } catch (error) {
    console.error("AI generate-description error:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
