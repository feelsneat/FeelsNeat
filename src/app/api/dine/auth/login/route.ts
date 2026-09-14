import { NextRequest, NextResponse } from 'next/server';
import { signRestaurantSession } from '@/lib/auth';
import { getAuthSecret } from '@/lib/dine-auth';
import { hashPassword, loadDineDb } from '@/lib/dine';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const secret = getAuthSecret();
  if (!secret) return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 500 });
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

  const db = await loadDineDb(req.url);
  const user = db.users.find((candidate) => candidate.email.toLowerCase() === email && candidate.status === 'ACTIVE');
  if (!user) return NextResponse.json({ error: 'Invalid restaurant login.' }, { status: 401 });
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.password_hash) {
    return NextResponse.json({ error: 'Invalid restaurant login.' }, { status: 401 });
  }
  const restaurant = db.restaurants.find((candidate) => candidate.id === user.restaurant_id && candidate.status !== 'PAUSED');
  if (!restaurant) return NextResponse.json({ error: 'Restaurant account is not active.' }, { status: 403 });

  const token = await signRestaurantSession({
    user_id: user.id,
    restaurant_id: user.restaurant_id,
    email: user.email,
    role: 'RESTAURANT_USER',
  }, secret);

  const res = NextResponse.json({ success: true });
  res.cookies.set('feelsneat_restaurant_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 3 * 24 * 60 * 60,
  });
  return res;
}
