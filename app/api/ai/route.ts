import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using the Free Tier Flash model (Reliable & Fast)
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, type, context } = await req.json();

    let finalPrompt = "";
    
    // --- SCENARIO 1: EXAM EXPLANATION (Academic & Precise) ---
    if (type === 'explain' && context) {
        finalPrompt = `Act as an expert tutor analyzing a student's mistake.
        Question: "${context.question}"
        Student Answer: "${context.userAnswer}" (Incorrect)
        Correct Answer: "${context.correctAnswer}"
        
        Explain *why* the student's answer is wrong and the correct one is right. Be encouraging but clear. Keep it brief.`;
    } 
    // --- SCENARIO 2: CHAT (Conversational & Human-like) ---
    else {
        finalPrompt = `
        You are Nexus, a highly intelligent and conversational academic AI integrated into the Pulsar CBT platform. 
        
        YOUR PERSONALITY:
        - You are NOT a robot. You are a smart, encouraging study partner.
        - Your tone is warm, professional, but relaxed (like a university professor who cares).
        - Avoid starting every sentence with "As an AI..." or "Here is the answer."
        - Use varied sentence structures. Be engaging.
        - If the user is stressed, offer empathy.
        - Use Markdown (bolding, lists) to make complex topics easy to read.
        
        USER SAYS: "${prompt}"
        `;
    }

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      })
    });

    const data = await response.json();

    // ERROR HANDLING (Graceful fallbacks)
    if (data.error) {
        if (data.error.message.includes('Quota') || data.error.code === 429) {
             return NextResponse.json({ reply: "⚠️ My brain is a bit overloaded right now. Give me 10 seconds to cool down." });
        }
        return NextResponse.json({ reply: `System Hiccup: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "I'm drawing a blank. Could you rephrase that?" });

  } catch (error: any) {
    return NextResponse.json({ reply: "I'm having trouble connecting to the network." });
  }
                                                   }
      
