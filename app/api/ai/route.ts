import { NextResponse } from "next/server";

export const runtime = "edge";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const DEBUG_MODE = process.env.DEBUG_MODE === "true"; // Set in .env

// Preferred models in priority order
const PREFERRED_MODELS = [
  "models/gemini-pro-latest",
  "models/gemini-flash-latest",
  "models/gemini-2.5-pro",
  "models/gemini-2.5-flash"
];

// In-memory cache
let cachedModel: string | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

async function getWorkingModel() {
  const now = Date.now();

  if (cachedModel && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    if (DEBUG_MODE) console.log(`[DEBUG] Using cached model: ${cachedModel}`);
    return cachedModel;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
  );
  const data = await res.json();

  const validModels = data.models.filter((m: any) =>
    m.supportedGenerationMethods.includes("generateContent")
  );

  for (const model of PREFERRED_MODELS) {
    if (validModels.some((m: any) => m.name === model)) {
      cachedModel = model;
      cacheTimestamp = now;
      if (DEBUG_MODE) console.log(`[DEBUG] Selected model: ${cachedModel}`);
      return model;
    }
  }

  cachedModel = validModels[0]?.name || null;
  cacheTimestamp = now;
  if (DEBUG_MODE) console.log(`[DEBUG] Fallback model: ${cachedModel}`);
  return cachedModel;
}

// POST handler with streaming
export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ reply: "SYSTEM: API Key Missing" });
  }

  try {
    const { prompt } = await req.json();
    const model = await getWorkingModel();
    if (!model) return NextResponse.json({ reply: "No working model found." });

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    // Streamed response
    const stream = new ReadableStream({
      async start(controller) {
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: `You are Nexus. Respond naturally, token by token.\nUser: ${prompt}` }] }
            ],
            // Enable streaming if Gemini supports it
            // Some Gemini endpoints might require a streaming-specific flag
            // Uncomment if needed:
            // streaming: true
          })
        });

        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" }
    });

  } catch (e: any) {
    console.error(`[ERROR]`, e.message);
    return NextResponse.json({ reply: `SERVER ERROR: ${e.message}` });
  }
}
