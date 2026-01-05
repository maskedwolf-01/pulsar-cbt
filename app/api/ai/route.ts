import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// REVERTED TO THE WORKING MODEL (Gemini 2.0 Flash)
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    let finalPrompt = "";
    
    // --- EXAM TUTOR MODE ---
    if (type === 'explain' && context) {
        finalPrompt = `You are a helpful tutor.
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Incorrect)
        Correct Answer: "${context.correctAnswer}"
        Explain the error briefly.`;
    } 
    // --- CHAT MODE ---
    else {
        finalPrompt = `You are Nexus. Be helpful, human, and concise. 
        Use Markdown (bold, lists, tables). 
        If asked for a table, use strictly | Header | format.
        User: ${prompt}`;
    }

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      })
    });

    const data = await response.json();

    // --- QUOTA HANDLING ---
    if (data.error) {
        // If we hit the rate limit, send 429 status.
        // The frontend will catch this and auto-retry silently.
        if (data.error.message.includes('Quota') || data.error.code === 429) {
             return NextResponse.json({ error: "QUOTA_HIT" }, { status: 429 });
        }
        return NextResponse.json({ reply: `System Error: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "No response." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Connection failed." });
  }
}
