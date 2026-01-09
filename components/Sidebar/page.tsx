"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { User } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuComponent } from "../ui/drop-down-menu";
import Image from "next/image";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
import Divider from "../ui/divider";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import axios from "axios";

const getLoggedInUserId = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id as string;
  } catch {
    return null;
  }
};

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
  const [myId, setMyId] = useState<string | null>(null);
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});


  const getSignedImageUrl = async (key: string) => {
    const res = await api.get("/users/view-image", {
      params: { key },
    });
    return res.data.url as string;
  };

  useEffect(() => {
    setMyId(getLoggedInUserId());
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get("/users/get-users");

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

    if (!query.trim()) {
      setIsSearching(false);
      setSearchUsers([]);
      setSearchMessages([]);
      return;
    }

    setIsSearching(true);

    const res = await api.get("/chats/searchApi", {
      params: { q: query },
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

  return (
    <aside className="w-full lg:w-80 p-2 bg-[radial-gradient(circle,#ffffff,#8f73ab)]
    dark:bg-[radial-gradient(circle,#0f172a,#020617)]
    text-zinc-900 dark:text-zinc-100 h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/chat-app.png" alt="logo" width={44} height={44} />
          <span className="font-semibold">QuickChat</span>
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

      {/* SEARCH USERS */}
      {isSearching &&
        searchUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="w-full flex items-center gap-3 p-3"
          >
            <Avatar>
              <AvatarImage src={avatarMap[user.id] || undefined} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <p className="text-sm">{user.name}</p>
          </button>
        ))}

      {!isSearching &&
        users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user)}
            className={`
  w-full rounded-lg mt-4 flex items-center gap-3 p-3
  transition
  hover:bg-zinc-100 dark:hover:bg-zinc-800
  ${activeUserId === user.id
                ? "bg-[#faf6fc] dark:bg-zinc-800"
                : ""
              }
`}

          >
            <Avatar>
              <AvatarImage src={avatarMap[user.id] || undefined} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>

            <div className="text-left">
              <p className="text-sm font-medium">
                {user.name}
                {user.id === myId && (
                  <span className="text-xs pl-1 text-zinc-500">(You)</span>
                )}
              </p>

              {user.online ? (
                <span className="text-green-600 text-sm">Online</span>
              ) : (
                <span className="text-xs text-zinc-500">
                  Last seen {formatLastSeen(user.lastSeen)}
                </span>
              )}
            </div>
          </button>
        ))}
    </aside>
  );
}
