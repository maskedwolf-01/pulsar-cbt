"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

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
      <div className="h-screen bg-[#09090b] flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2 w-6 h-6 text-purple-500" />
        <span className="font-bold tracking-widest">VERIFYING ACCESS...</span>
      </div>
    );
  }

  return <>{children}</>;
}
