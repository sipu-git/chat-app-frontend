"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginResponse, User } from "@/types/user";
import axios from "axios";
import api from "@/lib/axios";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [initialized,setInitialized] = useState(false)
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const res = await api.get("/users/viewProfile");
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true)
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post<LoginResponse>("http://ec2-13-127-211-135.ap-south-1.compute.amazonaws.com:4000/api/users/loginUser", {
        email,
        password,
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("userId", res.data.user.id);
      setUser(res.data.user);
      setLoading(false)
      setInitialized(true)
      router.replace("/chats/home");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    router.replace("/");
  };

 
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
