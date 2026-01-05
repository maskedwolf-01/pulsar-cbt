"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Send, Bot, User, Paperclip, Plus, MessageSquare, Menu, Loader2, Sparkles, Trash2 
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]); // Real sessions only
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // LOAD HISTORY
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch actual chat history from DB
    const { data } = await supabase.from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (data && data.length > 0) {
        setMessages(data.map(d => ({
            role: d.role === 'model' ? 'ai' : 'user',
            text: d.message
        })));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input; setInput(''); setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // UI Update
        setMessages(prev => [...prev, { role: 'user', text }]);
        // DB Save
        await supabase.from('chat_history').insert({ user_id: user.id, role: 'user', message: text });
    }

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      if (user) await supabase.from('chat_history').insert({ user_id: user.id, role: 'model', message: data.reply });

    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection Failed." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
      if(!confirm("Clear all chat history?")) return;
      const { data: { user } } = await supabase.auth.getUser();
      if(user) {
          await supabase.from('chat_history').delete().eq('user_id', user.id);
          setMessages([]);
      }
  }

  return (
    <div className="flex h-screen bg-[#050508] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0f] border-r border-white/5 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-4 flex flex-col h-full">
            <button onClick={() => setMessages([])} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-full text-sm font-bold border border-white/5 mb-6">
                <Plus className="w-4 h-4 text-purple-400" /> New Chat
            </button>
            
            <div className="flex-1 overflow-y-auto">
               {/* ONLY SHOW REAL SESSIONS HERE (Currently simplified to one stream) */}
               <div className="text-xs text-subtext uppercase font-bold tracking-widest pl-2 mb-2">History</div>
               <button onClick={clearHistory} className="w-full text-left p-2 rounded-lg hover:bg-red-500/10 text-sm text-red-400 flex gap-2 items-center">
                   <Trash2 className="w-4 h-4"/> Clear All History
               </button>
            </div>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden"></div>}

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col relative h-full">
        <header className="md:hidden flex items-center p-4 bg-[#0a0a0f] border-b border-white/5 z-30">
            <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6"/></button>
            <span className="ml-4 font-bold text-purple-400">Nexus 1.0</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
            {messages.length === 0 ? (
                // DEFAULT WELCOME SCREEN
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4"><Sparkles className="w-8 h-8 text-purple-500"/></div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Hello, Majeed</h1>
                    <p className="text-subtext mt-2">How can I help you excel today?</p>
                </div>
            ) : (
                messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 mb-6 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1"><Bot className="w-4 h-4 text-purple-400"/></div>}
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${msg.role === 'ai' ? 'bg-[#1a1a1a] text-gray-200 rounded-tl-none border border-white/5' : 'bg-purple-600 text-white rounded-tr-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))
            )}
            {loading && <div className="flex gap-4 mb-6 max-w-3xl mx-auto"><div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Bot className="w-4 h-4 text-purple-400"/></div><Loader2 className="w-4 h-4 animate-spin text-subtext"/></div>}
            <div ref={scrollRef}></div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black to-transparent z-20 pb-20 md:pb-8">
            <div className="max-w-3xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
                <button className="p-3 text-gray-400 hover:text-white rounded-xl"><Paperclip className="w-5 h-5" /></button>
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Nexus..." className="flex-1 bg-transparent border-none text-white px-2 focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && handleSend()}/>
                <button onClick={handleSend} disabled={!input.trim()} className={`p-3 rounded-xl ${input.trim() ? 'bg-white text-black' : 'bg-white/5 text-gray-600'}`}><Send className="w-5 h-5" /></button>
            </div>
        </div>
        
        <div className="md:hidden"><BottomNav active="chat" /></div>
      </div>
    </div>
  );
}
