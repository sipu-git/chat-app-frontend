"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";

interface RegisterFormProps {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<RegisterFormProps>({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formInfos = new FormData()
    formInfos.append("username", formData.username)
    formInfos.append("email", formData.email)
    formInfos.append("phone", formData.phone)
    formInfos.append("password", formData.password)

    if (file) {
      formInfos.append("profilePic", file)
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    
    setLoading(true);
    try {
      const response = await api.post(
        "http://localhost:4000/api/users/register",
        formInfos, {
        headers: { "Content-Type": "mutipart/form-data" }
      });

      if (response.status === 201) {
        toast.success(response.data.message || "Registration successful! Redirecting to login...");
        setFormData({
          username: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          router.replace("/login");
        }, 3000);
      }
    } catch (error: any) {
      return toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = ()=>{
      setFormData({
        username:"",
        email:"",
        phone:"",
        password:"",
      })
    }
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.956 9.956 0 012.042-3.368M6.223 6.223A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.978 9.978 0 01-4.132 5.411M15 12a3 3 0 00-4.243-2.829M3 3l18 18" />
    </svg>
  );

  return (
    <div className="relative bg-[url('/chat-bg.png')] w-full h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-xl p-6 space-y-6 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md border">
            <UserIcon />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Create an account
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Enter your details to get started
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* column-1 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Full Name
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full h-9 px-3 py-5 rounded-md border bg-white dark:bg-zinc-950 text-sm focus-visible:ring-1"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full h-9 px-3 py-5 rounded-md border bg-white dark:bg-zinc-950 text-sm focus-visible:ring-1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8901"
                  className="w-full h-9 px-3 py-5 rounded-md border bg-white dark:bg-zinc-950 text-sm focus-visible:ring-1"
                />
              </div>
            </div>

            {/* column-2 */}
            <div className="">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full h-9 px-3 py-5 rounded-md border bg-white  dark:bg-zinc-950 text-sm focus-visible:ring-1"
                />
              </div>
              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-9 px-3 py-5 pr-10 rounded-md border bg-white dark:bg-zinc-950 text-sm focus-visible:ring-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-9 px-3 py-5 pr-10 rounded-md border bg-white dark:bg-zinc-950 text-sm focus-visible:ring-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Submit */}
         <div className="w-full flex justify-center gap-4">
           <button
            type="submit"
            className="w-[200px] h-9 rounded-md bg-[#039158] text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-900"
          >
            Create Account
          </button>
          <button type="button" onClick={handleClear} className="w-[200px] h-9 rounded-md bg-orange-500 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 text-sm font-medium hover:bg-neutral-200">
            Clear
          </button>
         </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
