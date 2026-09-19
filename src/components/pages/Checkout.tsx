'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { getCart, clearCart, CartItem } from '@/lib/ecommerce/cart';

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('PREPAID');
  const [discountCode, setDiscountCode] = useState('');

  // Cart summary calculated from server
  const [summary, setSummary] = useState({
    subtotal: 0,
    discountAmount: 0,
    shippingCharge: 0,
    codFee: 0,
    total: 0,
  });

  useEffect(() => {
    const current = getCart();
    setItems(current);

    if (current.length === 0) return;

    // Validate prices with backend
    fetch('/api/ecommerce/cart/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: current.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        paymentMethod,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.total !== undefined) {
          setSummary({
            subtotal: data.subtotal,
            discountAmount: data.discountAmount,
            shippingCharge: data.shippingCharge,
            codFee: data.codFee || 0,
            total: data.total,
          });
        }
      })
      .catch((err) => console.error('Cart sync error:', err));
  }, [paymentMethod]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customer.name || !customer.email || !customer.phone) {
      setErrorMessage('Please provide your name, email, and phone number.');
      return;
    }

    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setErrorMessage('Please fill in your complete shipping address including pincode.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/ecommerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          shippingAddress,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          discountCode,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Clear shopping cart upon successful creation
      clearCart();

      // Redirect to Cashfree payment or confirmation screen
      if (data.paymentRedirectUrl) {
        window.location.href = data.paymentRedirectUrl;
      } else {
        window.location.href = `/shop/order-confirmation/${data.orderId}`;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while placing your order.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] text-white pt-32 pb-24 px-4 sm:px-8 max-w-2xl mx-auto text-center">
        <div className="border border-white/10 rounded-2xl bg-white/5 p-12">
          <LucideIcon name="ShoppingBag" className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold uppercase tracking-wider">Your Cart is Empty</h1>
          <p className="text-zinc-400 text-xs mt-2 mb-6">
            Please add an object to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#E30613] px-6 text-xs font-black uppercase tracking-wider text-white hover:bg-white hover:text-black transition-colors"
          >
            Go to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] pt-28 pb-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      <div className="morphing-blob absolute top-20 left-10 opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Checkout</h1>
            <p className="text-xs text-zinc-400 mt-1 uppercase font-bold tracking-wider">
              Complete your FeelsNeat order
            </p>
          </div>
          <Link
            href="/cart"
            className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <LucideIcon name="ArrowLeft" className="h-3.5 w-3.5" />
            <span>Return to Cart</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-3">
            <LucideIcon name="AlertTriangle" className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Form: Customer & Shipping Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact Details Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider border-b border-white/10 pb-3">
                <LucideIcon name="User" className="h-4 w-4 text-[#E30613]" />
                <span>1. Contact Information</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider border-b border-white/10 pb-3">
                <LucideIcon name="MapPin" className="h-4 w-4 text-[#E30613]" />
                <span>2. Delivery Address</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                    Street Address / Flat / Building *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Apartment 402, Green Valley Enclave"
                    value={shippingAddress.line1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                    Landmark / Colony (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Near City Park"
                    value={shippingAddress.line2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E30613]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Karnataka"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E30613]"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="560001"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E30613]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider border-b border-white/10 pb-3">
                <LucideIcon name="CreditCard" className="h-4 w-4 text-[#E30613]" />
                <span>3. Payment Method</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Online Payment Option */}
                <label
                  onClick={() => setPaymentMethod('PREPAID')}
                  className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === 'PREPAID'
                      ? 'border-[#E30613] bg-[#E30613]/10 text-white'
                      : 'border-white/15 bg-black/30 text-zinc-400 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-white">
                      <span className={`h-3 w-3 rounded-full border flex items-center justify-center ${paymentMethod === 'PREPAID' ? 'border-[#E30613]' : 'border-zinc-500'}`}>
                        {paymentMethod === 'PREPAID' && <span className="h-1.5 w-1.5 rounded-full bg-[#E30613]" />}
                      </span>
                      <span>Online Payment</span>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                      Fastest Dispatch
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    UPI, Credit / Debit Cards, Net Banking via Cashfree secure gateway.
                  </p>
                </label>

                {/* COD Option */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#E30613] bg-[#E30613]/10 text-white'
                      : 'border-white/15 bg-black/30 text-zinc-400 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-white">
                      <span className={`h-3 w-3 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-[#E30613]' : 'border-zinc-500'}`}>
                        {paymentMethod === 'COD' && <span className="h-1.5 w-1.5 rounded-full bg-[#E30613]" />}
                      </span>
                      <span>Cash on Delivery</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400">
                      +₹40 COD Fee
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Pay in cash or UPI directly to courier partner upon doorstep delivery.
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Sticky Card */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6 sticky top-24">
            <h2 className="text-base font-black uppercase tracking-wider text-white border-b border-white/10 pb-4">
              Items in Order ({items.length})
            </h2>

            {/* Item Previews */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'base'}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-12 w-12 rounded-lg bg-black/40 object-cover shrink-0 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate uppercase">{item.title}</h4>
                    {item.variantTitle && (
                      <p className="text-[10px] text-zinc-400 truncate">{item.variantTitle}</p>
                    )}
                    <span className="text-[11px] text-zinc-500 font-mono">Qty: {item.quantity}</span>
                  </div>
                  <div className="text-xs font-mono font-black text-white">
                    ₹{item.unitPrice * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs uppercase font-bold">
              <div className="flex justify-between text-zinc-300">
                <span>Subtotal</span>
                <span className="font-mono font-black text-white">₹{summary.subtotal}</span>
              </div>

              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span className="font-mono font-black">-₹{summary.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-300">
                <span>Shipping</span>
                <span className="font-mono font-black text-white">
                  {summary.shippingCharge === 0 ? (
                    <span className="text-emerald-400">FREE</span>
                  ) : (
                    `₹${summary.shippingCharge}`
                  )}
                </span>
              </div>

              {paymentMethod === 'COD' && summary.codFee > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>COD Handling Fee</span>
                  <span className="font-mono font-black text-white">₹{summary.codFee}</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline text-base font-black text-white">
                <span>Total Amount</span>
                <span className="font-mono text-xl text-[#E30613]">₹{summary.total}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E30613] hover:bg-white hover:text-black text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LucideIcon name="Loader2" className="h-4 w-4 animate-spin" />
                  <span>Securing Order...</span>
                </>
              ) : (
                <>
                  <LucideIcon name="Lock" className="h-4 w-4" />
                  <span>
                    {paymentMethod === 'COD' ? 'Confirm Order' : `Pay ₹${summary.total} Now`}
                  </span>
                </>
              )}
            </button>

            <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest font-bold">
              By clicking Place Order, you accept FeelsNeat Terms of Service and 7-Day Return Policy.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
