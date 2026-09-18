import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
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

    const pages = readData<PageData[]>("pages.json", []);
    return Response.json(pages);
  } catch (error) {
    console.error("Pages GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, status } = body;

    if (!title || !slug) {
      return Response.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const pages = readData<PageData[]>("pages.json", []);
    const newPage: PageData = {
      id: uuidv4(),
      slug,
      title,
      content: content || "",
      status: status || "draft",
      lastUpdated: new Date().toISOString(),
    };

    pages.push(newPage);
    writeData("pages.json", pages);

    return Response.json(newPage, { status: 201 });
  } catch (error) {
    console.error("Pages POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
