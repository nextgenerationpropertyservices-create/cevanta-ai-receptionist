import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function GET() {
  return NextResponse.json({ status: "ok", databaseConfigured: isSupabaseConfigured() }, { headers: { "Cache-Control": "no-store" } });
}
