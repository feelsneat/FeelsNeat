export type DineEnquiryStatus =
  | 'NEW'
  | 'REVIEWING'
  | 'CONTACTED'
  | 'DISCUSSION'
  | 'APPROVED'
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'REJECTED'
  | 'CLOSED';

export type DineOrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface DineEnquiry {
  enquiry_id: string;
  order_id?: string;
  restaurant_name: string;
  location: string;
  contact_person: string;
  phone: string;
  whatsapp: string;
  email: string;
  table_count: number;
  table_naming: 'standard' | 'custom' | 'not_decided';
  qr_stands_required: number;
  payment_preference: 'pay_at_restaurant' | 'online_payment' | 'not_decided';
  menu_attachment?: { name: string; data: string; type: string } | null;
  additional_requirements: string;
  status: DineEnquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface DineRestaurant {
  id: string;
  name: string;
  slug: string;
  location: string;
  contact_person: string;
  phone: string;
  whatsapp: string;
  email: string;
  logo?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
  subscription_status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'SUSPENDED';
  subscription_start_date: string | null;
  subscription_expiry_date: string | null;
  payment_preference: 'pay_at_restaurant' | 'online_payment' | 'not_decided';
  created_at: string;
  source_enquiry_id?: string;
}

export interface DineRestaurantUser {
  id: string;
  restaurant_id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: 'RESTAURANT_USER';
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface DineMenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  active: boolean;
}

export interface DineMenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  available: boolean;
  active: boolean;
  sort_order: number;
}

export interface DineTable {
  id: string;
  restaurant_id: string;
  name: string;
  token: string;
  active: boolean;
  stand_status: 'NOT_PREPARED' | 'PREPARED' | 'DELIVERED' | 'ACTIVE';
  created_at: string;
}

export interface DineOrder {
  id: string;
  access_token: string;
  restaurant_id: string;
  table_id: string;
  order_type?: 'ORIGINAL' | 'ADD_ON';
  parent_order_id?: string;
  parent_order_number?: number;
  add_on_sequence?: number;
  order_number: number;
  status: DineOrderStatus;
  items: Array<{ item_id: string; name: string; quantity: number; price: number; line_total: number }>;
  subtotal: number;
  total: number;
  payment_status: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  verification_code: string;
  created_at: string;
  updated_at: string;
}

export interface DineDb {
  enquiries: DineEnquiry[];
  restaurants: DineRestaurant[];
  users: DineRestaurantUser[];
  categories: DineMenuCategory[];
  items: DineMenuItem[];
  tables: DineTable[];
  orders: DineOrder[];
}

export const emptyDineDb = (): DineDb => ({
  enquiries: [],
  restaurants: [],
  users: [],
  categories: [],
  items: [],
  tables: [],
  orders: [],
});

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function randomId(prefix: string, size = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < size; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}

export function randomToken(size = 10) {
  const chars = 'abcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < size; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function hashPassword(password: string) {
  const encoded = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function loadDineDb(reqUrl: string): Promise<DineDb> {
  let db = emptyDineDb();
  const mergeIfDineDb = (candidate: unknown) => {
    if (
      candidate &&
      typeof candidate === 'object' &&
      !Array.isArray(candidate) &&
      Array.isArray((candidate as Partial<DineDb>).enquiries) &&
      Array.isArray((candidate as Partial<DineDb>).restaurants) &&
      Array.isArray((candidate as Partial<DineDb>).users) &&
      Array.isArray((candidate as Partial<DineDb>).categories) &&
      Array.isArray((candidate as Partial<DineDb>).items) &&
      Array.isArray((candidate as Partial<DineDb>).tables) &&
      Array.isArray((candidate as Partial<DineDb>).orders)
    ) {
      db = { ...db, ...(candidate as DineDb) };
    }
  };

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const env = context?.env;
    if (env && env.FEELSNEAT_CMS_KV) {
      const val = await env.FEELSNEAT_CMS_KV.get('dine_db');
      if (val) mergeIfDineDb(JSON.parse(val));
    }
  } catch (_) {}

  if (process.env.NODE_ENV === 'development') {
    try {
      const res = await fetch(new URL('/api/dev-db?type=dine', reqUrl).toString());
      if (res.ok) mergeIfDineDb(await res.json());
    } catch (_) {}
  }
  return db;
}

export async function saveDineDb(reqUrl: string, db: DineDb) {
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const env = context?.env;
    if (env && env.FEELSNEAT_CMS_KV) {
      await env.FEELSNEAT_CMS_KV.put('dine_db', JSON.stringify(db));
    }
  } catch (_) {}

  if (process.env.NODE_ENV === 'development') {
    await fetch(new URL('/api/dev-db?type=dine', reqUrl).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_dine_db', dineData: db }),
    });
  }
}
