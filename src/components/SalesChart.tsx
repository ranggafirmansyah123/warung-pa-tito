"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { rupiah } from "@/lib/format";

export default function SalesChart() {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState<"7d" | "30d" | "1y">("7d");

  useEffect(() => {
    const fetchChartData = async () => {
      const now = new Date();
      const startDate = new Date();
      if (filter === "7d") startDate.setDate(now.getDate() - 7);
      else if (filter === "30d") startDate.setDate(now.getDate() - 30);
      else if (filter === "1y") startDate.setFullYear(now.getFullYear() - 1);

      const { data: sales } = await supabase
        .from("sales")
        .select("total, created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (sales) {
        const grouped: Record<string, number> = {};
        sales.forEach((sale) => {
          const date = new Date(sale.created_at).toLocaleDateString("en-CA");
          grouped[date] = (grouped[date] || 0) + Number(sale.total);
        });
        const chartData = Object.keys(grouped).map((date) => ({ date, omzet: grouped[date] }));
        setData(chartData);
      }
    };
    fetchChartData();
  }, [filter]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Grafik Tren Omzet</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="border p-2 rounded-lg text-sm bg-gray-50">
          <option value="7d">7 Hari Terakhir</option>
          <option value="30d">30 Hari Terakhir</option>
          <option value="1y">1 Tahun Terakhir</option>
        </select>
      </div>
      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">Belum ada data penjualan pada periode ini.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(val) => `${val / 1000}rb`} />
              <Tooltip formatter={(value: any) => [rupiah(Number(value)), "Omzet"]} labelFormatter={(label) => new Date(label).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="omzet" stroke="#065f46" strokeWidth={3} dot={{ r: 4, fill: "#065f46" }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}