import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  BookOpen,
  Image,
  MessageSquare,
  GraduationCap,
  ExternalLink,
  Menu,
  X,
  LogOut,
  School,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "./AdminLogin";
import { useGetSchoolProfile } from "@workspace/api-client-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/berita", label: "Berita", icon: Newspaper },
  { href: "/admin/acara", label: "Acara", icon: CalendarDays },
  { href: "/admin/program", label: "Program", icon: BookOpen },
  { href: "/admin/galeri", label: "Galeri", icon: Image },
  { href: "/admin/pesan", label: "Pesan Masuk", icon: MessageSquare },
  { href: "/admin/profil", label: "Profil Sekolah", icon: School },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state, login, logout } = useAdminAuth();
  const { data: profile } = useGetSchoolProfile();

  const name = profile?.name ?? "SMA Nusantara";

  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "unauthenticated") {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-secondary text-secondary-foreground z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-secondary-foreground/10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            {profile?.logoUrl ? (
              <img src={profile.logoUrl} alt={name} className="w-5 h-5 object-contain rounded" />
            ) : (
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-secondary-foreground truncate">{name}</div>
            <div className="text-xs text-secondary-foreground/50">Panel Admin</div>
          </div>
          <button
            className="ml-auto lg:hidden text-secondary-foreground/60 hover:text-secondary-foreground shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`admin-nav-${item.href.replace("/admin", "").replace("/", "") || "dashboard"}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-primary/20 text-primary"
                  : "text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/8"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-secondary-foreground/10 space-y-0.5">
          <Link
            href="/"
            data-testid="admin-link-view-site"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/8 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Lihat Website
          </Link>
          <button
            data-testid="button-admin-logout"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-border px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            className="lg:hidden p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-admin-menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-foreground">
            {navItems.find((n) => isActive(n.href, n.exact))?.label ?? "Admin"}
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">{name} Admin Panel</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
