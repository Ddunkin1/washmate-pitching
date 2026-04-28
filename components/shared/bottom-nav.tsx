"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  BriefcaseIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const customerNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/orders", label: "My Orders", icon: ClipboardListIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

const runnerNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/orders", label: "Active Jobs", icon: ClipboardListIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function BottomNav({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const nav = userRole === "RUNNER" ? runnerNav : customerNav;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-stretch">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors",
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active ? "scale-110" : ""
                )}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={cn("text-[10px]", active ? "font-semibold" : "")}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}