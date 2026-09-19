'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface TrackOrderPageProps {
  initialOrderId?: string;
  initialPhone?: string;
  initialToken?: string;
}

export default function TrackOrderPage({ initialOrderId = '', initialPhone = '', initialToken = '' }: TrackOrderPageProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!orderId.trim() || (!phone.trim() && !initialToken)) {
      setError('Enter your order ID and phone number.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const params = new URLSearchParams({ orderId: orderId.trim() });
      if (phone.trim()) params.set('phone', phone.trim());
      if (initialToken) params.set('token', initialToken);
      const res = await fetch(`/api/ecommerce/track?${params.toString()}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not find this order.');
      setOrder(result.order);
    } catch (err: any) {
      setError(err.message || 'Could not find this order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] pt-28 pb-24 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="border-b border-white/10 pb-6">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white">
            <LucideIcon name="ArrowLeft" className="h-3.5 w-3.5" />
            Back to shop
          </Link>
          <h1 className="mt-5 text-3xl font-black uppercase tracking-tight text-white">Track Order</h1>
          <p className="mt-2 text-sm text-zinc-400">Check payment, fulfillment, and shipment milestones for a FeelsNeat shop order.</p>
        </div>

        <form onSubmit={lookup} className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Order ID, e.g. FN-10001"
            className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E30613]"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone number required"
            className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E30613]"
          />
          <button disabled={loading} className="h-11 rounded-xl bg-[#E30613] px-5 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black disabled:opacity-60">
            {loading ? 'Checking...' : 'Track'}
          </button>
        </form>

        {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-xs font-bold text-red-200">{error}</div>}

        {order && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E30613]">Order {order.orderId}</p>
                <h2 className="mt-2 text-xl font-black uppercase text-white">{order.customerName}</h2>
                <p className="text-xs font-semibold text-zinc-400">{order.shippingCity}, {order.shippingState}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-right">
                <p className="text-[10px] font-black uppercase text-zinc-500">Total</p>
                <p className="text-lg font-black text-[#E30613]">₹{order.total}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-xs font-bold">
              <StatusCard label="Order" value={order.orderStatus} />
              <StatusCard label="Payment" value={order.paymentStatus} />
              <StatusCard label="Fulfillment" value={order.fulfillmentStatus} />
            </div>

            {order.shipment && (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs font-semibold">
                <p className="font-black uppercase text-white">Shipment</p>
                <p className="mt-2 text-zinc-300">{order.shipment.courier} · {order.shipment.trackingNumber}</p>
                {order.shipment.trackingUrl && <a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[#E30613] font-black uppercase">Open courier tracking</a>}
              </div>
            )}

            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Items</p>
              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div key={`${item.title}-${index}`} className="flex justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs font-semibold">
                    <span>{item.quantity} x {item.title}{item.variantTitle ? ` (${item.variantTitle})` : ''}</span>
                    <span className="font-black text-white">₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Timeline</p>
              <div className="space-y-3">
                {order.timeline.map((event: any, index: number) => (
                  <div key={`${event.timestamp}-${index}`} className="border-l border-white/15 pl-4">
                    <p className="text-xs font-black uppercase text-white">{event.event}</p>
                    <p className="text-[10px] font-semibold text-zinc-500">{new Date(event.timestamp).toLocaleString()}</p>
                    {event.notes && <p className="mt-1 text-xs text-zinc-400">{event.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatusCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-[10px] font-black uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-xs font-black uppercase text-white">{(value || '').replaceAll('_', ' ') || 'N/A'}</p>
    </div>
  );
}
