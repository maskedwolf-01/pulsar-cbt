"use client";
import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Send, Bot, Sparkles, User, RefreshCcw, StopCircle } from 'lucide-react'; // Changed Icon to Bot

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Systems online. I am Nexus 1.0. Ready to analyze your academic data." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', prompt: userMsg.text })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Neural link severed. Please check your internet or API Key." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-text font-sans flex flex-col relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      <Header title="Nexus 1.0" />
      
      {/* CHAT CONTAINER (Full Height, No Cutoff) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32 z-10 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            
            {/* AI ICON */}
            {msg.role === 'ai' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px] shadow-[0_0_20px_rgba(160,108,213,0.2)] flex-shrink-0 mt-1">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            {/* MESSAGE BUBBLE */}
            <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-xl backdrop-blur-md max-w-[85%] md:max-w-[70%] ${
              msg.role === 'ai' 
              ? 'bg-[#1a1a1a]/80 border border-white/10 text-gray-200 rounded-tl-none' 
              : 'bg-primary text-white rounded-tr-none'
            }`}>
               {msg.role === 'ai' && (
                 <div className="flex items-center gap-2 mb-2 opacity-50">
                   <Sparkles className="w-3 h-3"/>
                   <span className="text-[10px] font-bold tracking-widest uppercase">Nexus AI</span>
                 </div>
               )}
               {msg.text}
            </div>

            {/* USER ICON */}
            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex gap-4 max-w-3xl mx-auto animate-pulse">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="w-5 h-5 text-primary"/></div>
            <div className="p-5 rounded-3xl rounded-tl-none bg-[#1a1a1a]/50 border border-white/5 flex items-center gap-3">
              <RefreshCcw className="w-4 h-4 text-subtext animate-spin"/>
              <span className="text-xs text-subtext font-mono">Generating response...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* FLOATING INPUT BAR (Gemini Style) */}
      <div className="fixed bottom-20 left-0 w-full px-4 z-40">
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="relative bg-[#0a0a0f] border border-white/10 rounded-2xl flex items-center shadow-2xl overflow-hidden">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..." 
              className="flex-1 bg-transparent border-none text-white px-6 py-4 focus:outline-none placeholder:text-subtext/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              autoFocus
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="mr-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-subtext mt-2 opacity-50">Nexus 1.0 may display inaccurate info. Always verify important data.</p>
        </div>
      </div>

      <BottomNav active="chat" />
    </div>
  );
            }
      
