import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// SWITCHING TO 'gemini-flash-latest'
// This is the "Universal Adapter" found in your model list.
// It automatically picks the most available Flash model for your account.
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    let finalPrompt = "";
    
    // Exam Tutor Logic
    if (type === 'explain' && context) {
        finalPrompt = `You are a tutor. 
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Incorrect)
        Correct Answer: "${context.correctAnswer}"
        Briefly explain the error.`;
    } 
    // Chat Logic
    else {
        finalPrompt = `You are Nexus. Be helpful, human, and concise. 
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
        // If Quota hit, send 429 status for Auto-Retry
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
          
