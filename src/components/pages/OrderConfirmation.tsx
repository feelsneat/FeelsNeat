'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface OrderConfirmationPageProps {
  orderId: string;
  token?: string;
}

export default function EcommerceOrderConfirmationPage({ orderId, token = '' }: OrderConfirmationPageProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/ecommerce/track?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load confirmed order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] pt-28 pb-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="morphing-blob absolute top-20 left-10 opacity-15 pointer-events-none" />
      <div className="morphing-blob-large absolute bottom-10 right-10 opacity-10 pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative z-10 text-center animate-slide-up">
        {/* Success Checkmark Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E30613]/15 border border-[#E30613]/30 text-[#E30613] mb-6">
          <LucideIcon name="Check" className="h-8 w-8 stroke-[3px]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-2">
          Order Confirmed!
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
          Thank you for choosing FeelsNeat. Your order has been placed and our fulfillment team is preparing your package.
        </p>

        {/* Order Identifier Callout */}
        <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-white mb-8">
          <span className="text-zinc-400">Order ID:</span>
          <span className="text-[#E30613] font-black text-sm">{orderId}</span>
        </div>

        {/* Order Snapshot if loaded */}
        {order && (
          <div className="bg-black/40 border border-white/10 rounded-xl p-5 text-left mb-8 space-y-4 text-xs uppercase font-bold">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-zinc-400">Recipient:</span>
              <span className="text-white">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-zinc-400">Destination:</span>
              <span className="text-white">{order.shippingCity}, {order.shippingState}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-zinc-400">Payment Method:</span>
              <span className="text-white">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Prepaid)'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-zinc-400">Total Paid:</span>
              <span className="text-white font-mono text-sm text-[#E30613]">₹{order.total}</span>
            </div>

            {/* Items Summary */}
            <div className="pt-2">
              <span className="text-[10px] text-zinc-400 block mb-2 font-black tracking-wider">Ordered Items:</span>
              <div className="space-y-2">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-zinc-300">
                    <span className="truncate max-w-[70%]">
                      {item.quantity} × {item.title} {item.variantTitle ? `(${item.variantTitle})` : ''}
                    </span>
                    <span className="font-mono text-white">₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#E30613] hover:bg-white hover:text-black px-6 text-xs font-black uppercase tracking-wider text-white transition-colors shadow-lg"
          >
            <LucideIcon name="Truck" className="h-4 w-4" />
            <span>Track Order Status</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
