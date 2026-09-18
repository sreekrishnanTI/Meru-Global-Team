import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root uploads directory: Accadio/backend/uploads
export const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

// Ensure upload folders exist
const SUBDIRS = ["images", "videos", "programs", "testimonials", "general"];
SUBDIRS.forEach((sub) => {
  const dirPath = path.join(UPLOADS_DIR, sub);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = "general";
    const category = req.query.category || req.body.category;

    if (category && SUBDIRS.includes(String(category))) {
      subfolder = String(category);
    } else if (file.mimetype.startsWith("image/")) {
      subfolder = "images";
    } else if (file.mimetype.startsWith("video/")) {
      subfolder = "videos";
    }

    const dest = path.join(UPLOADS_DIR, subfolder);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const uniqueName = `${Date.now()}-${uuidv4().slice(0, 8)}-${cleanName}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: Images (PNG, JPG, WebP, SVG) and Videos (MP4, WebM)`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});
