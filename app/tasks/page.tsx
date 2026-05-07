"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import RouteGuard from "@/components/route-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  priority?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks", {
        credentials: "include",
      });

      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.log("Error fetching tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Task creation failed");
        return;
      }

      setTitle("");
      fetchTasks();
    } catch (error) {
      console.log("FULL ERROR:", error);
      toast.error("Server error while creating task");
    }
  };

  // ✅ FIXED: Added type to id parameter
  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Delete failed");
        return;
      }

      fetchTasks();
    } catch (error) {
      console.log("Error deleting task");
      toast.error("Failed to delete task");
    }
  };

  // ✅ FIXED: Added type to id parameter
  const toggleTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Toggle failed");
        return;
      }

      fetchTasks();
    } catch (error) {
      console.log("Toggle error");
      toast.error("Failed to update task");
    }
  };

  return (
    <RouteGuard>
      <AppShell title="Tasks" eyebrow="Task manager">

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-muted-foreground">
            A focused list for what needs attention next.
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add task</DialogTitle>
                <DialogDescription>Create a new task.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Label htmlFor="task-title">Title</Label>

                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Write launch checklist"
                />

                <Button className="w-full" onClick={addTask}>
                  Save task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task._id} className="glass-panel">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">

                <button
                  onClick={() => toggleTask(task._id)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface"
                >
                  <CheckCircle2
                    className={
                      task.completed
                        ? "h-5 w-5 text-primary"
                        : "h-5 w-5 text-muted-foreground"
                    }
                  />
                </button>

                <div className="flex-1">
                  <h2
                    className={`font-medium ${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.title}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {task.completed ? "Done" : "Pending"}
                  </p>
                </div>

                <Badge>{task.priority || "Normal"}</Badge>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task._id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>

              </CardContent>
            </Card>
          ))}
        </div>

      </AppShell>
    </RouteGuard>
  );
}