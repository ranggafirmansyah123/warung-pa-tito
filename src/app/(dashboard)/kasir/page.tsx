"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function KasirPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // State Modal Bayar

  useEffect(() => {
    supabase.from("products").select("*").order("name").then(({data}) => setProducts(data || []));
  }, []);

  const addToCart = (p: any) => {
    const exist = cart.find((item) => item.id === p.id);
    if (exist) setCart(cart.map((item) => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    else setCart([...cart, { ...p, qty: 1 }]);
  };

  const total = cart.reduce((sum, item) => sum + (item.sale_price * item.qty), 0);

  const handleCheckout = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const saleNumber = 'INV-' + Date.now();
      const { data: sale, error: saleErr } = await supabase.from('sales').insert({ sale_number: saleNumber, total: total }).select().single();
      if (saleErr) throw saleErr;

      for (const item of cart) {
        await supabase.from('sale_items').insert({ sale_id: sale.id, product_id: item.id, product_name: item.name, quantity: item.qty, unit_price: item.sale_price, unit_cost: item.cost_price });
        await supabase.from('products').update({ stock: item.stock - item.qty }).eq('id', item.id);
      }
      
      // Notifikasi sukses
      toast.success("Transaksi Berhasil!", {
        description: `Total belanja: ${rupiah(total)}`,
      });
      
      setCart([]);
      window.location.reload();
    } catch (err: any) {
      toast.error("Transaksi Gagal", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-green-900 mb-6">Kasir POS</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-white p-4 rounded-xl shadow-sm border text-left hover:border-green-500 transition">
              <h3 className="font-bold text-gray-800">{p.name}</h3>
              <p className="text-green-700 font-bold mt-2">{rupiah(p.sale_price)}</p>
              <p className="text-sm text-gray-500">Stok: {p.stock}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="w-80 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
        <h2 className="text-xl font-bold mb-4">Keranjang</h2>
        {cart.length === 0 ? <p className="text-gray-500 text-sm">Belum ada item</p> : (
          <div className="space-y-2 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.qty}</span>
                <span className="font-semibold">{rupiah(item.sale_price * item.qty)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total:</span>
            <span className="text-green-700">{rupiah(total)}</span>
          </div>
          <button onClick={() => setShowConfirm(true)} disabled={loading || cart.length === 0} className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 disabled:bg-gray-400">
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>

      {/* MODAL KONFIRMASI PEMBAYARAN */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Pembayaran</h3>
            <p className="text-gray-600 mb-4">Apakah Anda yakin ingin memproses transaksi ini?</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between font-bold text-lg text-gray-800">
                <span>Total Tagihan:</span>
                <span className="text-green-700">{rupiah(total)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Batal</button>
              <button onClick={handleCheckout} className="px-4 py-2 text-white bg-green-700 hover:bg-green-800 rounded-lg font-medium">Ya, Bayar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}