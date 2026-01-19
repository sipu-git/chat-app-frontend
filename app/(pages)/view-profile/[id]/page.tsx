"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";
import { getUserById } from "@/service/user.service";
import Image from "next/image";
import api from "@/lib/axios";
import { Pencil } from "lucide-react";

const isPublicUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (!id) {
      setPageLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        console.error("Profile fetch failed", err);
        router.replace("/404");
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, [id, loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.profilePic) {
      setProfileImage(null);
      return;
    }

    if (isPublicUrl(user.profilePic)) {
      setProfileImage(user.profilePic);
      return;
    }

    const fetchSignedUrl = async () => {
      try {
        const res = await api.get("/users/view-image", {
          params: { key: user.profilePic },
          withCredentials: true,
        });

        setProfileImage(res.data.url);
      } catch (err) {
        console.error("Failed to load profile image", err);
        setProfileImage(null);
      }
    };

    fetchSignedUrl();
  }, [user?.profilePic]);


  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        User not found
      </div>
    );
  }

  return (
    <section style={{
      backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
        `,
    }} className="w-full bg-black h-screen flex flex-col justify-center ">

      <div className="bg-[rgba(0,0,0,0.3)] text-white h-[60vh] flex gap-24 p-6 border border-[#9391911b] rounded-lg w-full max-w-5xl mx-auto">
        <div className="w-full flex-1">
          <div className="flex justify-center">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="profile"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#7B17DF] flex items-center justify-center text-white text-4xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>


          <h2 className="text-center text-md text-[#9b9999] mt-4">
            {user.username}
          </h2>
        </div>
        <div className="w-full flex flex-col gap-10">
          <div className="">
            <div className="w-full bg-[rgba(47,47,47,0.2)] p-2 border border-[#9391911b] h-auto rounded-md flex justify-between text-zinc-400">
              <h2>{user.email}</h2>
              <button className="p-1.5 cursor-pointer rounded-full bg-[rgba(47,47,47,0.2)]"><Pencil  className="text-[#a5a5a5] w-4 h-4" /></button>
            </div>
            <p className="mt-2 text-[rgba(228,222,222,0.6)]">Enables users to securely update their registered email from the profile settings.</p>
          </div>
          <div className="">
            <div className="w-full bg-[rgba(47,47,47,0.2)] flex justify-between p-2 border border-[#9391911b] h-auto rounded-md text-zinc-400">
              <h2>{user.phone}</h2>
              <button className="p-1.5 cursor-pointer rounded-full bg-[rgba(47,47,47,0.2)]"><Pencil  className="text-[#a5a5a5] w-4 h-4" /></button>
            </div>
            <p className="mt-2 text-[rgba(228,222,222,0.6)]">Enables users to securely update their registered phone number from the profile settings.</p>
          </div>
          <div className="">
            <div className="w-full bg-[rgba(47,47,47,0.2)] flex justify-between p-2 border border-[#9391911b] h-auto rounded-md text-zinc-400">
              <h2>{user.description || ""}</h2>
              <button className="p-1.5 cursor-pointer rounded-full bg-[rgba(47,47,47,0.2)]"><Pencil  className="text-[#a5a5a5] w-4 h-4" /></button>
            </div>
            <p className="mt-2 text-[rgba(228,222,222,0.6)]">Enables users to securely update their description from the profile settings.</p>
          </div>
          <p className="mt-2">
            Status:{" "}
            <span className={user.isOnline ? "text-green-500" : "text-red-500"}>
              {user.isOnline ? "Online" : "Offline"}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
