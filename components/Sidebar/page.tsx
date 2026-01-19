"use client";

import React, { useEffect, useState } from "react";
import { Message, User } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuComponent } from "../ui/drop-down-menu";
import Image from "next/image";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
import Divider from "../ui/divider";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { colorPallate } from "@/styles/colorPallate";

// const getLoggedInUserId = () => {
//   if (typeof window === "undefined") return null;

//   const token = localStorage.getItem("accessToken");
//   if (!token) return null;

//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     return payload.id as string;
//   } catch {
//     return null;
//   }
// };

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


interface ApiUser {
  _id: string;
  username: string;
  profilePic: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface SearchMessage {
  _id: string;
  message: string;
  senderId: ApiUser;
  receiverId: ApiUser;
}

interface Props {
  activeUserId: string | null;
  onUserSelect: (user: User) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

const isPublicUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

export default function ChatSidebar({
  activeUserId,
  onUserSelect,
  onSearchChange,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchMessages, setSearchMessages] = useState<SearchMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  const [recentChats, setRecentChats] = useState<Record<string, any>>({})
  const router = useRouter()

  const { user } = useAuth()
  const myId = user?.id ?? null;
  const getSignedImageUrl = async (key: string) => {
    const res = await axios.get("http://ec2-13-233-23-20.ap-south-1.compute.amazonaws.com:4000/api/users/view-image", {
      params: { key },
      withCredentials: true
    });
    return res.data.url as string;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("http://ec2-13-233-23-20.ap-south-1.compute.amazonaws.com:4000/api/users/get-users", {
      });

      const mapped: User[] = res.data.users.map((u: ApiUser) => ({
        id: u._id,
        name: u.username,
        profilePic: u.profilePic || "",
        online: u.isOnline,
        lastSeen: u.lastSeen,
      }));

      setUsers(mapped);

      const urlMap: Record<string, string> = {};

      await Promise.all(
        mapped.map(async (user) => {
          if (!user.profilePic) return;

          if (isPublicUrl(user.profilePic)) {
            urlMap[user.id] = user.profilePic;
          }
          else {
            const signedUrl = await getSignedImageUrl(user.profilePic);
            urlMap[user.id] = signedUrl;
          }
        })
      );

      setAvatarMap(urlMap);
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user: User) => {
    onUserSelect(user)
    setIsSearching(false);
    setSearchUsers([]);
    setSearchMessages([]);
    onSearchChange("");
  }

  const handleSearch = async (query: string) => {
    onSearchChange(query);
    const token = localStorage.getItem("accessToken");

    if (!query.trim()) {
      setIsSearching(false);
      setSearchUsers([]);
      setSearchMessages([]);
      return;
    }

    setIsSearching(true);

    const res = await axios.get("http://ec2-13-233-23-20.ap-south-1.compute.amazonaws.com:4000/api/chats/searchApi", {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const mappedUsers: User[] = res.data.users.map((u: ApiUser) => ({
      id: u._id,
      name: u.username,
      profilePic: u.profilePic || "",
      online: u.isOnline,
      lastSeen: u.lastSeen,
    }));

    setSearchUsers(mappedUsers);
    setSearchMessages(res.data.messages);

    const urlMap: Record<string, string> = {};

    await Promise.all(
      mappedUsers.map(async (user) => {
        if (!user.profilePic) return;

        if (isPublicUrl(user.profilePic)) {
          urlMap[user.id] = user.profilePic;
        } else {
          const signedUrl = await getSignedImageUrl(user.profilePic);
          urlMap[user.id] = signedUrl;
        }
      })
    );

    setAvatarMap((prev) => ({ ...prev, ...urlMap }));
  };

  // recent chat api
  useEffect(() => {
    const findRecentChats = async () => {
      const token = localStorage.getItem("accessToken")
      try {
        const response = await axios.get("http://ec2-13-233-23-20.ap-south-1.compute.amazonaws.com:4000/api/chats/getRecentChats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const map: Record<string, any> = {};
        response.data.findChats.forEach((chat: any) => {
          map[chat.userId] = chat;
        })
        setRecentChats(map)
      } catch (error: any) {
        console.error(error?.response?.data?.message || "Unable to get the chats");
      }
    }
    findRecentChats()
  }, [])

  const renderSidebarThicks = (status: Message["status"]) => {
    if (!status) return null;
    if (status === "sent") {
      return <span className="text-xs ml-1">✓</span>;
    }

    if (status === "delivered") {
      return <span className="text-xs ml-1 text-[#fffefe]">✓✓</span>;
    }

    if (status === "seen") {
      return <span className="text-xs ml-1 text-[#073dff]">✓✓</span>;
    }

    return null;
  }
  return (
    <aside className="w-full lg:w-80  bg-[hsl(156,100%,98%)] dark:bg-[#050404]
    text-zinc-900 dark:text-zinc-100 h-full">
      {/* HEADER */}
      <div className="dark:bg-transparent p-2 bg-[hsl(156,100%,98%)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/chat-logo.png" alt="logo" width={30} height={30} />
            <span className="font-bold text-[#01da58]">QuickChat</span>
          </div>
          <div className="flex items-center gap-3">
            <AnimatedThemeToggler />
            <DropdownMenuComponent side="bottom" align="end" />
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-3">
          <PlaceholdersAndVanishInput
            placeholders={["Search users or messages..."]}
            onChange={(e) => handleSearch(e.target.value)}
            onSubmit={(e) => e.preventDefault()}
          />
        </div>
              <Divider />

      </div>
      <div className="overflow-y-auto hide-scrollbar h-[calc(100vh-180px)]">
        {/* SEARCH USERS */}
        {isSearching &&
          searchUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="w-full flex items-center gap-3 p-3"
            >
              <Avatar className="cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                router.push(`/view-profile/${user.id}`)

              }}>
                <AvatarImage src={avatarMap[user.id] || undefined} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold text-[#002914] dark:text-[#e1fff4]">{user.name}</p>
            </button>
          ))}

        {!isSearching &&
          users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className={`
  w-full rounded-lg mt-4 flex items-center gap-4 p-3
  transition duration-500 ease-in-out
  hover:bg-[hsl(150,3%,87%)] dark:hover:bg-zinc-800
  ${activeUserId === user.id
                  ? "bg-[hsl(0,1%,73%)] dark:bg-zinc-800"
                  : ""
                }
`}

            >
              <Avatar className="cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                router.push(`/view-profile/${user.id}`)

              }}>
                <AvatarImage src={avatarMap[user.id] || undefined} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>

              <div className="text-left flex flex-col gap-2">
                <p className="text-sm font-medium text-[#002914] dark:text-[#e1fff4]">
                  {user.name}
                  {user.id === myId && (

                    <span className="text-xs pl-1  text-[#002914] dark:text-[#e1fff4]">(You)</span>
                  )}
                </p>

                {(() => {
                  const recentChat = recentChats[user.id];

                  if (recentChat) {
                    return (
                      <p className="text-xs text-[#02341b] dark:text-[#8c8d8d] truncate">
                        {recentChat.mediaType === "image"
                          ? "📷 Image"
                          : recentChat.lastMessage}
                        {renderSidebarThicks(recentChat.status)}
                      </p>
                    );
                  }

                  if (user.online) {
                    return <span className="text-[#01611e] dark:text-[#27fe93] text-xs">Online</span>;
                  }

                  return (
                    <span className="text-xs text-[#007332] dark:text-[#27fe93]">
                      Last seen {formatLastSeen(user.lastSeen)}
                    </span>
                  );
                })()}

              </div>
            </button>
          ))}
      </div>
    </aside>
  );
}
