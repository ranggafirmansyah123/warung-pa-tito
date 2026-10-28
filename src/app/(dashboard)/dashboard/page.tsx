"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";
import SalesChart from "@/components/SalesChart";

export default function DashboardPage() {
  const [stats, setStats] = useState({ omzet: 0, laba: 0, transaksi: 0 });
  const [lastReset, setLastReset] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadData = async () => {
    const { data: sessions } = await supabase.from("cash_sessions").select("closed_at").order("closed_at", { ascending: false }).limit(1);
    const startOfDay = new Date().toLocaleDateString("en-CA") + "T00:00:00";
    const startTime = sessions && sessions.length > 0 ? sessions[0].closed_at : startOfDay;
    setLastReset(sessions && sessions.length > 0 ? sessions[0].closed_at : null);

    const { data: sales } = await supabase.from("sales").select("id, total").gte("created_at", startTime);
    const totalSales = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

    let totalModal = 0;
    if (sales && sales.length > 0) {
      const saleIds = sales.map(s => s.id);
      const { data: items } = await supabase.from("sale_items").select("quantity, unit_cost").in("sale_id", saleIds);
      if (items) totalModal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_cost)), 0);
    }

    setStats({ omzet: totalSales, laba: totalSales - totalModal, transaksi: sales?.length || 0 });
  };

  useEffect(() => { loadData(); }, []);

  const handleReset = async () => {
    setShowConfirm(false);
    try {
      const { error } = await supabase.from("cash_sessions").insert({});
      if (error) throw error;
      toast.success("Kas berhasil di-reset!", { description: "Dashboard kembali ke Rp 0." });
      loadData();
    } catch (err: any) {
      toast.error("Gagal reset kas", { description: err.message });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Dashboard</h1>
          {lastReset && (<p className="text-sm text-gray-500 mt-1">Omzet dihitung sejak: <strong>{new Date(lastReset).toLocaleString("id-ID")}</strong></p>)}
        </div>
        <button onClick={() => setShowConfirm(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium">Reset Omzet</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border"><p className="text-gray-500 font-medium">Omzet Berjalan</p><p className="text-2xl font-bold text-green-700 mt-2">{rupiah(stats.omzet)}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border"><p className="text-gray-500 font-medium">Laba Kotor</p><p className="text-2xl font-bold text-green-700 mt-2">{rupiah(stats.laba)}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border"><p className="text-gray-500 font-medium">Transaksi Berjalan</p><p className="text-2xl font-bold text-green-700 mt-2">{stats.transaksi}</p></div>
      </div>

      <SalesChart />

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Reset Kas</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin me-reset omzet?<br/><br/><span className="text-sm text-green-700 bg-green-50 p-2 block rounded">Data transaksi lama aman di menu <strong>Riwayat Transaksi</strong>.</span></p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
              <button onClick={handleReset} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg">Ya, Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}