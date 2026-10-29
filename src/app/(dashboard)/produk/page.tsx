"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function ProdukPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", cost_price: 0, sale_price: 0, stock: 0 });

  const loadData = () => {
    supabase.from("products").select("*").order("name").then(({data}) => setProducts(data || []));
  };

  useEffect(() => { loadData(); }, []);

  const handlePreSave = (e: any) => {
    e.preventDefault();
    setShowConfirm(true); 
  };

  const handleSave = async () => {
    setShowConfirm(false);
    try {
      const { error } = await supabase.from('products').insert({ ...form, min_stock: 5 });
      if (error) throw error;
      toast.success("Produk berhasil ditambahkan!", { description: `${form.name} telah masuk.` });
      setShowForm(false);
      setForm({ sku: "", name: "", cost_price: 0, sale_price: 0, stock: 0 });
      loadData();
    } catch (err: any) {
      toast.error("Gagal menambahkan produk", { description: err.message });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-green-900">Manajemen Produk</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 w-full sm:w-auto">+ Tambah Produk</button>
      </div>

      {showForm && (
        <form onSubmit={handlePreSave} className="bg-white p-4 rounded-xl shadow-sm border mb-6 space-y-3">
          <input type="text" placeholder="SKU (Cth: SKU-004)" required className="w-full border p-2 rounded" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
          <input type="text" placeholder="Nama Produk" required className="w-full border p-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="number" placeholder="Harga Modal (Rp)" required className="w-full border p-2 rounded" value={form.cost_price || ''} onChange={e => setForm({...form, cost_price: Number(e.target.value)})} />
            <input type="number" placeholder="Harga Jual (Rp)" required className="w-full border p-2 rounded" value={form.sale_price || ''} onChange={e => setForm({...form, sale_price: Number(e.target.value)})} />
          </div>
          <input type="number" placeholder="Stok Awal" required className="w-full border p-2 rounded" value={form.stock || ''} onChange={e => setForm({...form, stock: Number(e.target.value)})} />
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg w-full">Simpan Produk</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4">Nama</th><th className="p-4">Harga Jual</th><th className="p-4">Stok</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-green-700 font-bold">{rupiah(p.sale_price)}</td>
                <td className="p-4">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Tambah Produk</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menambahkan produk <strong>{form.name}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 text-white bg-green-700 hover:bg-green-800 rounded-lg">Ya, Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}