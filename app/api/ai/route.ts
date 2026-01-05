export const runtime = "edge";

import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ reply: data.error?.message });
    }

    return NextResponse.json({
      reply: data.candidates[0].content.parts[0].text
    });

  } catch (e: any) {
    return NextResponse.json({ reply: e.message });
  }
       }
