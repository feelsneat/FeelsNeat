import { NextRequest } from 'next/server';
import { verifyRestaurantSession, verifySession } from './auth';

export function getAuthSecret() {
  return process.env.AUTH_SECRET || (
    process.env.NODE_ENV === 'development'
      ? 'local_dev_secret_key_needs_to_be_long_and_secure_32_chars'
      : undefined
  );
}

export async function authenticateFeelsNeatAdmin(req: NextRequest) {
  const sessionCookie = req.cookies.get('feelsneat_session');
  const authSecret = getAuthSecret();
  if (!sessionCookie?.value || !authSecret) return null;
  return verifySession(sessionCookie.value, authSecret);
}

export async function authenticateRestaurant(req: NextRequest) {
  const sessionCookie = req.cookies.get('feelsneat_restaurant_session');
  const authSecret = getAuthSecret();
  if (!sessionCookie?.value || !authSecret) return null;
  return verifyRestaurantSession(sessionCookie.value, authSecret);
}
