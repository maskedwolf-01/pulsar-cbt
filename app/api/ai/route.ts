export const runtime = "edge";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* =======================
   ENV VARIABLES
======================= */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/* =======================
   CLIENTS
======================= */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =======================
   GEMINI CONFIG
======================= */
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/* =======================
   API ROUTE
======================= */
export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ reply: "SYSTEM ERROR: Missing Gemini API key" });
  }

  try {
    const { prompt, userId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ reply: "No prompt provided." });
    }

    /* =======================
       SAVE USER MESSAGE
    ======================= */
    if (userId) {
      await supabase.from("messages").insert({
        user_id: userId,
        role: "user",
        content: prompt
      });
    }

    /* =======================
       CALL GEMINI
    ======================= */
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are Nexus, a smart, concise, friendly AI assistant.\n\nUser: ${prompt}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        reply: `GOOGLE ERROR: ${data.error?.message || "Unknown error"}`
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No response from AI.";

    /* =======================
       SAVE AI MESSAGE
    ======================= */
    if (userId) {
      await supabase.from("messages").insert({
        user_id: userId,
        role: "assistant",
        content: reply
      });
    }

    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({
      reply: `SERVER ERROR: ${err.message}`
    });
  }
}
