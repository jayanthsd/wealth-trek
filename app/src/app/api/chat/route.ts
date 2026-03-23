import { NextRequest } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

const FINANCIAL_ADVISOR_SYSTEM_PROMPT = `You are a friendly, knowledgeable financial advisor AI assistant. Your role is to:

1. Help users understand their financial position based on their net worth data
2. Provide actionable advice on wealth building, debt management, and financial planning
3. Help users set realistic financial goals
4. Explain financial concepts in simple terms
5. Suggest strategies for improving their net worth over time

Guidelines:
- Be encouraging but realistic
- Use Indian Rupee (₹) for currency references when discussing the user's data
- When suggesting a financial goal, clearly format it so the user can save it. Include a clear goal title and description.
- When you identify a goal in conversation, end that message with a JSON block in this exact format:
  |||GOAL|||{"title": "Goal title", "description": "Goal description", "targetAmount": 1000000, "targetDate": "2027-12-31"}|||END_GOAL|||
  The targetAmount and targetDate fields are optional.
- Never provide specific investment advice or recommend specific financial products
- Always remind users to consult a certified financial planner for major decisions
- Keep responses concise and actionable`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, snapshotSummary } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let openai;
    try {
      openai = getOpenAIClient();
    } catch {
      return new Response(
        JSON.stringify({
          error: "OPENAI_API_KEY is not configured. Please set it in .env.local.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = FINANCIAL_ADVISOR_SYSTEM_PROMPT;
    if (snapshotSummary) {
      systemPrompt += `\n\nUser's latest financial snapshot:\n${snapshotSummary}`;
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message =
      error instanceof Error ? error.message : "Chat request failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
