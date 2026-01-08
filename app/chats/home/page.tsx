"use client";

import { useEffect, useState } from "react";
import ChatScreen from "@/components/chat-screen/page";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { User } from "@/types/chat";
import ChatSidebar from "@/components/Sidebar/page";

export default function ChatPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) return null;

  return (
    <main className="h-screen w-full overflow-hidden">
      <div className="flex h-full">

        {/* SIDEBAR */}
        <div
          className={`
            w-full lg:w-80 border-r
            ${selectedUser ? "hidden lg:block" : "block"}
          `}
        >
          <ChatSidebar
            activeUserId={selectedUser?.id || null}
            onUserSelect={setSelectedUser}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* CHAT SCREEN */}
        <div
          className={`
            flex-1 h-full
            ${!selectedUser ? "hidden lg:block" : "block"}
          `}
        >
          <ChatScreen
            user={selectedUser}
            onBack={() => setSelectedUser(null)}
          />
        </div>

      </div>
    </main>
  );
}
