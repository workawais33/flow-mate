"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, CheckCircle2, Flame, LogOut, Menu, Settings, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/tasks", label: "Tasks", icon: CheckCircle2 },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/profile", label: "Profile", icon: Settings },
];

export function AppShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  router.replace("/login");
};

  return (
    <div className="min-h-screen bg-background flow-grid">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-card/75 p-5 backdrop-blur-xl lg:block">
        <Link href="/" className="mb-10 flex items-center gap-2 font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Workflow className="h-5 w-5" />
          </span>
          FlowMate
        </Link>

        <nav className="space-y-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">{eyebrow}</span>
          </div>

          <Button asChild variant="secondary" size="sm">
            <Link href="/profile">Alex</Link>
          </Button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {children}
        </main>
      </div>
    </div>
  );
}