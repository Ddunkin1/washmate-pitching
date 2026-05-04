import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";
import { ShirtIcon, LayoutDashboardIcon, ClipboardListIcon, UsersIcon, FlagIcon } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/orders", label: "All Orders", icon: ClipboardListIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/flags", label: "Reports", icon: FlagIcon },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
          <div className="flex items-center gap-2 mr-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <ShirtIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">WashMate</span>
            <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Admin</span>
          </div>
          <nav className="flex items-center gap-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto text-xs text-gray-400">{user.email}</div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
