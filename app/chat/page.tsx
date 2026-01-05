"use client";
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Send, Bot, User, Paperclip, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. LOAD HISTORY ON START
  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Fetch old messages
        const { data: history } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (history && history.length > 0) {
          setMessages(history.map(h => ({ role: h.role === 'model' ? 'ai' : 'user', text: h.message })));
        } else {
          setMessages([{ role: 'ai', text: "Systems online. I am Nexus 1.0. Ready to analyze your academic data." }]);
        }
      }
    };
    initChat();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !userId) return;

    const userText = input;
    setInput(''); // Clear input immediately
    setLoading(true);

    // 1. Show User Message Immediately
    const userMsg = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    // 2. Save User Msg to DB
    await supabase.from('chat_history').insert({ user_id: userId, role: 'user', message: userText });

    try {
      // 3. Call AI
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', prompt: userText })
      });

      const data = await res.json();
      const aiText = data.reply;

      // 4. Show & Save AI Response
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      await supabase.from('chat_history').insert({ user_id: userId, role: 'model', message: aiText });

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection interrupted." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-text font-sans flex flex-col relative">
      <Header title="Nexus 1.0" />
      
      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32 z-10 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px] mt-1 shadow-[0_0_15px_rgba(160,108,213,0.3)]">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md max-w-[85%] ${
              msg.role === 'ai' 
              ? 'bg-[#1a1a1a] border border-white/10 text-gray-200 rounded-tl-none' 
              : 'bg-primary text-white rounded-tr-none'
            }`}>
               {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-4 max-w-3xl mx-auto animate-pulse">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="w-4 h-4 text-primary"/></div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-[#1a1a1a] border border-white/10 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-subtext animate-spin"/>
              <span className="text-xs text-subtext">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT BAR (Gemini Style) */}
      <div className="fixed bottom-20 left-0 w-full px-4 z-40">
        <div className="max-w-2xl mx-auto bg-[#0a0a0f] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
          <button className="p-3 text-subtext hover:text-white transition-colors rounded-xl hover:bg-white/5">
             <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-3 text-subtext hover:text-white transition-colors rounded-xl hover:bg-white/5 mr-2">
             <ImageIcon className="w-5 h-5" />
          </button>
          
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Nexus anything..." 
            className="flex-1 bg-transparent border-none text-white px-2 focus:outline-none placeholder:text-subtext/50"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`p-3 rounded-xl transition-all ${input.trim() ? 'bg-white text-black hover:scale-105' : 'bg-white/5 text-subtext cursor-not-allowed'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNav active="chat" />
    </div>
  );
            }
                                                
