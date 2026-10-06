interface DigitalFileObject {
  body: ReadableStream<Uint8Array>;
  size?: number;
  httpEtag?: string;
  httpMetadata?: { contentType?: string };
}

interface DigitalFileBucket {
  put(
    key: string,
    value: Uint8Array,
    options: { httpMetadata: { contentType: string; cacheControl?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<DigitalFileObject | null>;
  delete?(key: string): Promise<void>;
}

function isDigitalFileBucket(binding: unknown): binding is DigitalFileBucket {
  if (!binding || typeof binding !== 'object') return false;
  const candidate = binding as Partial<DigitalFileBucket>;
  return typeof candidate.put === 'function' && typeof candidate.get === 'function';
}

export async function getDigitalFileBucket(): Promise<DigitalFileBucket | null> {
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const binding: unknown = context?.env?.FEELSNEAT_DIGITAL_FILES;
    return isDigitalFileBucket(binding) ? binding : null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') return null;
    throw error;
  }
}

export function getDigitalFileObjectKey(reference: string): string | null {
  const match = /^r2:\/\/digital-files\/([0-9a-f-]{36})$/i.exec(reference);
  return match ? `digital-files/${match[1]}` : null;
}

export function getProductImageObjectKey(reference: string): string | null {
  const match = /^r2:\/\/product-images\/([0-9a-f-]{36}|[0-9a-f]{64})$/i.exec(reference);
  return match ? `product-images/${match[1]}` : null;
}

export async function putR2Object(
  key: string,
  bytes: Uint8Array,
  contentType: string,
  cacheControl?: string
): Promise<void> {
  const bucket = await getDigitalFileBucket();
  if (!bucket) {
    throw new Error('R2 file storage is not configured. Bind FEELSNEAT_DIGITAL_FILES in Cloudflare.');
  }
  await bucket.put(key, bytes, {
    httpMetadata: { contentType, ...(cacheControl ? { cacheControl } : {}) },
  });
}

export async function getR2Object(key: string): Promise<DigitalFileObject | null> {
  const bucket = await getDigitalFileBucket();
  if (!bucket) {
    throw new Error('R2 file storage is not configured. Bind FEELSNEAT_DIGITAL_FILES in Cloudflare.');
  }
  return bucket.get(key);
}

export async function deleteR2Objects(keys: string[]): Promise<void> {
  const bucket = await getDigitalFileBucket();
  if (!bucket) {
    throw new Error('R2 file storage is not configured. Bind FEELSNEAT_DIGITAL_FILES in Cloudflare.');
  }
  const deleteObject = bucket.delete;
  if (!deleteObject) throw new Error('R2 object deletion is not available in this runtime.');
  await Promise.all(keys.map((key) => deleteObject(key)));
}

export function detectImageMimeType(bytes: Uint8Array): string | null {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  const isWebp = new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  if (isJpeg) return 'image/jpeg';
  if (isPng) return 'image/png';
  if (isWebp) return 'image/webp';
  return null;
}

export function imageBytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}
