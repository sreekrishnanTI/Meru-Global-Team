import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";
import path from "path";
import fs from "fs";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  type: "image" | "video";
  size: number;
  path: string;
  uploadedAt: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const media = readData<MediaItem[]>("media.json", []);
    const item = media.find((m) => m.id === id);

    if (!item) {
      return Response.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete the actual file
    const filePath = path.join(process.cwd(), "public", item.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const filtered = media.filter((m) => m.id !== id);
    writeData("media.json", filtered);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
