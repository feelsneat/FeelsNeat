'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'FN-MEM-XXXX';

  const whatsappMessage = `Hi FeelsNeat! I have submitted a new memories custom order with ID: ${orderId}. Please send payment instructions.`;
  const whatsappUrl = `https://wa.me/919999999999?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#000000] py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background blobs */}
      <div className="morphing-blob absolute top-10 left-10 opacity-20" />
      <div className="morphing-blob absolute bottom-20 right-10 opacity-15" />

      {/* Main card boundaries container */}
      <div className="w-full max-w-xl bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-6 sm:p-10 relative z-10 text-center animate-slide-up">
        {/* Success checkmark icon header */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] mb-6">
          <LucideIcon name="Check" className="h-6 w-6 stroke-[3px]" />
        </div>

        {/* Header Title */}
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mb-2">
          Your memory is on its way.
        </h1>
        <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mb-6">
          Order ID: <span className="text-[#E30613]">{orderId}</span>
        </p>

        {/* Manual Payment WhatsApp Instructions Callout */}
        <div className="bg-[#E30613]/5 border border-[#E30613]/20 rounded-xl p-5 mb-8 text-left space-y-4">
          <div className="flex items-center gap-2 text-[#E30613]">
            <LucideIcon name="MessageSquare" className="h-4.5 w-4.5 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-wider">Manual Order Confirmation</h3>
          </div>
          
          <p className="text-xs text-zinc-700 leading-relaxed font-semibold uppercase">
            To activate and finalize your custom print design, please tap below to connect with us on WhatsApp Business. We will verify your photo layout and send you payment instructions.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#E30613] hover:bg-zinc-900 text-xs font-black uppercase tracking-wider text-white transition-colors duration-300 shadow-md cursor-pointer select-none"
          >
            Confirm on WhatsApp <LucideIcon name="ArrowRight" className="h-4 w-4" />
          </a>
        </div>

        {/* NEXT STEPS PROCESS WORKFLOW CARDS */}
        <div className="space-y-4 text-left border-t border-zinc-100 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-3">What happens next?</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-black shrink-0">1</div>
              <div>
                <h4 className="text-xs font-black uppercase text-black leading-none">Order Review</h4>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold leading-normal">We check your print dimensions and shared Google Photos link details.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-black shrink-0">2</div>
              <div>
                <h4 className="text-xs font-black uppercase text-black leading-none">Confirm & Pay</h4>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold leading-normal">We coordinate layout approvals and payment completion manually via WhatsApp.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-black shrink-0">3</div>
              <div>
                <h4 className="text-xs font-black uppercase text-black leading-none">Design & Print</h4>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold leading-normal">We print your custom photo onto rigid MDF board with matte photographic laminations.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-black shrink-0">4</div>
              <div>
                <h4 className="text-xs font-black uppercase text-black leading-none">Configure NFC</h4>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold leading-normal">We load and program the NFC tag with the shared album link on the back of the panel.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-black shrink-0">5</div>
              <div>
                <h4 className="text-xs font-black uppercase text-black leading-none">Ship Canvas</h4>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold leading-normal">We pack, check quality, and ship your finished visual panels directly to you.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-center">
          <Link
            href="/"
            className="text-xs font-black uppercase text-zinc-500 hover:text-[#E30613] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
