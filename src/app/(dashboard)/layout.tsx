"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menu = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Kasir", path: "/kasir" },
  { name: "Produk", path: "/produk" },
  { name: "Pengeluaran", path: "/pengeluaran" },
  { name: "Laporan", path: "/laporan" },
  { name: "Riwayat", path: "/riwayat" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#fafaf7] text-gray-900 overflow-hidden">
      
      {/* Tombol Menu Mobile */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden fixed top-4 left-4 z-50 bg-green-900 text-white p-2 rounded-lg shadow-md"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      {/* Overlay untuk Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-green-900 text-white p-4 flex flex-col transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0
      `}>
        <h2 className="text-xl font-bold mb-6 mt-10 md:mt-0">Warung Pa Tito</h2>
        <nav className="space-y-2 flex-1">
          {menu.map((m) => (
            <Link
              key={m.path}
              href={m.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded-lg transition ${
                pathname === m.path ? "bg-green-700 font-semibold" : "hover:bg-green-800"
              }`}
            >
              {m.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="mt-12 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}