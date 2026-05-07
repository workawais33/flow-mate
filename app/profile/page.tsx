"use client";

import { useEffect, useState } from "react";
import { Mail, User } from "lucide-react";

import RouteGuard from "@/components/route-guard";
import { AppShell } from "@/components/layout/app-shell";
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

type UserType = {
  name: string;
  email: string;
  plan?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser({
          name: data.user.name,
          email: data.user.email,
          plan: data.user.plan || data.plan,
        });
      }
    } catch (err) {
      console.log("Profile load failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <RouteGuard>
        <AppShell title="Profile" eyebrow="Account settings">
          <div className="flex justify-center items-center h-64">
            Loading profile...
          </div>
        </AppShell>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard>
      <AppShell title="Profile" eyebrow="Account settings">
        <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">

          <Card className="glass-panel">
            <CardHeader className="items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <User className="h-9 w-9" />
              </div>

              <CardTitle>{user?.name || "No name"}</CardTitle>
              <CardDescription>{user?.email || "No email"}</CardDescription>
              {user?.plan && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Plan: {user.plan}
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Email verified
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Account preferences</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={user?.name || ""} readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} readOnly />
                </div>
              </div>

              <Button className="w-full" disabled>
                Save changes
              </Button>
            </CardContent>
          </Card>

        </div>
      </AppShell>
    </RouteGuard>
  );
}