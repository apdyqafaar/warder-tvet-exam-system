import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { department } from "@/lib/db/schema";

export async function GET() {
  try {
    const data = await db.query.department.findMany();
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching departments" },
      { status: 500 }
    );
  }
}
