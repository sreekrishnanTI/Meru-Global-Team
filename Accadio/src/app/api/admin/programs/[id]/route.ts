import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";

interface Program {
  id: string;
  name: string;
  description: string;
  date: string;
  featuredImagePath: string;
  createdAt: string;
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
    const programs = readData<Program[]>("programs.json", []);
    const item = programs.find((p) => p.id === id);

    if (!item) {
      return Response.json({ error: "Program not found" }, { status: 404 });
    }

    return Response.json(item);
  } catch (error) {
    console.error("Program GET error:", error);
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
    const programs = readData<Program[]>("programs.json", []);
    const index = programs.findIndex((p) => p.id === id);

    if (index === -1) {
      return Response.json({ error: "Program not found" }, { status: 404 });
    }

    programs[index] = { ...programs[index], ...body, id };
    writeData("programs.json", programs);

    return Response.json(programs[index]);
  } catch (error) {
    console.error("Program PUT error:", error);
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
    const programs = readData<Program[]>("programs.json", []);
    const filtered = programs.filter((p) => p.id !== id);

    if (filtered.length === programs.length) {
      return Response.json({ error: "Program not found" }, { status: 404 });
    }

    writeData("programs.json", filtered);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Program DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
