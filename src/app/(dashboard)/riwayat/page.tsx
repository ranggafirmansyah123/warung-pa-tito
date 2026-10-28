"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";

export default function RiwayatPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"penjualan" | "pengeluaran">("penjualan");

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil semua data penjualan
      const { data: salesData } = await supabase
        .from("sales")
        .select("id, sale_number, total, created_at")
        .order("created_at", { ascending: false });
      
      // 2. Ambil data item penjualan untuk menghitung modal (HPP)
      const { data: itemsData } = await supabase
        .from("sale_items")
        .select("sale_id, quantity, unit_cost");

      // 3. Gabungkan data penjualan dengan modalnya
      if (salesData) {
        const salesWithProfit = salesData.map((sale) => {
          // Cari semua item milik transaksi ini
          const items = itemsData?.filter((i) => i.sale_id === sale.id) || [];
          // Hitung total modal transaksi ini
          const totalModal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_cost)), 0);
          // Laba = Total Jual - Total Modal
          const laba = Number(sale.total) - totalModal;
          
          return { ...sale, laba };
        });
        setSales(salesWithProfit);
      }

      // 4. Ambil data pengeluaran
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });
      setExpenses(expensesData || []);
    };

    fetchData();
  }, []);

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-900 mb-6">Riwayat Transaksi</h1>
      
      <div className="flex gap-4 mb-6 border-b">
        <button 
          onClick={() => setActiveTab("penjualan")}
          className={`pb-2 px-4 font-semibold ${activeTab === "penjualan" ? "text-green-700 border-b-2 border-green-700" : "text-gray-500"}`}
        >
          Riwayat Penjualan
        </button>
        <button 
          onClick={() => setActiveTab("pengeluaran")}
          className={`pb-2 px-4 font-semibold ${activeTab === "pengeluaran" ? "text-green-700 border-b-2 border-green-700" : "text-gray-500"}`}
        >
          Riwayat Pengeluaran
        </button>
      </div>

      {activeTab === "penjualan" && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Tanggal & Waktu</th>
                <th className="p-4">No. Transaksi</th>
                <th className="p-4">Omzet</th>
                <th className="p-4 text-green-700">Laba Kotor</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Belum ada riwayat penjualan.</td></tr>
              ) : (
                sales.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{formatDateTime(s.created_at)}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{s.sale_number}</td>
                    <td className="p-4 font-semibold">{rupiah(s.total)}</td>
                    <td className="p-4 text-green-700 font-bold">{rupiah(s.laba)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "pengeluaran" && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Tanggal & Waktu</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">Belum ada riwayat pengeluaran.</td></tr>
              ) : (
                expenses.map(e => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{formatDateTime(e.created_at)}</td>
                    <td className="p-4 text-gray-600">{e.description}</td>
                    <td className="p-4 text-red-600 font-bold">{rupiah(e.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}