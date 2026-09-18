import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData, ensureUploadsDir } from "@/lib/db";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  type: "image" | "video";
  size: number;
  path: string;
  uploadedAt: string;
}

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = readData<MediaItem[]>("media.json", []);
    return Response.json(media);
  } catch (error) {
    console.error("Media GET error:", error);
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

    ensureUploadsDir();

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    const media = readData<MediaItem[]>("media.json", []);
    const uploaded: MediaItem[] = [];

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      const isVideo = [".mp4", ".webm", ".mov"].includes(ext);
      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);

      if (!isVideo && !isImage) {
        continue; // Skip unsupported file types
      }

      const type = isVideo ? "video" : "image";
      const subDir = isVideo ? "videos" : "images";
      const id = uuidv4();
      const filename = `${id}${ext}`;
      const uploadPath = path.join(process.cwd(), "public", "uploads", subDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());

      // For images, try to optimize with sharp
      if (isImage && ext !== ".svg" && ext !== ".gif") {
        try {
          const sharp = (await import("sharp")).default;
          await sharp(buffer)
            .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(uploadPath.replace(ext, ".webp"));

          const optimizedFilename = filename.replace(ext, ".webp");
          const mediaItem: MediaItem = {
            id,
            filename: optimizedFilename,
            originalName: file.name,
            type: "image",
            size: fs.statSync(uploadPath.replace(ext, ".webp")).size,
            path: `/uploads/${subDir}/${optimizedFilename}`,
            uploadedAt: new Date().toISOString(),
          };
          uploaded.push(mediaItem);
          media.push(mediaItem);
        } catch {
          // Fallback: save original
          fs.writeFileSync(uploadPath, buffer);
          const mediaItem: MediaItem = {
            id,
            filename,
            originalName: file.name,
            type: "image",
            size: buffer.length,
            path: `/uploads/${subDir}/${filename}`,
            uploadedAt: new Date().toISOString(),
          };
          uploaded.push(mediaItem);
          media.push(mediaItem);
        }
      } else {
        // Videos, SVGs, GIFs: save as-is
        fs.writeFileSync(uploadPath, buffer);
        const mediaItem: MediaItem = {
          id,
          filename,
          originalName: file.name,
          type,
          size: buffer.length,
          path: `/uploads/${subDir}/${filename}`,
          uploadedAt: new Date().toISOString(),
        };
        uploaded.push(mediaItem);
        media.push(mediaItem);
      }
    }

    writeData("media.json", media);

    return Response.json({ uploaded, total: uploaded.length }, { status: 201 });
  } catch (error) {
    console.error("Media POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
