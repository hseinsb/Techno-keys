"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FileText, LayoutDashboard, LogOut, Menu, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--tk-blue)]/15 text-[var(--tk-blue)]"
                : "text-zinc-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--tk-bg)] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,163,224,0.12),_transparent_55%),linear-gradient(180deg,#0b0e13_0%,#121820_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-black/30 p-5 backdrop-blur md:flex md:flex-col">
          <Link href="/" className="mb-8 block">
            <Image
              src="/logo.png"
              alt="Techno Keys"
              width={180}
              height={84}
              className="h-auto w-full"
              priority
            />
          </Link>
          <NavLinks />
          <div className="mt-auto space-y-3 pt-6">
            <Link
              href="/invoices/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-[var(--tk-blue)] text-black hover:bg-[var(--tk-blue-hover)]",
              )}
            >
              <Plus className="size-4" />
              Create Invoice
            </Link>
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400">
              <div className="truncate text-zinc-200">{userEmail}</div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-2 inline-flex items-center gap-1.5 text-[var(--tk-blue)] hover:underline"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  render={
                    <Button variant="ghost" size="icon" className="text-zinc-200" />
                  }
                >
                  <Menu className="size-5" />
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 border-white/10 bg-[#0d1117] p-5 text-zinc-100"
                >
                  <Image
                    src="/logo.png"
                    alt="Techno Keys"
                    width={160}
                    height={74}
                    className="mb-6 h-auto w-40"
                  />
                  <NavLinks onNavigate={() => setOpen(false)} />
                  <Link
                    href="/invoices/new"
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants(),
                      "mt-6 w-full bg-[var(--tk-blue)] text-black hover:bg-[var(--tk-blue-hover)]",
                    )}
                  >
                    <Plus className="size-4" />
                    Create Invoice
                  </Link>
                </SheetContent>
              </Sheet>
              <span className="text-sm font-semibold tracking-wide text-white">
                Techno Keys
              </span>
            </div>
            <Link
              href="/invoices/new"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-[var(--tk-blue)] text-black hover:bg-[var(--tk-blue-hover)]",
              )}
            >
              <Plus className="size-4" />
              New
            </Link>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
