import Link from "next/link";
import { Workflow } from "lucide-react";

export function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Workflow className="h-5 w-5" />
      </span>
      <span>FlowMate</span>
    </Link>
  );
}
