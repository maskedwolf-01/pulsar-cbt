import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// SWITCHING TO LITE: This model is in your list and has higher rate limits.
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    let finalPrompt = "";
    
    // Exam Logic
    if (type === 'explain' && context) {
        finalPrompt = `You are a tutor. 
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Incorrect)
        Correct Answer: "${context.correctAnswer}"
        Briefly explain the error.`;
    } 
    // Chat Logic
    else {
        finalPrompt = `You are Nexus. Be helpful and human. 
        Use Markdown (bold, lists). 
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

    // ERROR HANDLING
    if (data.error) {
        // If we hit a limit, send 429 so the frontend retries silently
        if (data.error.message.includes('Quota') || data.error.code === 429) {
             return NextResponse.json({ error: "QUOTA_HIT" }, { status: 429 });
        }
        // If the model is wrong/missing, tell us exactly which one
        return NextResponse.json({ reply: `Config Error: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "No response." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Connection failed." });
  }
      }
