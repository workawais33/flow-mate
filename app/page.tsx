import Link from "next/link";
import { ArrowRight, CheckCircle2, Flame, Mail, Sparkles, Target, Workflow } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: CheckCircle2, title: "Task clarity", text: "Prioritize work with simple status, priority, and daily focus views." },
  { icon: Flame, title: "Habit streaks", text: "Build routines with check-ins, streaks, and lightweight progress cues." },
  { icon: Target, title: "Personal dashboard", text: "See tasks, habits, completion rate, and upcoming work at a glance." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flow-grid">
      <TopNav />
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-20 sm:px-6 lg:grid-cols-[1fr_.82fr] lg:px-8 lg:pt-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted-foreground"><Sparkles className="h-4 w-4 text-primary" />Personal productivity, beautifully focused</div>
            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">Tasks and habits in one calm workspace.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">FlowMate gives makers, founders, and students a minimal command center for planning tasks, tracking routines, and keeping momentum visible.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild variant="hero" size="lg"><Link href="/register">Start free <ArrowRight className="h-4 w-4" /></Link></Button><Button asChild variant="outline" size="lg"><Link href="/dashboard">View dashboard</Link></Button></div>
          </div>
          <Card className="glass-panel overflow-hidden">
            <CardHeader><CardTitle>Today</CardTitle><CardDescription>Friday focus plan</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {["Prepare product roadmap", "Morning planning", "Organize notes database"].map((item, index) => <div key={item} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">{index + 1}</span><span>{item}</span></div><CheckCircle2 className="h-5 w-5 text-muted-foreground" /></div>)}
            </CardContent>
          </Card>
        </section>
        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="grid gap-4 md:grid-cols-3">{features.map((feature) => <Card key={feature.title} className="glass-panel"><CardHeader><feature.icon className="mb-4 h-8 w-8 text-primary" /><CardTitle>{feature.title}</CardTitle><CardDescription>{feature.text}</CardDescription></CardHeader></Card>)}</div></section>
        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><Card className="glass-panel"><CardContent className="grid gap-8 p-8 md:grid-cols-[1fr_auto]"><div><h2 className="text-3xl font-semibold">Simple pricing for focused people.</h2><p className="mt-3 text-muted-foreground">Start with every frontend feature in this demo workspace.</p></div><div className="min-w-64 rounded-2xl border border-border bg-surface p-6"><p className="text-sm text-muted-foreground">Starter</p><p className="mt-2 text-4xl font-semibold">$10</p><Button asChild className="mt-6 w-full"><Link href="/register">Get started</Link></Button></div></CardContent></Card></section>
      </main>
      <footer className="border-t border-border bg-card/60"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8"><div className="md:col-span-2"><div className="flex items-center gap-2 font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Workflow className="h-5 w-5" /></span>FlowMate</div><p className="mt-4 max-w-md text-sm text-muted-foreground">A clean SaaS frontend for task planning, habit building, and personal focus systems.</p></div><div><h3 className="font-medium">Product</h3><div className="mt-4 grid gap-2 text-sm text-muted-foreground"><a href="#features">Features</a><a href="#pricing">Pricing</a><Link href="/dashboard">Dashboard</Link></div></div><div><h3 className="font-medium">Join updates</h3><div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground"><Mail className="h-4 w-4 text-primary" />hello@flowmate.app</div></div></div></footer>
    </div>
  );
}
