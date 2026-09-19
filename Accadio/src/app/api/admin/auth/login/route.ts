// import { getAdmin, verifyPassword, createSession } from "@/lib/auth";
// import { cookies } from "next/headers";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { username, password } = body;

//     if (!username || !password) {
//       return Response.json({ error: "Username and password are required" }, { status: 400 });
//     }

//     const admin = getAdmin();

//     if (admin.username !== username) {
//       return Response.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const valid = await verifyPassword(password, admin.passwordHash);
//     if (!valid) {
//       return Response.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const session = createSession(admin.id);

//     const cookieStore = await cookies();
//     cookieStore.set("admin_session", session.token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: 30 * 60, // 30 minutes
//     });

//     return Response.json({
//       success: true,
//       mustChangePassword: admin.mustChangePassword,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return Response.json({ error: "Internal server error" }, { status: 500 });
//   }
// }



// -----------------------------NEWCODE-----------------------------


import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    const cookieStore = await cookies();

    cookieStore.set("admin_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return Response.json({
      success: true,
      mustChangePassword: data.user?.mustChangePassword ?? false,
    });
  } catch (error) {
    console.error("Login proxy error:", error);

    return Response.json(
      { error: "Unable to connect to backend" },
      { status: 500 }
    );
  }
}