"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function LaporanPage() {
  const [omzet, setOmzet] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);
  const [lastReset, setLastReset] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadData = async () => {
    // 1. Cek kapan terakhir kali reset
    const { data: sessions } = await supabase
      .from("cash_sessions")
      .select("closed_at")
      .order("closed_at", { ascending: false })
      .limit(1);

    const startOfDay = new Date().toLocaleDateString('en-CA') + "T00:00:00";
    const startTime = sessions && sessions.length > 0 ? sessions[0].closed_at : startOfDay;
    setLastReset(sessions && sessions.length > 0 ? sessions[0].closed_at : null);

    // 2. Ambil Omzet
    const { data: sales } = await supabase
      .from("sales")
      .select("total")
      .gte("created_at", startTime);
    const totalOmzet = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
    setOmzet(totalOmzet);

    // 3. Ambil Pengeluaran
    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount")
      .gte("created_at", startTime);
    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    setPengeluaran(totalExpenses);
  };

  useEffect(() => { loadData(); }, []);

  const handleReset = async () => {
    setShowConfirm(false);
    try {
      const { error } = await supabase.from("cash_sessions").insert({});
      if (error) throw error;
      toast.success("Laporan berhasil di-reset!", { description: "Data lama tetap aman di menu Riwayat." });
      loadData(); // Muat ulang data (akan menjadi 0)
    } catch (err: any) {
      toast.error("Gagal reset laporan", { description: err.message });
    }
  };

  const labaBersih = omzet - pengeluaran;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-900">Laporan Keuangan</h1>
          {lastReset && (
            <p className="text-sm text-gray-500 mt-1">
              Periode dihitung sejak: <strong>{new Date(lastReset).toLocaleString('id-ID')}</strong>
            </p>
          )}
        </div>
        <button onClick={() => setShowConfirm(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium w-full sm:w-auto">
          Reset Laporan
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 font-medium mb-1">Total Omzet</p>
          <p className="text-2xl font-bold text-green-700">{rupiah(omzet)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500 font-medium mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600">{rupiah(pengeluaran)}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
          <p className="text-green-800 font-medium mb-1">Laba Bersih</p>
          <p className="text-2xl font-bold text-green-800">{rupiah(labaBersih)}</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 italic">
        *Laba Bersih = Total Omzet dikurangi Total Pengeluaran yang dicatat. Klik "Reset Laporan" untuk memulai periode baru.
      </p>

      {/* MODAL KONFIRMASI RESET */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Reset Laporan</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin me-reset laporan keuangan? <br/><br/>
              <span className="text-sm text-green-700 bg-green-50 p-2 block rounded">
                Tenang, data transaksi dan pengeluaran lama <strong>tidak akan terhapus</strong>. Data tersebut tetap tersimpan aman di menu <strong>Riwayat Transaksi</strong>.
              </span>
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Batal</button>
              <button onClick={handleReset} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium">Ya, Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}