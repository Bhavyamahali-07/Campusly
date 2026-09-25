import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload service abstraction.
 * MVP: saves files locally to /uploads directory.
 * Swap this for Cloudinary when ready.
 */

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Save an uploaded file (from multer memory storage)
 * Returns the URL path to access the file.
 */
export const uploadFile = async (file) => {
  if (!file) return null;

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const filename = `${uniqueSuffix}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filepath, file.buffer);

  // Return full URL to the file
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${filename}`;
};

/**
 * Delete a file by its URL path
 */
export const deleteFile = async (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;

  const filename = path.basename(fileUrl);
  const filepath = path.join(UPLOAD_DIR, filename);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};
