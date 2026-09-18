import { getSessionFromCookie } from "@/lib/auth";
import { readData } from "@/lib/db";
import { headers } from "next/headers";

interface MediaItem {
  id: string;
  type: "image" | "video";
}

interface PageItem {
  id: string;
  lastUpdated: string;
}

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = readData<MediaItem[]>("media.json", []);
    const pages = readData<PageItem[]>("pages.json", []);

    const photos = media.filter((m) => m.type === "image").length;
    const videos = media.filter((m) => m.type === "video").length;
    const totalPages = pages.length;

    // Find most recent update across all data
    const allDates = pages.map((p) => p.lastUpdated).filter(Boolean);
    const lastUpdated = allDates.length
      ? allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : new Date().toISOString();

    return Response.json({
      photos,
      videos,
      totalPages,
      lastUpdated,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
