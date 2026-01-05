import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    let finalPrompt = "";
    
    // --- EXAM MODE ---
    if (type === 'explain' && context) {
        finalPrompt = `You are a tutor. 
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Wrong)
        Correct Answer: "${context.correctAnswer}"
        Explain the error briefly.`;
    } 
    // --- CHAT MODE ---
    else {
        finalPrompt = `You are Nexus. Be helpful, human, and clear.
        - Use Markdown for bolding and lists.
        - If the user asks for a table, formatting MUST be:
        | Header 1 | Header 2 |
        | --- | --- |
        | Row 1 | Data 1 |
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

    // --- CRITICAL FIX FOR "COOL DOWN" ---
    if (data.error) {
        // If Google says "Quota Exceeded", we send status 429
        // This tells the frontend: "Don't show an error text. Just wait and try again."
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
