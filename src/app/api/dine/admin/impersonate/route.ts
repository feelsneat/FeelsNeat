import { NextRequest, NextResponse } from 'next/server';
import { signRestaurantSession } from '@/lib/auth';
import { authenticateFeelsNeatAdmin, getAuthSecret } from '@/lib/dine-auth';
import { loadDineDb } from '@/lib/dine';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const admin = await authenticateFeelsNeatAdmin(req);
  const secret = getAuthSecret();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!secret) return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 500 });

  const body = await req.json();
  const restaurantId = String(body.restaurant_id || '');
  const db = await loadDineDb(req.url);
  const restaurant = db.restaurants.find((candidate) => candidate.id === restaurantId && candidate.status !== 'PAUSED');
  if (!restaurant) return NextResponse.json({ error: 'Restaurant is not available.' }, { status: 404 });

  const user = db.users.find((candidate) => candidate.restaurant_id === restaurant.id && candidate.status === 'ACTIVE');
  if (!user) return NextResponse.json({ error: 'No active restaurant user exists for this restaurant.' }, { status: 404 });

  const token = await signRestaurantSession({
    user_id: user.id,
    restaurant_id: restaurant.id,
    email: user.email,
    role: 'RESTAURANT_USER',
    admin_email: admin.email,
    impersonated_by_admin: true,
  }, secret);

  const res = NextResponse.json({ success: true, redirectTo: '/dine-admin' });
  res.cookies.set('feelsneat_restaurant_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });
  return res;
}
