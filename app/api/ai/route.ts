import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  // 1. DEBUG: Check if Key exists
  if (!GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing on server.");
    return NextResponse.json({ reply: "SYSTEM ERROR: API Key is missing in Vercel Settings." });
  }

  try {
    const { prompt } = await req.json();

    // 2. Call Google
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "You are Nexus AI. Be concise. User: " + prompt }] }]
      })
    });

    const data = await response.json();

    // 3. DEBUG: Check Google Error
    if (data.error) {
      console.error("❌ GOOGLE ERROR:", data.error);
      return NextResponse.json({ reply: `GOOGLE ERROR: ${data.error.message}` });
    }

    // 4. Success
    return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });

  } catch (error: any) {
    return NextResponse.json({ reply: `CRITICAL FAIL: ${error.message}` });
  }
                    }
  
