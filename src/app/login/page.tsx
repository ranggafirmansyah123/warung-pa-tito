"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login gagal: " + error.message);
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Warung Pa Tito</h1>
        <input type="email" placeholder="Email" className="w-full border p-2 mb-2 rounded" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full border p-2 mb-4 rounded" onChange={e => setPassword(e.target.value)} />
        <Button type="submit" className="w-full">Masuk</Button>
      </form>
    </div>
  );
}
