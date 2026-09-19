'use client';

export interface CartItem {
  productId: string;
  variantId?: string;
  sku: string;
  title: string;
  variantTitle?: string;
  unitPrice: number;
  quantity: number;
  image: string;
  maxStock: number;
}

const CART_STORAGE_KEY = 'feelsneat_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading cart from storage:', e);
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('feelsneat_cart_updated', { detail: { count: getCartCount() } }));
  } catch (e) {
    console.error('Error saving cart to storage:', e);
  }
}

export function addToCart(newItem: CartItem): void {
  const current = getCart();
  const existingIdx = current.findIndex(
    (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
  );

  if (existingIdx >= 0) {
    const currentQty = current[existingIdx].quantity;
    const updatedQty = Math.min(currentQty + newItem.quantity, newItem.maxStock || 99);
    current[existingIdx].quantity = updatedQty;
  } else {
    current.push(newItem);
  }

  saveCart(current);
}

export function updateCartQuantity(productId: string, variantId: string | undefined, quantity: number): void {
  const current = getCart();
  const idx = current.findIndex(
    (i) => i.productId === productId && i.variantId === variantId
  );

  if (idx >= 0) {
    if (quantity <= 0) {
      current.splice(idx, 1);
    } else {
      current[idx].quantity = Math.min(quantity, current[idx].maxStock || 99);
    }
    saveCart(current);
  }
}

export function removeFromCart(productId: string, variantId?: string): void {
  const current = getCart();
  const filtered = current.filter(
    (i) => !(i.productId === productId && i.variantId === variantId)
  );
  saveCart(filtered);
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartCount(): number {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
