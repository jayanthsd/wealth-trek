import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { storedPath } = body;

    if (!storedPath) {
      return NextResponse.json(
        { error: "storedPath is required" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "uploads", storedPath);

    try {
      await unlink(filePath);
    } catch {
      // File may already be deleted, that's ok
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
