// import { getAdmin, getSessionFromCookie } from "@/lib/auth";
// import { headers } from "next/headers";

// export async function GET() {
//   try {
//     const headersList = await headers();
//     const cookieHeader = headersList.get("cookie");
//     const session = getSessionFromCookie(cookieHeader);

//     if (!session) {
//       return Response.json({ authenticated: false }, { status: 401 });
//     }

//     const admin = getAdmin();

//     return Response.json({
//       authenticated: true,
//       username: admin.username,
//       mustChangePassword: admin.mustChangePassword,
//     });
//   } catch (error) {
//     console.error("Session check error:", error);
//     return Response.json({ authenticated: false }, { status: 401 });
//   }
// }



// -----------------------------NEWCODE-----------------------------


import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return Response.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/admin/auth/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.authenticated) {
      return Response.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return Response.json({
      authenticated: true,
      username: data.user?.username,
      mustChangePassword: data.mustChangePassword ?? false,
    });
  } catch (error) {
    console.error("Session check error:", error);

    return Response.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}