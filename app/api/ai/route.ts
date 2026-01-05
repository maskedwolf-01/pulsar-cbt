import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// SWITCHED TO LITE: This consumes less quota, so it hits limits less often.
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    let finalPrompt = "";

    // --- LOGIC FOR EXAM EXPLANATION ---
    if (type === 'explain' && context) {
        finalPrompt = `You are a helpful tutor.
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Wrong)
        Correct Answer: "${context.correctAnswer}"
        Briefly explain why the student is wrong and the correct answer is right. Max 2 sentences.`;
    } else {
        // --- LOGIC FOR CHAT ---
        finalPrompt = "You are Nexus. Be helpful and concise. User: " + prompt;
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
        // Retry logic for free tier: If Lite fails, return a polite wait message
        if (data.error.message.includes('Quota') || data.error.code === 429) {
             return NextResponse.json({ reply: "⏳ Nexus is busy. Please try again in 30 seconds." });
        }
        return NextResponse.json({ reply: `Error: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "No response." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Connection Error." });
  }
  }
