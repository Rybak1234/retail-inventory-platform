"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogIn, Shield, LogOut } from "lucide-react";

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex gap-2 items-center">
        <Link href="/login" className="flex items-center gap-1 bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700 text-sm transition">
          <LogIn className="w-4 h-4" />
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const role = (session.user as { role?: string })?.role;

  return (
    <div className="flex gap-3 items-center">
      <span className="text-sm text-gray-600">
        {session.user?.name}
        <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 capitalize">{role}</span>
      </span>
      {role === "admin" && (
        <Link href="/admin" className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 transition">
          <Shield className="w-3.5 h-3.5" /> Admin
        </Link>
      )}
      <button
        onClick={() => signOut()}
        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition"
      >
        <LogOut className="w-3.5 h-3.5" /> Salir
      </button>
    </div>
  );
}
