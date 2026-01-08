"use client";

import { Message } from "@/types/chat";
import { motion } from "framer-motion";
import Image from "next/image";


export default function ChatMessage({
  message,
  myId,
}: {
  message: Message;
  myId: string;
}) {
  const isMine = message.senderId === myId;

  const renderTicks = () => {
    if (!isMine) return null;

    if (message.status === "sent") return <span>✓</span>;
    if (message.status === "delivered") return <span>✓✓</span>;
    if (message.status === "seen")
      return <span className="text-blue-400">✓✓</span>;

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-xs p-2 rounded-2xl ${isMine
          ? `
      ml-auto text-white
      bg-[linear-gradient(348deg,#c800f0,#cd0bd2,#d115b5)]
      dark:bg-[linear-gradient(348deg,#7c3aed,#6d28d9,#5b21b6)]
    `
          : `
      mr-auto
      bg-[#f2d2ff] text-[#202020]
      dark:bg-zinc-800 dark:text-zinc-100
    `
        }`}

    >
      {message.mediaType === "image" && message.mediaKey && (
        <div className="relative w-[220px] h-[220px] rounded-lg overflow-hidden">
          <Image
            src={`/users/view-image?key=${message.mediaKey}`}
            alt="chat image"
            fill
            className="object-cover"
          />
        </div>
      )}

      {message.content && (
        <p className="break-words whitespace-pre-wrap">
          {message.content}
        </p>
      )}


      <div className="flex items-center justify-end gap-1 text-xs opacity-70 mt-1">
        <span>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {renderTicks()}
      </div>
    </motion.div>
  );
}
