"use client";
import { useState, useEffect } from "react";
import { Package } from "lucide-react";

export function ScreenLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-xl bg-brand-600 flex items-center justify-center animate-pulse">
            <Package className="h-7 w-7 text-white" />
          </div>
          <div className="absolute inset-0 h-14 w-14 rounded-xl border-2 border-brand-300 animate-ping" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold text-gray-900">SurtiBolivia Inventario</span>
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
