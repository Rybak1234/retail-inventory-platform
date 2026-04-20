"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Package,
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  Shield,
  Menu,
  X,
  ChevronRight,
  Home,
} from "lucide-react";
import UserMenu from "./UserMenu";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Productos", icon: Boxes },
  { href: "/movements", label: "Movimientos", icon: ArrowLeftRight },
];

const breadcrumbLabels: Record<string, string> = {
  "": "Dashboard",
  products: "Productos",
  new: "Nuevo Producto",
  movements: "Movimientos",
  admin: "Administración",
  users: "Usuarios",
  reports: "Reportes",
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (session?.user as { role?: string })?.role;

  const allLinks = [
    ...navLinks,
    ...(role === "admin" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: breadcrumbLabels[seg] || decodeURIComponent(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <>
      {/* Main navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            {/* Left: Logo + nav links */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-bold text-brand-700 shrink-0"
              >
                <Package className="w-5 h-5" />
                <span className="hidden sm:inline">SurtiBolivia</span>
                <span className="sm:hidden">SB</span>
              </Link>

              {/* Desktop nav links */}
              {session && (
                <div className="hidden md:flex items-center gap-1">
                  {allLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-brand-50 text-brand-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: user menu + mobile toggle */}
            <div className="flex items-center gap-3">
              <UserMenu />
              {session && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Menú"
                >
                  {mobileOpen ? (
                    <X className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {session && mobileOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {allLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumbs */}
      {session && crumbs.length > 0 && (
        <div className="bg-gray-50 border-b">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-1 text-sm text-gray-500 overflow-x-auto">
            <Link href="/" className="hover:text-brand-600 transition shrink-0">
              <Home className="w-3.5 h-3.5" />
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1 shrink-0">
                <ChevronRight className="w-3 h-3 text-gray-400" />
                {crumb.isLast ? (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-brand-600 transition">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
