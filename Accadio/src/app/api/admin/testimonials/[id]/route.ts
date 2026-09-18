import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoPath: string;
  displayOrder: number;
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
    const testimonials = readData<Testimonial[]>("testimonials.json", []);
    const item = testimonials.find((t) => t.id === id);

    if (!item) {
      return Response.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return Response.json(item);
  } catch (error) {
    console.error("Testimonial GET error:", error);
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
    const testimonials = readData<Testimonial[]>("testimonials.json", []);
    const index = testimonials.findIndex((t) => t.id === id);

    if (index === -1) {
      return Response.json({ error: "Testimonial not found" }, { status: 404 });
    }

    testimonials[index] = { ...testimonials[index], ...body, id };
    writeData("testimonials.json", testimonials);

    return Response.json(testimonials[index]);
  } catch (error) {
    console.error("Testimonial PUT error:", error);
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
    const testimonials = readData<Testimonial[]>("testimonials.json", []);
    const filtered = testimonials.filter((t) => t.id !== id);

    if (filtered.length === testimonials.length) {
      return Response.json({ error: "Testimonial not found" }, { status: 404 });
    }

    writeData("testimonials.json", filtered);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Testimonial DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
