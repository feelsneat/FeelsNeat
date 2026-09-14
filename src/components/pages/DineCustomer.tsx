'use client';

import { useEffect, useMemo, useState } from 'react';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface DineCustomerPageProps {
  restaurantSlug: string;
  tableToken?: string;
}

export default function DineCustomerPage({ restaurantSlug, tableToken }: DineCustomerPageProps) {
  const [data, setData] = useState<any>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [order, setOrder] = useState<any>(null);
  const [orderToken, setOrderToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const load = async () => {
    const params = new URLSearchParams({ restaurantSlug });
    if (tableToken) params.set('tableToken', tableToken);
    if (orderToken) params.set('orderToken', orderToken);
    const res = await fetch(`/api/dine/public?${params.toString()}`);
    const result = await res.json();
    if (res.ok) {
      setError('');
      if (orderToken) setOrder(result.order);
      else setData(result);
    } else {
      setError(result.error || 'This Dine Assist page is not available.');
    }
  };

  useEffect(() => {
    load();
    const timer = orderToken ? window.setInterval(load, 5000) : null;
    return () => { if (timer) window.clearInterval(timer); };
  }, [restaurantSlug, tableToken, orderToken]);

  const cartLines = useMemo(() => {
    if (!data) return [];
    return Object.entries(cart)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => {
        const item = data.items.find((candidate: any) => candidate.id === itemId);
        return item ? { ...item, quantity, line_total: item.price * quantity } : null;
      })
      .filter(Boolean) as any[];
  }, [cart, data]);
  const total = cartLines.reduce((sum, item) => sum + item.line_total, 0);

  const changeQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const nextQuantity = Math.max(0, (prev[itemId] || 0) + delta);
      const next = { ...prev };
      if (nextQuantity === 0) delete next[itemId];
      else next[itemId] = nextQuantity;
      return next;
    });
  };

  const submitOrder = async () => {
    if (submitting || cartLines.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/dine/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantSlug,
          tableToken,
          items: cartLines.map((item) => ({ item_id: item.id, quantity: item.quantity })),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not place order.');
      setOrder(result.order);
      setOrderToken(result.order.access_token);
      setCart({});
      setReviewing(false);
    } catch (err: any) {
      setError(err.message || 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !data && !order) {
    return <main className="min-h-screen bg-[#111113] text-white flex items-center justify-center p-6"><p className="text-sm font-bold text-center">{error}</p></main>;
  }
  if (!data && !order) {
    return <main className="min-h-screen bg-[#111113] text-white flex items-center justify-center p-6"><p className="text-sm font-bold">Loading menu...</p></main>;
  }
  if (order) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] text-black p-4 sm:p-6">
        <div className="mx-auto max-w-md rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-5">
          <div className="h-12 w-12 rounded-xl bg-[#E30613]/10 text-[#E30613] flex items-center justify-center">
            <LucideIcon name="ReceiptText" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase">Order received</h1>
            <p className="text-xs text-zinc-500 font-semibold mt-2">Your order has been sent to the restaurant. Please wait while the restaurant confirms it.</p>
          </div>
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-2 text-xs font-bold">
            <p>Order #{order.order_number}</p>
            <p>Status: <span className="text-[#E30613]">{statusLabel(order.status)}</span></p>
            <p>Verification code: <span className="font-mono text-lg">{order.verification_code}</span></p>
          </div>
          {order.status === 'REJECTED' && (
            <p className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-700">The restaurant rejected this order. Please speak with the staff at your table.</p>
          )}
          <p className="text-xs text-zinc-500 leading-relaxed font-semibold">Keep this page open. The status refreshes automatically.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-black pb-40">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-200 p-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-black uppercase truncate">{data.restaurant.name}</h1>
            <p className="text-xs text-zinc-500 font-bold">{data.table ? data.table.name : data.restaurant.location}</p>
          </div>
          <div className="shrink-0 rounded-lg bg-[#E30613] text-white px-3 py-1.5 text-[10px] font-black uppercase">Menu</div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4 space-y-6">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">{error}</div>}
        {!tableToken && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-800">
            Scan the QR code at your table to place an order. You can still view the menu here.
          </div>
        )}
        {data.categories.map((category: any) => {
          const items = data.items.filter((item: any) => item.category_id === category.id);
          if (items.length === 0) return null;
          return (
            <section key={category.id} className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">{category.name}</h2>
              {items.map((item: any) => (
                <div key={item.id} className={`rounded-xl border bg-white p-4 flex gap-4 ${item.available ? 'border-zinc-200' : 'border-zinc-100 opacity-60'}`}>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black">{item.name}</h3>
                    {item.description && <p className="text-xs text-zinc-500 mt-1 font-semibold leading-relaxed">{item.description}</p>}
                    <p className="text-sm font-black mt-2">₹{item.price}</p>
                    {!item.available && <p className="text-[10px] font-black uppercase text-zinc-500 mt-1">Sold out</p>}
                  </div>
                  {item.available && tableToken && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => changeQuantity(item.id, -1)} className="h-9 w-9 rounded-lg border border-zinc-200 font-black" aria-label={`Remove ${item.name}`}>-</button>
                      <span className="w-6 text-center text-xs font-black">{cart[item.id] || 0}</span>
                      <button onClick={() => changeQuantity(item.id, 1)} className="h-9 w-9 rounded-lg bg-black text-white font-black" aria-label={`Add ${item.name}`}>+</button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          );
        })}
      </div>

      {tableToken && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4">
          <div className="mx-auto max-w-3xl space-y-3">
            {reviewing && (
              <div className="max-h-48 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-semibold">
                <p className="mb-2 font-black uppercase text-zinc-500">Review order</p>
                {cartLines.map((item) => (
                  <p key={item.id} className="flex justify-between gap-3 py-1">
                    <span>{item.quantity} x {item.name}</span>
                    <span className="font-black">₹{item.line_total}</span>
                  </p>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-zinc-500 font-bold">{cartLines.length} item types</p>
                <p className="text-lg font-black">₹{total}</p>
              </div>
              {!reviewing ? (
                <button onClick={() => setReviewing(true)} disabled={cartLines.length === 0 || submitting} className="h-11 rounded-lg bg-black px-6 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50">
                  Review Order
                </button>
              ) : (
                <button onClick={submitOrder} disabled={cartLines.length === 0 || submitting} className="h-11 rounded-lg bg-[#E30613] px-6 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Place Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_CONFIRMATION: 'WAITING FOR CONFIRMATION',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
  };
  return labels[status] || status.replaceAll('_', ' ');
}
