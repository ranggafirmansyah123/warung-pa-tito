"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";

export default function PengeluaranPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ amount: 0, description: "" });

  const loadData = () => {
    supabase.from("expenses").select("*").order("created_at", { ascending: false }).then(({data}) => setItems(data || []));
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('expenses').insert({ amount: form.amount, description: form.description });
      if (error) throw error;
      alert('Pengeluaran dicatat!');
      setForm({ amount: 0, description: "" });
      loadData();
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-900 mb-6">Catat Pengeluaran</h1>
      
      <form onSubmit={handleSave} className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm text-gray-600">Keterangan (Listrik, Air, dll)</label>
          <input type="text" required placeholder="Cth: Bayar Listrik" className="w-full border p-2 rounded" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div className="w-48">
          <label className="text-sm text-gray-600">Nominal (Rp)</label>
          <input type="number" required placeholder="0" className="w-full border p-2 rounded" value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} />
        </div>
        <button type="submit" className="bg-green-700 text-white px-6 py-2 rounded-lg h-10.5">Simpan</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4">Keterangan</th><th className="p-4">Nominal</th></tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{item.description}</td>
                <td className="p-4 text-red-600 font-bold">{rupiah(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}