import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";

interface ContactData {
  phone: string;
  email: string;
  address: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  googleMapsEmbed: string;
  lastUpdated: string;
}

const defaultContact: ContactData = {
  phone: "",
  email: "",
  address: "",
  socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "" },
  googleMapsEmbed: "",
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contact = readData<ContactData>("contact.json", defaultContact);
    return Response.json(contact);
  } catch (error) {
    console.error("Contact GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const current = readData<ContactData>("contact.json", defaultContact);

    const updated: ContactData = {
      ...current,
      ...body,
      socialLinks: { ...current.socialLinks, ...(body.socialLinks || {}) },
      lastUpdated: new Date().toISOString(),
    };

    writeData("contact.json", updated);
    return Response.json(updated);
  } catch (error) {
    console.error("Contact PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
