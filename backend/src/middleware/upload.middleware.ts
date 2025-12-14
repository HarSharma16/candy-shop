import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

// Determine uploads directory (configurable)
const configuredDir = process.env.UPLOAD_DIR;
const defaultDir = path.join(__dirname, "../../uploads");
let uploadsDir = configuredDir || defaultDir;

// Try to create uploads directory; if it fails (e.g. read-only FS in serverless),
// fall back to OS temp directory so multer still works.
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn(`Could not create uploads dir at ${uploadsDir}, falling back to OS temp dir. Error:`, err);
  uploadsDir = path.join(os.tmpdir(), "candy-shop-uploads");
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (err2) {
    console.warn(`Failed to create fallback uploads dir at ${uploadsDir}. Uploads may fail. Error:`, err2);
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `sweet-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

