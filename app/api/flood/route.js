// app/api/flood/route.js
import { pool } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM flood_records ORDER BY year ASC, month ASC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching flood analytics data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
