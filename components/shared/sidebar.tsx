"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  BriefcaseIcon,
  UserIcon,
  LogOutIcon,
  ShirtIcon,
  ShieldIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const customerNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/orders", label: "My Orders", icon: ClipboardListIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

const runnerNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/jobs", label: "Available Jobs", icon: BriefcaseIcon },
  { href: "/orders", label: "Active Jobs", icon: ClipboardListIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

const adminNav = [{ href: "/admin", label: "Admin", icon: ShieldIcon }];

interface SidebarProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export function Sidebar({ userName, userEmail, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isRunner = userRole === "RUNNER";
  const isAdmin = userRole === "ADMIN";
  const nav = isAdmin ? adminNav : isRunner ? runnerNav : customerNav;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const NavContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <ShirtIcon className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-gray-900">WashMate</span>
        {isRunner && (
          <span className="ml-auto inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Runner
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {[...nav, ...(isAdmin ? adminNav : [])].map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", active ? "text-blue-600" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-100 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {userName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{userName}</p>
            <p className="truncate text-xs text-gray-400">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOutIcon className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <ShirtIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900">WashMate</span>
        </div>
        {isRunner && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Runner
          </span>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <NavContent />
      </aside>
    </>
  );
}
