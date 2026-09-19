'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { getCart, updateCartQuantity, removeFromCart, CartItem } from '@/lib/ecommerce/cart';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [cartSummary, setCartSummary] = useState<{
    subtotal: number;
    discountAmount: number;
    appliedDiscount?: any;
    shippingCharge: number;
    total: number;
  }>({
    subtotal: 0,
    discountAmount: 0,
    shippingCharge: 0,
    total: 0,
  });

  const loadAndValidateCart = async (cartItems: CartItem[], code?: string) => {
    setValidating(true);
    setDiscountError(null);
    try {
      const res = await fetch('/api/ecommerce/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          discountCode: code !== undefined ? code : discountCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCartSummary({
          subtotal: data.subtotal,
          discountAmount: data.discountAmount,
          appliedDiscount: data.appliedDiscount,
          shippingCharge: data.shippingCharge,
          total: data.total,
        });
        if (data.discountError) {
          setDiscountError(data.discountError);
        }
      }
    } catch (err) {
      console.error('Cart validation error:', err);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    const current = getCart();
    setItems(current);
    if (current.length > 0) {
      loadAndValidateCart(current);
    }
  }, []);

  const handleUpdateQty = (item: CartItem, newQty: number) => {
    updateCartQuantity(item.productId, item.variantId, newQty);
    const updated = getCart();
    setItems(updated);
    loadAndValidateCart(updated);
  };

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.productId, item.variantId);
    const updated = getCart();
    setItems(updated);
    loadAndValidateCart(updated);
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    loadAndValidateCart(items, discountCode);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] pt-28 pb-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      <div className="morphing-blob absolute top-20 right-10 opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Your Cart</h1>
            <p className="text-xs text-zinc-400 mt-1 uppercase font-bold tracking-wider">
              {items.length} {items.length === 1 ? 'Object' : 'Objects'} Selected
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <LucideIcon name="ArrowLeft" className="h-3.5 w-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/15 rounded-2xl bg-white/5">
            <LucideIcon name="ShoppingBag" className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">Your cart is empty</h2>
            <p className="text-xs text-zinc-400 mt-1 mb-6 max-w-sm mx-auto">
              Explore our minimalist collection of cordless lamps, desk setups, and design essentials.
            </p>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#E30613] px-6 text-xs font-black uppercase tracking-wider text-white hover:bg-white hover:text-black transition-colors"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'base'}`}
                  className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/5 flex gap-4 items-center relative"
                >
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-black/40 overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                      {item.sku}
                    </div>
                    <h3 className="text-sm font-bold uppercase text-white truncate">{item.title}</h3>
                    {item.variantTitle && (
                      <p className="text-xs text-[#E30613] font-semibold uppercase tracking-wider mt-0.5">
                        {item.variantTitle}
                      </p>
                    )}
                    <div className="text-sm font-black text-white mt-1">₹{item.unitPrice}</div>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-white/20 rounded-lg bg-black/30 overflow-hidden">
                        <button
                          onClick={() => handleUpdateQty(item, item.quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <LucideIcon name="Minus" className="h-3 w-3" />
                        </button>
                        <span className="h-7 w-8 flex items-center justify-center text-xs font-mono font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item, item.quantity + 1)}
                          className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <LucideIcon name="Plus" className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item)}
                        className="text-xs font-bold text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <LucideIcon name="Trash2" className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right pl-2">
                    <div className="text-base font-black text-white tracking-tight">
                      ₹{item.unitPrice * item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
              <h2 className="text-base font-black uppercase tracking-wider text-white border-b border-white/10 pb-4">
                Order Summary
              </h2>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyDiscount} className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block">
                  Have a Coupon Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg bg-black/40 border border-white/15 text-xs text-white uppercase tracking-wider placeholder-zinc-500 focus:outline-none focus:border-[#E30613]"
                  />
                  <button
                    type="submit"
                    disabled={validating}
                    className="h-10 px-4 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-black uppercase tracking-wider text-white transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {discountError && (
                  <p className="text-[11px] font-bold text-red-400">{discountError}</p>
                )}
                {cartSummary.appliedDiscount && (
                  <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <LucideIcon name="Check" className="h-3 w-3" />
                    Coupon "{cartSummary.appliedDiscount.code}" applied (-₹{cartSummary.discountAmount})
                  </p>
                )}
              </form>

              {/* Financial Breakdown */}
              <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs uppercase font-bold">
                <div className="flex justify-between text-zinc-300">
                  <span>Subtotal</span>
                  <span className="font-mono font-black text-white">₹{cartSummary.subtotal}</span>
                </div>

                {cartSummary.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono font-black">-₹{cartSummary.discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-300">
                  <span>Estimated Shipping</span>
                  <span className="font-mono font-black text-white">
                    {cartSummary.shippingCharge === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      `₹${cartSummary.shippingCharge}`
                    )}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline text-base font-black text-white">
                  <span>Total</span>
                  <span className="font-mono text-xl text-[#E30613]">
                    ₹{cartSummary.total}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E30613] hover:bg-white hover:text-black text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
              >
                <LucideIcon name="CreditCard" className="h-4 w-4" />
                <span>Proceed to Checkout</span>
              </Link>

              <div className="text-center pt-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1.5 font-bold">
                  <LucideIcon name="Lock" className="h-3 w-3 text-emerald-500" />
                  Encrypted 256-Bit SSL Checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
