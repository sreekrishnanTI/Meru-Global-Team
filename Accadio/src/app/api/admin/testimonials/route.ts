import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoPath: string;
  displayOrder: number;
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

    const testimonials = readData<Testimonial[]>("testimonials.json", []);
    return Response.json(testimonials.sort((a, b) => a.displayOrder - b.displayOrder));
  } catch (error) {
    console.error("Testimonials GET error:", error);
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
    const { name, role, quote, photoPath } = body;

    if (!name || !quote) {
      return Response.json({ error: "Name and quote are required" }, { status: 400 });
    }

    const testimonials = readData<Testimonial[]>("testimonials.json", []);
    const newTestimonial: Testimonial = {
      id: uuidv4(),
      name,
      role: role || "",
      quote,
      photoPath: photoPath || "",
      displayOrder: testimonials.length,
      createdAt: new Date().toISOString(),
    };

    testimonials.push(newTestimonial);
    writeData("testimonials.json", testimonials);

    return Response.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error("Testimonials POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
