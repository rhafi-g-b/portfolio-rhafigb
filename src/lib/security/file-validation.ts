type DetectedFileType = {
  mime: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
  ext: "jpg" | "png" | "webp" | "pdf";
};

type FileValidationResult =
  | {
      ok: true;
      buffer: Uint8Array;
      mime: DetectedFileType["mime"];
      ext: DetectedFileType["ext"];
    }
  | {
      ok: false;
      error: string;
    };

function detectMagicBytes(bytes: Uint8Array): DetectedFileType | null {
  if (bytes.length < 12) {
    return null;
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }

  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return { mime: "application/pdf", ext: "pdf" };
  }

  return null;
}

export async function validateUploadedFile(
  file: File,
  options: {
    allowedMimes: DetectedFileType["mime"][];
    maxBytes: number;
  }
): Promise<FileValidationResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "File tidak boleh kosong." };
  }

  if (file.size > options.maxBytes) {
    const maxMb = Math.round((options.maxBytes / (1024 * 1024)) * 10) / 10;
    return {
      ok: false,
      error: `Ukuran file melebihi batas maksimal ${maxMb} MB.`,
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const detected = detectMagicBytes(buffer);

  if (!detected || !options.allowedMimes.includes(detected.mime)) {
    return {
      ok: false,
      error: "Format file tidak valid atau tidak diizinkan.",
    };
  }

  return {
    ok: true,
    buffer,
    mime: detected.mime,
    ext: detected.ext,
  };
}

export function extractManagedStoragePath(
  publicUrl: string,
  supabaseUrl: string,
  bucketName: string
): string | null {
  if (!publicUrl) {
    return null;
  }

  const expectedPrefix = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucketName}/`;
  if (!publicUrl.startsWith(expectedPrefix)) {
    return null;
  }

  const relativePath = publicUrl.slice(expectedPrefix.length);
  if (!relativePath || relativePath.includes("..")) {
    return null;
  }

  return relativePath;
}