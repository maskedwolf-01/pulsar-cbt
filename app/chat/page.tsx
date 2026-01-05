"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Send, Bot, User, Paperclip, Image as ImageIcon, Plus, 
  MessageSquare, Menu, X, Loader2, Sparkles, Trash2 
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ChatPage() {
  // State
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. INITIALIZE & FETCH HISTORY
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get unique sessions (Simulated by distinct select or just loading all for now)
    // For simplicity in this SQL setup, we fetch recent chats and group locally if needed
    // Ideally, you'd have a separate 'conversations' table. 
    // Here we will just load the last 50 messages for the "Current" view 
    // and pretend previous ones are history for the UI demo.
    
    // FETCH REAL HISTORY
    const { data } = await supabase.from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
        
    if (data) {
        setMessages(data.map(d => ({
            role: d.role === 'model' ? 'ai' : 'user',
            text: d.message,
            image: d.image_url
        })));
    }
  };

  const handleNewChat = () => {
    setMessages([]); // Clear view
    setCurrentSession(Date.now().toString()); // New Session ID
    setSidebarOpen(false); // Close mobile sidebar
  };

  const handleFileUpload = async (e: any) => {
    try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;

        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const { error } = await supabase.storage.from('chat_uploads').upload(fileName, file);
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('chat_uploads').getPublicUrl(fileName);
        
        // Send Image to Chat immediately
        handleSend(publicUrl);
        
    } catch (err: any) {
        alert("Upload failed: " + err.message);
    } finally {
        setUploading(false);
    }
  };

  const handleSend = async (imageUrl: string | null = null) => {
    if ((!input.trim() && !imageUrl) || loading) return;

    const textToSend = input;
    setInput('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. UI UPDATE
    const userMsg = { role: 'user', text: textToSend, image: imageUrl };
    setMessages(prev => [...prev, userMsg]);

    // 2. DB SAVE (USER)
    await supabase.from('chat_history').insert({
        user_id: user.id,
        role: 'user',
        message: textToSend || (imageUrl ? "Sent an image" : ""),
        image_url: imageUrl
    });

    try {
      // 3. AI REQUEST
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, image_url: imageUrl })
      });

      const data = await res.json();
      
      // 4. UI UPDATE (AI)
      const aiMsg = { role: 'ai', text: data.reply };
      setMessages(prev => [...prev, aiMsg]);

      // 5. DB SAVE (AI)
      await supabase.from('chat_history').insert({
        user_id: user.id,
        role: 'model',
        message: data.reply
      });

    } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', text: "Connection Error." }]);
    } finally {
        setLoading(false);
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex h-screen bg-[#050508] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR (Gemini Style) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0f] border-r border-white/5 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-4 flex flex-col h-full">
            <button onClick={handleNewChat} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-full text-sm font-bold transition-colors border border-white/5">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>New Chat</span>
            </button>

            <div className="mt-8 flex-1 overflow-y-auto custom-scrollbar">
                <h3 className="text-xs font-bold text-subtext uppercase tracking-widest mb-4 pl-2">Recent</h3>
                <div className="space-y-1">
                    {/* Simulated History Items */}
                    <button className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 truncate flex gap-2">
                        <MessageSquare className="w-4 h-4"/> Academic Planning
                    </button>
                    <button className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 truncate flex gap-2">
                        <MessageSquare className="w-4 h-4"/> CSC 101 Help
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 p-2 text-xs text-subtext hover:text-white">
                    <User className="w-4 h-4" /> My Profile
                </button>
            </div>
        </div>
      </div>

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden"></div>}

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative h-full">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden flex items-center p-4 bg-[#0a0a0f] border-b border-white/5 z-30">
            <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6 text-white"/></button>
            <span className="ml-4 font-bold text-purple-400">Nexus 1.0</span>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4"><Sparkles className="w-8 h-8 text-purple-500"/></div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Hello, Majeed</h1>
                    <p className="text-subtext mt-2">How can I help you excel today?</p>
                </div>
            ) : (
                messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 mb-6 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1 border border-purple-500/50"><Bot className="w-4 h-4 text-purple-400"/></div>}
                        
                        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                            {msg.image && (
                                <img src={msg.image} alt="Upload" className="max-w-[200px] rounded-xl mb-2 border border-white/10" />
                            )}
                            {msg.text && (
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'ai' 
                                    ? 'bg-[#1a1a1a] text-gray-200 rounded-tl-none border border-white/5' 
                                    : 'bg-purple-600 text-white rounded-tr-none'
                                }`}>
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
            
            {loading && (
                <div className="flex gap-4 mb-6 max-w-3xl mx-auto">
                     <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Bot className="w-4 h-4 text-purple-400"/></div>
                     <div className="flex items-center gap-2 text-subtext text-xs"><Loader2 className="w-3 h-3 animate-spin"/> Nexus is thinking...</div>
                </div>
            )}
            <div ref={scrollRef}></div>
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black to-transparent z-20 pb-20 md:pb-8">
            <div className="max-w-3xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 flex items-end shadow-2xl">
                
                {/* Upload Buttons */}
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5" />}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Nexus anything..."
                    className="flex-1 bg-transparent border-none text-white p-3 max-h-32 focus:outline-none resize-none placeholder:text-gray-600"
                    rows={1}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                />
                
                <button 
                    onClick={() => handleSend()}
                    disabled={(!input.trim()) || loading}
                    className={`p-3 rounded-xl transition-all ${input.trim() ? 'bg-white text-black' : 'bg-white/5 text-gray-600'}`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-2">Nexus can make mistakes. Always verify important info.</p>
        </div>
        
        {/* MOBILE NAV OVERRIDE (Hide default bottom nav on chat page for cleaner UI? Optional) */}
        <div className="md:hidden"><BottomNav active="chat" /></div>
      </div>
    </div>
  );
               }
      
