"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GoogleAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      toast.error("Google login failed");
      router.replace("/login");
      return;
    }

    localStorage.setItem("accessToken", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    localStorage.setItem("userId", payload.id);
    
    toast.success("Logged in with Google");
    router.replace("/chats/home");
  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-zinc-600">Signing you in with Google…</p>
    </div>
  );
}
