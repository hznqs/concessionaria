import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "image/avif": [0x00, 0x00, 0x00, 0x20],
};

function matchesMagicBytes(buf: Buffer, expected: number[]): boolean {
  if (buf.length < expected.length) return false;
  return expected.every((byte, i) => buf[i] === byte);
}

function detectMimeType(buf: Buffer): string | null {
  for (const [mime, bytes] of Object.entries(MAGIC_BYTES)) {
    if (matchesMagicBytes(buf, bytes)) return mime;
  }
  return null;
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return map[mime] ?? "webp";
}

interface UploadResult {
  url: string;
  filename: string;
}

function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string,
  retries = 3,
): Promise<string> {
  const client = getR2Client();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: filename,
          Body: buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      const publicUrl = process.env.R2_PUBLIC_URL;
      if (publicUrl) {
        return `${publicUrl.replace(/\/$/, "")}/${filename}`;
      }

      return `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${filename}`;
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = 200 * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error("R2 upload failed after retries");
}

export async function processAndUpload(
  file: File,
): Promise<UploadResult> {
  if (file.size > MAX_SIZE) {
    throw new Error("Arquivo muito grande. Máximo 10MB.");
  }

  const rawBytes = Buffer.from(await file.arrayBuffer());

  const detectedMime = detectMimeType(rawBytes);
  if (!detectedMime || !ALLOWED_FORMATS.includes(detectedMime as typeof ALLOWED_FORMATS[number])) {
    throw new Error("Formato inválido. Use JPG, PNG, WebP ou AVIF.");
  }

  const processed = await sharp(rawBytes)
    .resize(1600, 900, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  const ext = mimeToExt("image/webp");
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 10);
  const filename = `${timestamp}-${randomPart}.${ext}`;

  if (isR2Configured()) {
    const url = await uploadToR2(processed, filename, "image/webp");
    return { url, filename };
  }

  if (process.env.VERCEL) {
    throw new Error("Upload para disco não suportado em produção. Configure R2.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, processed);

  return { url: `/uploads/${filename}`, filename };
}

export async function deleteFromR2(filename: string): Promise<boolean> {
  if (!isR2Configured()) return false;

  try {
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: filename,
      }),
    );
    return true;
  } catch (err) {
    console.error("[R2] delete failed", filename, err);
    return false;
  }
}
