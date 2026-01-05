"use client";
import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Send, Cpu, Loader2, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Systems online. I am Nexus 1.0. How can I assist your academic frequency today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
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
        body: JSON.stringify({ 
          type: 'chat', 
          prompt: userMsg.text 
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Neural link severed. Check connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24 flex flex-col">
      <Header title="Nexus 1.0" />
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(160,108,213,0.4)]' : 'bg-white/10 text-white'}`}>
              {msg.role === 'ai' ? <Cpu className="w-4 h-4" /> : <span className="text-xs font-bold">ME</span>}
            </div>
            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
              msg.role === 'ai' 
              ? 'bg-[#1a1a1a] border border-white/10 text-gray-300 rounded-tl-none' 
              : 'bg-primary text-white rounded-tr-none shadow-lg'
            }`}>
              {msg.role === 'ai' && <Sparkles className="w-3 h-3 text-primary mb-2 inline-block mr-2" />}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Cpu className="w-4 h-4 text-primary animate-pulse"/></div>
             <div className="p-4 bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-tl-none text-subtext text-xs flex items-center gap-2">
               Thinking <Loader2 className="w-3 h-3 animate-spin"/>
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0a0a0f]/90 backdrop-blur-md border-t border-white/10 sticky bottom-16 z-40">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Nexus anything..." 
            className="w-full bg-[#15151a] border border-white/10 rounded-xl py-4 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-subtext/50"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <BottomNav active="chat" />
    </div>
  );
            }
      
