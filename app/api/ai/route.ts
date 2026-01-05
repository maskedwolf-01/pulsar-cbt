import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ reply: "SYSTEM: API Key Missing" });
  }

  try {
    const { prompt } = await req.json();

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
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
      return NextResponse.json({
        reply: `GOOGLE ERROR: ${data.error?.message || "Unknown error"}`
      });
    }

    return NextResponse.json({
      reply:
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No response from Gemini."
    });

  } catch (error: any) {
    return NextResponse.json({
      reply: `SERVER ERROR: ${error.message}`
    });
  }
      }
