"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Lock } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no user, kick them to login
        router.replace("/login");
      } else {
        // If user exists, let them in
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center text-white selection:bg-indigo-500/30 overflow-hidden">
        <div className="relative flex flex-col items-center animate-fade-in-up">
          
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px]"></div>

          {/* Glass Loader Box */}
          <div className="w-16 h-16 bg-[#0a0a0c] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative z-10">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
          </div>

          <h2 className="text-xl font-bold font-serif tracking-tight mb-2 relative z-10 text-white">
            Authenticating Session
          </h2>
          
          <div className="text-[10px] font-mono text-zinc-500 tracking-widest relative z-10 flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            <Lock className="w-3 h-3 text-indigo-400"/> SECURE CONNECTION
          </div>
          
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
