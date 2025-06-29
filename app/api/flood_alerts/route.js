// app/api/flood_alerts/route.js
import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");

    let query = "SELECT * FROM flood_alerts ORDER BY created_at DESC";
    let values = [];

    if (since) {
      query =
        "SELECT * FROM flood_alerts WHERE created_at > ? ORDER BY created_at DESC";
      values = [since];
    }

    const [rows] = await pool.query(query, values);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching flood alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch flood alerts" },
      { status: 500 }
    );
  }
}
