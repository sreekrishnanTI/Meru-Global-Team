// import { getAdmin, verifyPassword, hashPassword, updateAdmin, getSessionFromCookie } from "@/lib/auth";
// import { headers } from "next/headers";

// export async function POST(request: Request) {
//   try {
//     const headersList = await headers();
//     const cookieHeader = headersList.get("cookie");
//     const session = getSessionFromCookie(cookieHeader);

//     if (!session) {
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const { currentPassword, newPassword } = body;

//     if (!currentPassword || !newPassword) {
//       return Response.json({ error: "Both current and new password are required" }, { status: 400 });
//     }

//     if (newPassword.length < 8) {
//       return Response.json({ error: "New password must be at least 8 characters" }, { status: 400 });
//     }

//     const admin = getAdmin();
//     const valid = await verifyPassword(currentPassword, admin.passwordHash);
//     if (!valid) {
//       return Response.json({ error: "Current password is incorrect" }, { status: 401 });
//     }

//     const newHash = await hashPassword(newPassword);
//     updateAdmin({
//       passwordHash: newHash,
//       mustChangePassword: false,
//     });

//     return Response.json({ success: true });
//   } catch (error) {
//     console.error("Change password error:", error);
//     return Response.json({ error: "Internal server error" }, { status: 500 });
//   }
// }


// -----------------------------NEWCODE-----------------------------


import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: "Both current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return Response.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/admin/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, {
        status: response.status,
      });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Change password error:", error);

    return Response.json(
      { error: "Unable to connect to backend" },
      { status: 500 }
    );
  }
}