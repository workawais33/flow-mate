"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isLogin
      ? "/api/auth/login"
      : "/api/auth/register";

    const body = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error");
        setIsLoading(false);
        return;
      }

      console.log("🔍 Login/Register Response:", data);

      let userId = null;
      
      if (data.userId) {
        userId = data.userId;
      } else if (data.user?.id) {
        userId = data.user.id;
      } else if (data.id) {
        userId = data.id;
      }
      
      if (userId) {
        localStorage.setItem("userId", userId);
        sessionStorage.setItem("userId", userId);
        console.log(" Stored userId:", userId);
      } else {
        console.error(" No userId found in response:", data);
      }

      if (isLogin) {
        toast.success("Login successful! Redirecting...");
        router.replace("/dashboard");
      }
      else {
        toast.success("Account created! Redirecting...");
        router.replace("/pricing");
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogo />

          <CardTitle className="text-2xl">
            {isLogin ? "Welcome back" : "Create account"}
          </CardTitle>

          <CardDescription>
            {isLogin ? "Login to continue" : "Start your journey"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            {!isLogin && (
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Please wait..." : (isLogin ? "Login" : "Register")}
            </Button>

            <p className="text-sm text-center">
              <Link href={isLogin ? "/register" : "/login"}>
                {isLogin ? "Create account" : "Login"}
              </Link>
            </p>

          </CardContent>
        </form>
      </Card>
    </main>
  );
}