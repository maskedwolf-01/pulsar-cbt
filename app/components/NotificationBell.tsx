"use client";
import { Bell, X, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: personal } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id);

      const { data: broadcasts } = await supabase
        .from("broadcasts")
        .select("*")
        .limit(5);

      const formatted = [
        ...(personal || []),
        ...(broadcasts || []).map(b => ({
          id: `b-${b.id}`,
          title: b.title,
          message: b.message,
          created_at: b.created_at,
          is_read: false,
          type: "broadcast",
          link: "#",
        })),
      ];

      formatted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setNotifs(formatted);
      setUnread(formatted.filter(n => !n.is_read).length);
    };

    load();
  }, []);

  const markAllRead = async () => {
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    setUnread(0);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative p-2">
        <Bell className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[200]">
          {/* same panel UI you already built */}
        </div>
      )}
    </>
  );
}
