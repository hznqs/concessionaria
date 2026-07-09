---
name: file-upload-pipeline
description: Build file upload pipelines with Sharp processing, Cloudflare R2 storage, magic-byte validation, and drag-and-drop UI. Use when implementing image upload, file storage, or media management.
---

# File Upload Pipeline

Production image upload system: client-side validation → server-side magic-byte check → Sharp resize/WebP → Cloudflare R2 with retry.

## When to Use

- Image upload for admin forms
- Media management (gallery, portfolio, product photos)
- File storage with processing pipeline
- Drag-and-drop upload interfaces

## Architecture

```
Client (react-hook-form + useFieldArray)
  ↓ pre-validate: MIME type, size < 10MB
  ↓ apiFetch with CSRF header
API Route (POST /api/upload)
  ↓ requireCsrf + requireAdmin
  ↓ processAndUpload(file)
lib/upload.ts
  ↓ magic-byte validation (byte signature table)
  ↓ Sharp: resize 1600×900, WebP quality 75
  ↓ R2 upload with retry (3x, exponential backoff)
  ↓ return { url, width, height, size }
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/upload.ts` | Core: validate, process, upload, delete |
| `src/app/api/upload/route.ts` | API endpoint (POST only) |
| `src/components/admin/vehicle-form/step-2-photos.tsx` | Client upload UI |

## Core Upload Logic

```ts
// src/lib/upload.ts
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 900;
const WEBP_QUALITY = 75;

export async function processAndUpload(file: File): Promise<UploadResult> {
  // 1. Magic-byte validation
  const bytes = await file.arrayBuffer();
  const uint8 = new Uint8Array(bytes);
  validateMagicBytes(uint8, file.type);

  // 2. Sharp processing
  const processed = await sharp(Buffer.from(bytes))
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  // 3. Generate filename
  const filename = `${Date.now()}-${randomChars(8)}.webp`;

  // 4. Upload to R2 (or local disk in dev)
  if (process.env.R2_BUCKET_NAME) {
    await uploadToR2(filename, processed);
  } else {
    await writeLocal(filename, processed);
  }

  return { url: getPublicUrl(filename), width, height, size: processed.length };
}
```

## Magic-Byte Validation

Prevents extension spoofing (e.g., `.exe` renamed to `.jpg`):

```ts
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png":  [[0x89, 0x50, 0x4E, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  "image/avif": [[0x00, 0x00, 0x00]],        // ftyp box
};

function validateMagicBytes(bytes: Uint8Array, declaredType: string) {
  const signatures = MAGIC_BYTES[declaredType];
  if (!signatures) throw new Error("Unsupported type");
  const matches = signatures.some(sig => sig.every((b, i) => bytes[i] === b));
  if (!matches) throw new Error("File content doesn't match declared type");
}
```

## R2 Upload with Retry

```ts
async function uploadToR2(key: string, body: Buffer) {
  const client = new S3Client({ /* R2 config */ });
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable",
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await client.send(command);
      return;
    } catch (err) {
      if (attempt === 2) throw err;
      await sleep(200 * Math.pow(2, attempt)); // 200ms, 400ms, 800ms
    }
  }
}
```

## Client-side Upload UI

```tsx
// step-2-photos.tsx
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function validateClient(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Tipo não suportado";
  if (file.size > MAX_SIZE) return "Arquivo muito grande (máx. 10MB)";
  return null;
}

// useFieldArray for dynamic image list
const { fields, append, remove } = useFieldArray({ control, name: "images" });

// Drag-and-drop + click-to-select
// Upload on add, show progress per image
// First image auto-set as cover
```

## Deletion

```ts
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function deleteFromR2(key: string) {
  await client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}
```

## Gotchas

- **Vercel without R2**: Uploads **throw** — local disk is dev-only
- **`runtime = "nodejs"`**: Required — Sharp and S3 client need Node.js
- **Images always WebP**: Display with `<img>` not Next.js `<Image>` (external R2 URLs may not be in remote patterns)
- **CSRF header**: All state-changing requests require `x-requested-by: autoprime`
- **File object**: `processAndUpload` accepts Web API `File`, not `Buffer`
- **Cache-Control**: Set to 1 year immutable — R2 serves directly without revalidation
