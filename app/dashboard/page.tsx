"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  { label: "Open tasks", value: "12" },
  { label: "Habit streak", value: "21d" },
  { label: "Completion", value: "84%" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const handleCheckout = async (plan: "basic" | "monthly" | "yearly") => {
    let finalUserId = localStorage.getItem("userId");
    if (!finalUserId) finalUserId = userId;
    if (!finalUserId) {
      toast.error("Please log in again");
      router.push("/login");
      return;
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: finalUserId, plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error || "Checkout failed");
    }
  };

  useEffect(() => {
    const checkAuthAndAccess = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.user) return router.replace("/login");
        if (!data.access) return router.replace("/pricing");
        setUserId(data.user.id);
        setUserPlan(data.user.plan || data.plan || "none");
        localStorage.setItem("userId", data.user.id);
        setLoading(false);
      } catch {
        router.replace("/login");
      }
    };
    checkAuthAndAccess();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <AppShell title="Dashboard" eyebrow="Weekly overview">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="glass-panel">
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="glass-panel mt-6">
        <CardHeader>
          <CardTitle>Your Current Plan</CardTitle>
          <CardDescription>
            {userPlan === "basic" && "Basic Plan - Lifetime Access"}
            {userPlan === "monthly" && "Monthly Premium - Active"}
            {userPlan === "yearly" && "Yearly Premium - Active"}
            {userPlan === "trial" && "Trial Plan - Limited Time"}
            {(!userPlan || userPlan === "none") && "Free Trial - Upgrade to unlock features"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="glass-panel mt-6">
        <CardHeader>
          <CardTitle>Upgrade Plan</CardTitle>
          <CardDescription>Unlock premium features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => handleCheckout("basic")} className="px-4 py-2 rounded-xl bg-purple-600 text-white">Basic Plan - $10 (One Time)</button>
            <button onClick={() => handleCheckout("monthly")} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Monthly Plan - $30/month</button>
            <button onClick={() => handleCheckout("yearly")} className="px-4 py-2 rounded-xl bg-green-600 text-white">Yearly Plan - $100/year</button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel mt-6">
        <CardHeader>
          <CardTitle>Recent focus</CardTitle>
          <CardDescription>Your current frontend task queue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Prepare product roadmap", "Send invoices", "Evening reading"].map((item) => (
            <div key={item} className="rounded-xl border border-border bg-surface p-4">{item}</div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}