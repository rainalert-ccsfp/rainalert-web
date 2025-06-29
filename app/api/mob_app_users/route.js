import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM mob_app_users ORDER BY user_id DESC"
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {}
}

export async function POST(request) {
  try {
    const { full_name, username, email, password } = await request.json();

    const [result] = await pool.query(
      "INSERT INTO mob_app_users (full_name, username, email, password, role, status) VALUES (?, ?, ?, ?, 'user', 'active')",
      [full_name, username, email, password]
    );

    const insertId = result.insertId;
    if (!insertId) {
      throw new Error("Failed to get insertId for new user.");
    }

    const [rows] = await pool.query(
      "SELECT * FROM mob_app_users WHERE user_id = ?",
      [insertId]
    );
    const newUser = rows[0];

    // Notify the socket server, but don't fail if it's down
    try {
      await fetch("http://localhost:4000/emit-user-added", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
    } catch (e) {
      console.warn(
        "Socket server not reachable, skipping real-time user-added notification."
      );
    }

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {}
}
