import type { ReviewCardOrder } from './review-card-types';

const REVIEW_CARD_KV_PREFIX = 'review-cards:order:';
const REVIEW_CARD_ORDER_MAX_BYTES = 1_000_000;

function isReviewCardOrder(value: unknown): value is ReviewCardOrder {
  if (!value || typeof value !== 'object') return false;
  const order = value as Partial<ReviewCardOrder>;
  return typeof order.id === 'string' &&
    typeof order.createdAt === 'string' &&
    typeof order.updatedAt === 'string' &&
    typeof order.businessName === 'string' &&
    typeof order.googleReviewUrl === 'string' &&
    typeof order.customerName === 'string' &&
    typeof order.phone === 'string' &&
    typeof order.deliveryAddress === 'string' &&
    Array.isArray(order.printRuns);
}

export async function loadReviewCardOrders(reqUrl: string): Promise<ReviewCardOrder[]> {
  if (process.env.NODE_ENV === 'development') {
    const response = await fetch(new URL('/api/dev-db?type=review-cards', reqUrl));
    if (!response.ok) {
      throw new Error(`Review Cards local storage returned ${response.status}.`);
    }
    const orders: unknown = await response.json();
    if (!Array.isArray(orders) || !orders.every(isReviewCardOrder)) {
      throw new Error('Review Cards local storage contains invalid order data.');
    }
    return orders;
  }

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const env = getRequestContext().env;
    const kv = env?.FEELSNEAT_CMS_KV;
    if (!kv) throw new Error('Review Cards storage is not configured.');

    const keys: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await kv.list({ prefix: REVIEW_CARD_KV_PREFIX, cursor, limit: 1000 });
      keys.push(...page.keys.map((entry: { name: string }) => entry.name));
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);

    const orders = await Promise.all(keys.map(async (key) => {
      const value = await kv.get(key);
      if (!value) throw new Error(`Review Cards order ${key} could not be loaded.`);
      const order: unknown = JSON.parse(value);
      if (!isReviewCardOrder(order)) throw new Error(`Review Cards order ${key} is invalid.`);
      return order;
    }));
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('[Review Cards] Production storage read failed:', error);
    throw new Error('Review Cards orders could not be loaded from production storage.');
  }
}

export async function loadReviewCardOrdersPage(
  reqUrl: string,
  cursor: string | undefined,
  limit: number
): Promise<{ orders: ReviewCardOrder[]; nextCursor: string | null; complete: boolean }> {
  if (process.env.NODE_ENV === 'development') {
    const allOrders = await loadReviewCardOrders(reqUrl);
    const offset = cursor === undefined ? 0 : Number(cursor);
    if (!Number.isSafeInteger(offset) || offset < 0) throw new Error('Review Cards migration cursor is invalid.');
    const orders = allOrders.slice(offset, offset + limit);
    const nextOffset = offset + orders.length;
    return {
      orders,
      nextCursor: nextOffset < allOrders.length ? String(nextOffset) : null,
      complete: nextOffset >= allOrders.length,
    };
  }

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const kv = getRequestContext().env?.FEELSNEAT_CMS_KV;
    if (!kv) throw new Error('Review Cards storage is not configured.');
    const page = await kv.list({
      prefix: REVIEW_CARD_KV_PREFIX,
      ...(cursor ? { cursor } : {}),
      limit,
    });
    const orders = await Promise.all(page.keys.map(async (entry: { name: string }) => {
      const value = await kv.get(entry.name);
      if (!value) throw new Error(`Review Cards order ${entry.name} could not be loaded.`);
      const order: unknown = JSON.parse(value);
      if (!isReviewCardOrder(order)) throw new Error(`Review Cards order ${entry.name} is invalid.`);
      return order;
    }));
    return {
      orders,
      nextCursor: page.list_complete ? null : page.cursor,
      complete: page.list_complete,
    };
  } catch (error) {
    console.error('[Review Cards] Production migration page could not be loaded:', error);
    throw new Error('Review Cards migration data could not be loaded from production storage.');
  }
}

export async function saveReviewCardOrder(reqUrl: string, order: ReviewCardOrder): Promise<void> {
  const serialized = JSON.stringify(order);
  if (new TextEncoder().encode(serialized).byteLength > REVIEW_CARD_ORDER_MAX_BYTES) {
    throw new Error('This order’s artwork is too large to save. Reduce the logo size and try again.');
  }

  if (process.env.NODE_ENV === 'development') {
    const response = await fetch(new URL('/api/dev-db?type=review-cards', reqUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_review_card_order', order }),
    });
    if (!response.ok) {
      throw new Error(`Review Cards local storage returned ${response.status}.`);
    }
    return;
  }

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const env = getRequestContext().env;
    const kv = env?.FEELSNEAT_CMS_KV;
    if (!kv) throw new Error('Review Cards storage is not configured.');
    await kv.put(`${REVIEW_CARD_KV_PREFIX}${order.id}`, serialized);
  } catch (error) {
    console.error('[Review Cards] Production storage write failed:', error);
    throw new Error('Review Card order could not be saved to production storage.');
  }
}
