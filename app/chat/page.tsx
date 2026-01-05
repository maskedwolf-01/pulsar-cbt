"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import {
  Send, Bot, Plus, MessageSquare, Menu, Loader2, Sparkles, Trash2, Edit2, ArrowLeft, User, X, AlertTriangle
} from 'lucide-react';

// --- SLOWER TYPEWRITER (Readable Speed) ---
const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i === text.length) clearInterval(intervalId);
    }, 25); // Increased to 25ms (Slower, smoother)
    return () => clearInterval(intervalId);
  }, [text]);
  return <p>{displayedText}</p>;
};

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // DELETE MODAL STATE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { if(sessionId) fetchMessages(sessionId); }, [sessionId]);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
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
    setMessages(data ? data.map(d => ({ role: d.role === 'model' ? 'ai' : 'user', text: d.message, isHistory: true })) : []);
  };

  const renameSession = async (id: string) => {
    if (!editTitle.trim()) return;
    await supabase.from('chat_sessions').update({ title: editTitle }).eq('id', id);
    setSessions(sessions.map(s => s.id === id ? { ...s, title: editTitle } : s));
    setEditingId(null);
  };

  // TRIGGER THE CUSTOM MODAL (No more system alert)
  const confirmDelete = (id: string, e: any) => {
    e.stopPropagation();
    setChatToDelete(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!chatToDelete) return;
    await supabase.from('chat_sessions').delete().eq('id', chatToDelete);
    setSessions(sessions.filter(s => s.id !== chatToDelete));
    if (sessionId === chatToDelete) { setSessionId(null); setMessages([]); }
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    let currentId = sessionId;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!currentId) {
      const { data } = await supabase.from('chat_sessions').insert({ user_id: user!.id, title: input.slice(0, 20) }).select().single();
      if(data) { setSessions([data, ...sessions]); setSessionId(data.id); currentId = data.id; }
    }

    const text = input; 
    setInput(''); 
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text, isHistory: true }]);
    await supabase.from('chat_history').insert({ user_id: user!.id, session_id: currentId, role: 'user', message: text });

    try {
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ prompt: text }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply, isHistory: false }]);
      await supabase.from('chat_history').insert({ user_id: user!.id, session_id: currentId, role: 'model', message: data.reply });
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection Error.", isHistory: true }]);
    } finally {
      setLoading(false);
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[#050508] text-white font-sans overflow-hidden relative">
      
      {/* --- CUSTOM DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl scale-100">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6 text-red-500"/>
              </div>
              <h3 className="text-lg font-bold text-white">Delete Chat?</h3>
              <p className="text-sm text-subtext mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/5 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5"/></Link>
            <button onClick={createSession} className="flex-1 flex items-center gap-2 bg-purple-600 hover:bg-purple-500 p-2 rounded-xl text-sm font-bold justify-center transition-colors"><Plus className="w-4 h-4" /> New Chat</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
            <div className="text-[10px] text-subtext uppercase font-bold tracking-widest pl-2 mb-3">History</div>
            {sessions.map(s => (
              <div key={s.id} onClick={() => { setSessionId(s.id); setSidebarOpen(false); }} className={`group w-full text-left p-3 rounded-xl flex justify-between items-center cursor-pointer transition-all ${sessionId === s.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                {editingId === s.id ? (
                  <input autoFocus className="bg-black border border-white/20 rounded px-2 py-1 w-full text-xs text-white" value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => renameSession(s.id)} onKeyDown={e => e.key === 'Enter' && renameSession(s.id)} />
                ) : ( <div className="flex items-center gap-3 truncate w-full"><MessageSquare className="w-4 h-4 flex-shrink-0"/><span className="text-sm truncate max-w-[140px]">{s.title}</span></div> )}
                
                {/* ACTIONS */}
                <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-[#0a0a0f] pl-1">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); }} className="p-1.5 hover:text-white"><Edit2 className="w-3 h-3"/></button>
                  <button onClick={(e) => confirmDelete(s.id, e)} className="p-1.5 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
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
          <div className="flex items-center gap-4"><button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6"/></button><span className="font-bold text-purple-400">Nexus 1.0</span></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4"><Sparkles className="w-8 h-8 text-purple-500"/></div>
              <h1 className="text-2xl font-bold text-white">Hello, Scholar</h1>
              <p className="text-subtext mt-2">Ready to assist.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 mb-6 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 p-[1px] mt-1"><div className="w-full h-full bg-black rounded-full flex items-center justify-center"><Bot className="w-4 h-4 text-white"/></div></div>}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'ai' ? 'bg-[#1a1a1a] text-gray-200 rounded-tl-none border border-white/5 max-w-[85%]' : 'bg-purple-600 text-white rounded-tr-none max-w-[80%]'}`}>
                  {msg.role === 'ai' && !msg.isHistory ? <Typewriter text={msg.text} /> : msg.text}
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mt-1"><User className="w-4 h-4 text-white"/></div>}
              </div>
            ))
          )}
          {loading && <div className="flex gap-4 mb-6 max-w-3xl mx-auto"><div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Bot className="w-4 h-4 text-purple-500"/></div><Loader2 className="w-4 h-4 animate-spin text-subtext"/></div>}
          <div ref={scrollRef}></div>
          <div className="h-24"></div>
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex-none pb-8 md:pb-4">
          <div className="max-w-3xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Nexus anything..." className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && handleSend()}/>
            <button onClick={handleSend} disabled={!input.trim() || loading} className={`p-3 rounded-xl transition-all ${input.trim() ? 'bg-white text-black' : 'bg-white/5 text-gray-600'}`}><Send className="w-5 h-5"/></button>
          </div>
        </div>
      </div>
    </div>
  );
  }
    
