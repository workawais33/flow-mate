"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Habit {
  _id: string;
  title: string;
  streak: number;
  completedDates: string[];
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState("");

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits", {
        credentials: "include",
      });

      if (!res.ok) {
        setHabits([]);
        return;
      }

      const data = await res.json();
      setHabits(data || []);
    } catch (err) {
      console.log("fetchHabits error:", err);
      setHabits([]);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const addHabit = async () => {
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Unauthorized / Failed to add habit");
        return;
      }

      setName("");
      fetchHabits();
    } catch (err) {
      console.log("addHabit error:", err);
      toast.error("Failed to add habit");
    }
  };

  // ✅ FIXED: Added type to id parameter
  const checkHabit = async (id: string) => {
    const today = new Date().toISOString().split("T")[0];

    try {
      await fetch("/api/habits/complete", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id, date: today }),
      });

      fetchHabits();
    } catch (err) {
      console.log("checkHabit error:", err);
      toast.error("Failed to check habit");
    }
  };

  return (
    <AppShell title="Habits" eyebrow="Daily consistency">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Habit</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New habit"
          />

          <Button onClick={addHabit}>Add</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {habits.map((h) => {
          const today = new Date().toISOString().split("T")[0];
          const done = h.completedDates?.includes(today);

          return (
            <Card key={h._id}>
              <CardHeader>
                <CardTitle>{h.title}</CardTitle>
                <CardDescription>{h.streak} day streak</CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  onClick={() => checkHabit(h._id)}
                  variant={done ? "secondary" : "default"}
                >
                  {done ? "Done" : "Check"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}