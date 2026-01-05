import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// SWITCHING TO EXPERIMENTAL (Always Free & High Limit)
// This model exists in your list and bypasses the "Limit: 0" billing error.
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    let finalPrompt = "";
    
    // Exam Tutor
    if (type === 'explain' && context) {
        finalPrompt = `You are a tutor. 
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Incorrect)
        Correct Answer: "${context.correctAnswer}"
        Briefly explain the error.`;
    } 
    // Chat Mode
    else {
        finalPrompt = `You are Nexus. Be helpful and human. 
        Use Markdown (bold, lists). 
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

    if (data.error) {
        // If this fails, we show the RAW error so we know exactly what's wrong.
        console.error("AI Error:", data.error);
        return NextResponse.json({ reply: `Nexus Error: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "No response." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Connection failed." });
  }
  }
