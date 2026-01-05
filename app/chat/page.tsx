"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { 
  Send, Bot, Plus, MessageSquare, Menu, Loader2, Sparkles, Trash2, Edit2, ArrowLeft 
} from 'lucide-react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { if(sessionId) fetchMessages(sessionId); }, [sessionId]);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // NO PLACEHOLDERS. Only DB data.
    const { data } = await supabase.from('chat_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setSessions(data || []);
  };

  const createSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('chat_sessions').insert({ user_id: user.id, title: 'New Chat' }).select().single();
    if (data) {
        setSessions([data, ...sessions]);
        setSessionId(data.id);
        setMessages([]);
        setSidebarOpen(false);
    }
  };

  const fetchMessages = async (id: string) => {
    const { data } = await supabase.from('chat_history').select('*').eq('session_id', id).order('created_at', { ascending: true });
    setMessages(data ? data.map(d => ({ role: d.role === 'model' ? 'ai' : 'user', text: d.message })) : []);
  };

  const renameSession = async (id: string) => {
      await supabase.from('chat_sessions').update({ title: editTitle }).eq('id', id);
      setSessions(sessions.map(s => s.id === id ? { ...s, title: editTitle } : s));
      setEditingId(null);
  };

  const deleteSession = async (id: string, e: any) => {
      e.stopPropagation();
      if(!confirm("Delete this chat?")) return;
      await supabase.from('chat_sessions').delete().eq('id', id);
      setSessions(sessions.filter(s => s.id !== id));
      if (sessionId === id) { setSessionId(null); setMessages([]); }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    let currentId = sessionId;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!currentId) {
        const { data } = await supabase.from('chat_sessions').insert({ user_id: user!.id, title: input.slice(0, 20) }).select().single();
        if(data) { setSessions([data, ...sessions]); setSessionId(data.id); currentId = data.id; }
    }

    const text = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text }]);
    await supabase.from('chat_history').insert({ user_id: user!.id, session_id: currentId, role: 'user', message: text });

    try {
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ prompt: text }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      await supabase.from('chat_history').insert({ user_id: user!.id, session_id: currentId, role: 'model', message: data.reply });
    } catch (e) { setMessages(prev => [...prev, { role: 'ai', text: "Connection Error." }]); } 
    finally { setLoading(false); scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }
  };

  return (
    // FIXED HEIGHT: Use 100dvh to fit mobile screens perfectly
    <div className="flex h-[100dvh] bg-[#050508] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/5 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5"/></Link>
                <button onClick={createSession} className="flex-1 flex items-center gap-2 bg-purple-600 hover:bg-purple-500 p-2 rounded-xl text-sm font-bold justify-center transition-colors"><Plus className="w-4 h-4" /> New Chat</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
               <div className="text-xs text-subtext uppercase font-bold tracking-widest pl-2 mb-2">History</div>
               {sessions.length === 0 && <p className="text-gray-600 text-xs pl-2">No chats yet.</p>}
               {sessions.map(s => (
                   <div key={s.id} onClick={() => { setSessionId(s.id); setSidebarOpen(false); }} className={`group w-full text-left p-3 rounded-lg flex justify-between items-center cursor-pointer ${sessionId === s.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                       {editingId === s.id ? (
                           <input autoFocus className="bg-black border border-white/20 rounded px-1 w-full text-xs" value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => renameSession(s.id)} onKeyDown={e => e.key === 'Enter' && renameSession(s.id)} />
                       ) : ( <div className="flex items-center gap-3 truncate"><MessageSquare className="w-4 h-4 flex-shrink-0"/><span className="text-sm truncate max-w-[140px]">{s.title}</span></div> )}
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); }} className="p-1 hover:text-white"><Edit2 className="w-3 h-3"/></button>
                           <button onClick={(e) => deleteSession(s.id, e)} className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                       </div>
                   </div>
               ))}
            </div>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden"></div>}

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col relative h-full">
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0f] border-b border-white/5 z-30 flex-none">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6"/></button>
                <span className="font-bold text-purple-400">Nexus 1.0</span>
            </div>
            <Link href="/dashboard" className="text-xs font-bold text-subtext">Exit</Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4"><Sparkles className="w-8 h-8 text-purple-500"/></div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Hello, Scholar</h1>
                    <p className="text-subtext mt-2">Start a new session to begin.</p>
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
            
            {/* INVISIBLE SPACER TO PREVENT CONTENT HIDING BEHIND INPUT */}
            <div className="h-24"></div>
        </div>

        {/* INPUT AREA - STAYS AT BOTTOM */}
        <div className="p-4 bg-gradient-to-t from-black via-black to-transparent z-20 flex-none">
            <div className="max-w-3xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Nexus..." className="flex-1 bg-transparent border-none text-white px-4 py-2 focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && handleSend()}/>
                <button onClick={handleSend} disabled={!input.trim()} className={`p-3 rounded-xl ${input.trim() ? 'bg-white text-black' : 'bg-white/5 text-gray-600'}`}><Send className="w-5 h-5" /></button>
            </div>
        </div>
      </div>
    </div>
  );
  }
                                                                 
