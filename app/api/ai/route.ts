import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using the Flash model which is faster and supports the free tier better
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

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
        contents: [{ parts: [{ text: "You are Nexus 1.0, an academic AI. Be helpful and concise. User: " + prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Google Error:", data.error);
      return NextResponse.json({ reply: `NEXUS ERROR: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "Nexus received no data." });

  } catch (error: any) {
    return NextResponse.json({ reply: `CONNECTION FAIL: ${error.message}` });
  }
      }
