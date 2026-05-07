import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "react-hot-toast";



export const metadata: Metadata = {
  title: "FlowMate — Tasks and habits in one calm workspace",
  description: "A modern productivity SaaS frontend for managing tasks, habits, streaks, and daily focus.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body>
    {children}
    <Toaster position="top-center" />
  </body></html>;
}


 