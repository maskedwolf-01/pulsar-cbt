import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// SWITCHED TO STABLE MODEL (gemini-pro)
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ reply: "SYSTEM ERROR: API Key is missing." });
  }

  try {
    const { prompt } = await req.json();

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "You are Nexus AI. Be concise. User: " + prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ reply: `GOOGLE ERROR: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "No response generated." });

  } catch (error: any) {
    return NextResponse.json({ reply: `CRITICAL FAIL: ${error.message}` });
  }
}
