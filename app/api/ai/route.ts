import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt } = await req.json();

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "You are Nexus. Be concise. User: " + prompt }] }]
      })
    });

    const data = await response.json();

    // 1. Handle Quota/Rate Limits Gracefully
    if (data.error) {
        if (data.error.message.includes('Quota') || data.error.code === 429) {
            return NextResponse.json({ reply: "⚠️ Nexus is cooling down. Please wait 1 minute before the next prompt." });
        }
        return NextResponse.json({ reply: `NEXUS ERROR: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "Nexus is silent." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Connection failed. Check internet." });
  }
  }
