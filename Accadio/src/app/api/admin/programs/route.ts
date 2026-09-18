import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

interface Program {
  id: string;
  name: string;
  description: string;
  date: string;
  featuredImagePath: string;
  createdAt: string;
}

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const programs = readData<Program[]>("programs.json", []);
    return Response.json(programs);
  } catch (error) {
    console.error("Programs GET error:", error);
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
    const { name, description, date, featuredImagePath } = body;

    if (!name) {
      return Response.json({ error: "Program name is required" }, { status: 400 });
    }

    const programs = readData<Program[]>("programs.json", []);
    const newProgram: Program = {
      id: uuidv4(),
      name,
      description: description || "",
      date: date || "",
      featuredImagePath: featuredImagePath || "",
      createdAt: new Date().toISOString(),
    };

    programs.push(newProgram);
    writeData("programs.json", programs);

    return Response.json(newProgram, { status: 201 });
  } catch (error) {
    console.error("Programs POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
