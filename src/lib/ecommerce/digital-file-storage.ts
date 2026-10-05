interface DigitalFileObject {
  body: ReadableStream<Uint8Array>;
  httpMetadata?: { contentType?: string };
}

interface DigitalFileBucket {
  put(
    key: string,
    value: Uint8Array,
    options: { httpMetadata: { contentType: string } }
  ): Promise<unknown>;
  get(key: string): Promise<DigitalFileObject | null>;
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
