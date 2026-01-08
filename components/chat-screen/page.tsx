"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { User, Message } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import { ArrowLeft, Plus, Send } from "lucide-react";
import { io, Socket } from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ChatScreenProps {
  user: User | null;
  onBack: () => void;
}
let socket: Socket;

const isPublicUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const formatLastSeen = (date?: string) => {
  if (!date) return "";

  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export default function ChatScreen({ user, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getSignedImageUrl = async (key: string) => {
    const res = await api.get("/users/view-image", {
      params: { key },
    });
    return res.data.url as string;
  };
  const myId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  useEffect(() => {
    socket = io("http://localhost:4000", {
      auth: {
        token: localStorage.getItem("accessToken")
      }
    })
    socket.on("messagesSeen", ({ receiverId }: { receiverId: string }) => {
      setMessages((prev) => prev.map((msg) => msg.receiverId === receiverId ? { ...msg, status: "seen", isRead: true } : msg))
    })
    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("messageSeen", {
      senderId: user.id,
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user || !myId) return;

    const fetchChats = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chats/get-chats/${user.id}`);

        const normalized: Message[] = res.data.chats.map((chat: any) => ({
          id: chat._id,
          senderId: chat.sender.id,
          receiverId: chat.receiver.id,
          content: chat.message ?? null,
          mediaKey: chat.mediaKey ?? null,
          mediaType: chat.mediaType ?? null,
          createdAt: chat.createdAt,
          status: chat.status
        }));
        console.log("API RESPONSE:", res.data);
        setMessages(normalized);
      } catch (error) {
        console.error("Fetch chats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user?.id, myId]);


  useEffect(() => {
    if (!user?.profilePic) {
      setAvatarUrl("")
      return;
    }
    if (isPublicUrl(user.profilePic)) {
      setAvatarUrl(user.profilePic)
    }
    else {
      getSignedImageUrl(user.profilePic)
        .then(setAvatarUrl).catch(() => setAvatarUrl(""))
    }
  }, [user?.profilePic])


  const handleSend = async () => {
  if ((!inputValue.trim() && !selectedFile) || !user || !myId) return;

  const optimisticMessage: Message = {
    id: Date.now().toString(),
    senderId: myId,
    receiverId: user.id,
    content: inputValue.trim() || null,
    mediaType: selectedFile ? "image" : null,
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, optimisticMessage]);
  setInputValue("");
  setSelectedFile(null);

  try {
    const formData = new FormData();
    if (inputValue.trim()) formData.append("message", inputValue);
    if (selectedFile) formData.append("image", selectedFile);

    await api.post(`/chats/create-chat/${user.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.error("Send message failed:", error);
  }
};



  if (!user) {
    return (
      <div className="flex-1 h-full relative flex items-center justify-center text-muted-foreground"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 300px, rgba(16,185,129,0.35), transparent)`,
        }}>
        Select a conversation to start chatting
      </div>
    );
  }


  return (
    <div className="flex bg-black flex-col flex-1 h-full"
      style={{
        backgroundImage: `
         repeating-linear-gradient(45deg, rgba(0, 255, 65, 0.08) 0, rgba(0, 255, 65, 0.08) 1px, transparent 1px, transparent 12px),
        repeating-linear-gradient(-45deg, rgba(0, 255, 65, 0.08) 0, rgba(0, 255, 65, 0.08) 1px, transparent 1px, transparent 12px),
        repeating-linear-gradient(90deg, rgba(0, 255, 65, 0.03) 0, rgba(0, 255, 65, 0.03) 1px, transparent 1px, transparent 4px)
      `,
        backgroundSize: '24px 24px, 24px 24px, 8px 8px',
      }}>

      {/* HEADER */}
      <div className="flex items-center bg-[rgb(67,55,71,0.5)] dark:bg-[#180f1a] gap-3 p-3">
        <button onClick={onBack} className="lg:hidden cursor-pointer text-lg">
          <ArrowLeft />
        </button>

        <Avatar>
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-semibold text-[#df74ff]">{user.name}</h2>
          {user.online ? (
            <span className="text-xs text-zinc-50">Online</span>
          ) : (
            <span className="text-xs text-zinc-50">
              Last seen {formatLastSeen(user.lastSeen)}
            </span>
          )}
        </div>
      </div>
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && (
          <p className="text-center text-sm text-muted-foreground">
            Loading messages...
          </p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet
          </p>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            myId={myId!}
          />
        ))}
      </div>

      <div className="p-4  flex gap-2">
        <label className="cursor-pointer p-3 rounded-full bg-white text-zinc-600 flex items-center justify-center">
          <Plus />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
        </label>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-white outline-none placeholder:text-zinc-600 text-[#2b013c] rounded-[30px] px-5 py-2"
          style={{
            backgroundImage: `
        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
          }}
        />
        <button
          type='submit'
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="p-3 rounded-full bg-[#7B17DF] text-white disabled:opacity-50"
        >
          <Send />
        </button>
      </div>
    </div>
  );
}
