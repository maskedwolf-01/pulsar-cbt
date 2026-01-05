import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    let finalPrompt = "";
    
    if (type === 'explain' && context) {
        finalPrompt = `You are an academic tutor.
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Wrong)
        Correct Answer: "${context.correctAnswer}"
        Explain the error and the correct answer clearly.`;
    } else {
        // UPDATED PERSONALITY: Friendly, Academic, Human-like
        finalPrompt = "You are Nexus, an intelligent academic assistant. Be helpful, clear, and encouraging. Use Markdown for bolding and lists. User: " + prompt;
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
        if (data.error.message.includes('Quota') || data.error.code === 429) {
             return NextResponse.json({ reply: "⚠️ Nexus is thinking... (High Traffic). Please try again in 10 seconds." });
        }
        return NextResponse.json({ reply: `System Error: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "No response." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Network connection unstable." });
  }
  }
