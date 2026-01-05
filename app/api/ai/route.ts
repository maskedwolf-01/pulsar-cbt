import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  // DEBUG: Get the first 10 characters of the key
  const keyStart = GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) : "NONE";
  
  // YOUR NEW KEY STARTS WITH: AlzaSyC...
  // YOUR OLD KEY STARTS WITH: AlzaSyA...
  
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

    if (data.error) {
        // RETURN THE KEY START IN THE ERROR MESSAGE SO WE CAN SEE IT
        return NextResponse.json({ reply: `GOOGLE ERROR: ${data.error.message} (Using Key: ${keyStart}...)` });
    }

    return NextResponse.json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response." });
  } catch (error: any) {
    return NextResponse.json({ reply: `SERVER ERROR: ${error.message}` });
  }
                                                           }
