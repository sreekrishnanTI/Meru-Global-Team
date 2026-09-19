// import { destroySession } from "@/lib/auth";
// import { cookies } from "next/headers";

// export async function POST() {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("admin_session")?.value;

//     if (token) {
//       destroySession(token);
//     }

//     cookieStore.delete("admin_session");

//     return Response.json({ success: true });
//   } catch (error) {
//     console.error("Logout error:", error);
//     return Response.json({ error: "Internal server error" }, { status: 500 });
//   }
// }


// -----------------------------NEWCODE-----------------------------



import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (token) {
      await fetch(`${BACKEND_URL}/admin/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    cookieStore.delete("admin_token");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);

    cookieStore.delete("admin_token");

    return Response.json({ success: true });
  }
}