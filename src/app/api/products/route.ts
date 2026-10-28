import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase.from("products").select("*");
  return NextResponse.json({ data });
}
