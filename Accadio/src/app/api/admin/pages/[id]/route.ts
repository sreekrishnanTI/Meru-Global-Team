import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  lastUpdated: string;
}

export async function GET(
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
    const pages = readData<PageData[]>("pages.json", []);
    const page = pages.find((p) => p.id === id);

    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    return Response.json(page);
  } catch (error) {
    console.error("Page GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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
    const body = await request.json();
    const pages = readData<PageData[]>("pages.json", []);
    const index = pages.findIndex((p) => p.id === id);

    if (index === -1) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    pages[index] = {
      ...pages[index],
      ...body,
      id, // prevent ID change
      lastUpdated: new Date().toISOString(),
    };

    writeData("pages.json", pages);
    return Response.json(pages[index]);
  } catch (error) {
    console.error("Page PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
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
    const pages = readData<PageData[]>("pages.json", []);
    const filtered = pages.filter((p) => p.id !== id);

    if (filtered.length === pages.length) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    writeData("pages.json", filtered);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Page DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
