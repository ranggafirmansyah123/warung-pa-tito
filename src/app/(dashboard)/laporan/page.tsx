"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";

export default function LaporanPage() {
  const [omzet, setOmzet] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);

  useEffect(() => {
    // Ambil total omzet dari sales
    supabase.from("sales").select("total").then(({data}) => {
      const totalOmzet = data?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
      setOmzet(totalOmzet);
    });
    // Ambil total pengeluaran dari expenses
    supabase.from("expenses").select("amount").then(({data}) => {
      const totalExpenses = data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      setPengeluaran(totalExpenses);
    });
  }, []);

  const labaBersih = omzet - pengeluaran;

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-900 mb-6">Laporan Keuangan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        *Laba Bersih = Total Omzet dikurangi Total Pengeluaran yang dicatat.
      </p>
    </div>
  );
}