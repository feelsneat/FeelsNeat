interface CloudflareEnv {
  FEELSNEAT_CMS_KV: any;
  FEELSNEAT_DIGITAL_FILES?: {
    put(
      key: string,
      value: Uint8Array,
      options: { httpMetadata: { contentType: string } }
    ): Promise<unknown>;
    get(key: string): Promise<{
      body: ReadableStream<Uint8Array>;
      httpMetadata?: { contentType?: string };
    } | null>;
  };
}
