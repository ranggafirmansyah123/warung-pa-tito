"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function KasirPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase.from("products").select("*").order("name").then(({data}) => setProducts(data || []));
  }, []);

  const addToCart = (p: any) => {
    const exist = cart.find((item) => item.id === p.id);
    if (exist) setCart(cart.map((item) => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    else setCart([...cart, { ...p, qty: 1 }]);
  };

  // Fungsi untuk mengurangi jumlah (tidak bisa kurang dari 1)
  const decreaseQty = (id: string) => {
    setCart(cart.map((item) => {
      if (item.id === id && item.qty > 1) {
        return { ...item, qty: item.qty - 1 };
      }
      return item;
    }));
  };

  // Fungsi untuk menghapus barang dari keranjang sepenuhnya
  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
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
      toast.success("Transaksi Berhasil!", { description: `Total: ${rupiah(total)}` });
      setCart([]);
      window.location.reload();
    } catch (err: any) {
      toast.error("Transaksi Gagal", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-bold text-green-900 mb-6">Kasir POS</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-white p-3 md:p-4 rounded-xl shadow-sm border text-left hover:border-green-500 transition">
              <h3 className="font-bold text-sm md:text-base text-gray-800 line-clamp-2">{p.name}</h3>
              <p className="text-green-700 font-bold mt-1 md:mt-2 text-sm md:text-base">{rupiah(p.sale_price)}</p>
              <p className="text-xs text-gray-500 mt-1">Stok: {p.stock}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-80 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
        <h2 className="text-lg md:text-xl font-bold mb-4">Keranjang</h2>
        {cart.length === 0 ? <p className="text-gray-500 text-sm">Belum ada item</p> : (
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                <div className="flex-1 truncate pr-2">
                  <div className="font-medium text-gray-800 truncate">{item.name}</div>
                  <div className="text-gray-500 text-xs">{rupiah(item.sale_price)}</div>
                </div>
                
                {/* Tombol Kontrol Jumlah */}
                <div className="flex items-center gap-2">
                  <button onClick={() => decreaseQty(item.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-7 h-7 flex items-center justify-center rounded font-bold">-</button>
                  <span className="w-6 text-center font-semibold">{item.qty}</span>
                  <button onClick={() => addToCart(item)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-7 h-7 flex items-center justify-center rounded font-bold">+</button>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 ml-1 text-xs">X</button>
                </div>
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

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Pembayaran</h3>
            <p className="text-gray-600 mb-4">Apakah Anda yakin ingin memproses transaksi ini?</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between font-bold text-lg text-gray-800">
                <span>Total Tagihan:</span>
                <span className="text-green-700">{rupiah(total)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
              <button onClick={handleCheckout} className="px-4 py-2 text-white bg-green-700 hover:bg-green-800 rounded-lg">Ya, Bayar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}