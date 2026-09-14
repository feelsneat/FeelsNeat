const encoder = new TextEncoder();

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const secretKeyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signPayload(payload: Record<string, any>, secret: string): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = btoa(payloadStr)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadBase64)
  );
  
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${payloadBase64}.${signatureBase64}`;
}

async function verifyPayload(token: string, secret: string): Promise<Record<string, any> | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  
  const [payloadBase64, signatureBase64] = parts;
  
  try {
    const key = await getHmacKey(secret);
    
    // Reconstruct signature bytes from base64url
    const sigBinaryStr = atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBytes = new Uint8Array(sigBinaryStr.length);
    for (let i = 0; i < sigBinaryStr.length; i++) {
      sigBytes[i] = sigBinaryStr.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(payloadBase64)
    );
    
    if (!isValid) return null;
    
    // Decode payload
    const payloadStr = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);
    
    if (payload.expires < Date.now()) {
      return null; // Expired
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

export async function signSession(email: string, secret: string): Promise<string> {
  return signPayload({
    email,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }, secret);
}

export async function verifySession(token: string, secret: string): Promise<{ email: string } | null> {
  const payload = await verifyPayload(token, secret);
  if (!payload?.email) return null;
  return { email: payload.email };
}

export interface RestaurantSession {
  user_id: string;
  restaurant_id: string;
  email: string;
  role: 'RESTAURANT_USER';
  admin_email?: string;
  impersonated_by_admin?: boolean;
}

export async function signRestaurantSession(session: RestaurantSession, secret: string): Promise<string> {
  return signPayload({
    ...session,
    expires: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
  }, secret);
}

export async function verifyRestaurantSession(token: string, secret: string): Promise<RestaurantSession | null> {
  const payload = await verifyPayload(token, secret);
  if (
    !payload?.user_id ||
    !payload?.restaurant_id ||
    !payload?.email ||
    payload?.role !== 'RESTAURANT_USER'
  ) {
    return null;
  }
  return {
    user_id: payload.user_id,
    restaurant_id: payload.restaurant_id,
    email: payload.email,
    role: 'RESTAURANT_USER',
    admin_email: typeof payload.admin_email === 'string' ? payload.admin_email : undefined,
    impersonated_by_admin: payload.impersonated_by_admin === true,
  };
}
