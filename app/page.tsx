"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import GradientText from "@/components/GradientText";
import AnimatedButton from "@/components/FlipButtoon";
import Image from "next/image";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/chats/home");
    }
  }, [loading, isAuthenticated]);
  if (loading) return null;

  if (isAuthenticated) return null;

  return (
    <main className="w-full bg-black absolute inset-0 z-0 flex flex-col justify-center h-screen items-center"
      style={{
        backgroundImage: `
        repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px),
        repeating-linear-gradient(45deg, rgba(0,255,128,0.09) 0, rgba(0,255,128,0.09) 1px, transparent 1px, transparent 20px),
       repeating-linear-gradient(-45deg, rgba(255,0,128,0.10) 0, rgba(255,0,128,0.10) 1px, transparent 1px, transparent 30px),
        repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 80px),
        radial-gradient(circle at 60% 40%, rgba(0,255,128,0.05) 0, transparent 60%)
      `,
        backgroundSize: "80px 80px, 40px 40px, 60px 60px, 80px 80px, 100% 100%",
        backgroundPosition: "0 0, 0 0, 0 0, 40px 40px, center"
      }}>
      <div className="flex justify-center items-center flex-col gap-3.5 text-center">
        <Image src="/chat-app.png" alt="chat-logo" width={150} height={150} className="object-scale-down" />
        <GradientText colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="custom-class text-4xl"
        >
          WELCOME TO QuickChat World
        </GradientText>
        <p className="text-[#9fe7a1] text-2xl">Stay connected, Anytime</p>
      </div>

      <AnimatedButton text="Login" onClick={() => router.push('/login')} className="mt-4" />
    </main>
  );
}
