import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    await pool.query("DELETE FROM mob_app_users WHERE user_id = ?", [id]);

    // Notify the socket server
    try {
      await fetch("http://localhost:4000/emit-user-deleted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
    } catch (e) {
      console.warn(
        "Socket server not reachable, skipping real-time notification."
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user." },
      { status: 500 }
    );
  }
}
