import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// SWITCHED TO 'gemini-flash-latest' (The Universal Free Model)
// This fixes the "Limit: 0" error by using the standard model your account is allowed to access.
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    // 1. BUILD THE PROMPT
    let finalPrompt = "";
    
    // Logic: Explain Failed Exams
    if (type === 'explain' && context) {
        finalPrompt = `You are a helpful tutor.
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Wrong)
        Correct Answer: "${context.correctAnswer}"
        Briefly explain why the student is wrong and the correct answer is right. Max 2 sentences.`;
    } else {
        // Logic: Standard Chat
        finalPrompt = "You are Nexus. Be helpful and concise. User: " + prompt;
    }

    // 2. CALL GOOGLE
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      })
    });

    const data = await response.json();

    // 3. HANDLE ERRORS (Gracefully)
    if (data.error) {
        // Rate Limit Handling (Standard for Free Tier)
        if (data.error.message.includes('Quota') || data.error.code === 429) {
             return NextResponse.json({ reply: "⚠️ Nexus is busy. Please wait 10 seconds." });
        }
        return NextResponse.json({ reply: `System Error: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "No response." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Connection failed." });
  }
}
