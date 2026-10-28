"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Kasir", path: "/kasir" },
  { name: "Produk", path: "/produk" },
  { name: "Pengeluaran", path: "/pengeluaran" },
  { name: "Laporan", path: "/laporan" },
  { name: "Riwayat Transaksi", path: "/riwayat" }, // <--- Tambahkan ini
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="flex h-screen bg-[#fafaf7] text-gray-900">
      <aside className="w-64 bg-green-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Warung Pa Tito</h2>
        <nav className="space-y-2 flex-1">
          {menu.map((m) => (
            <Link
              key={m.path}
              href={m.path}
              className={`block px-4 py-2 rounded-lg transition ${
                pathname === m.path ? "bg-green-700 font-semibold" : "hover:bg-green-800"
              }`}
            >
              {m.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}