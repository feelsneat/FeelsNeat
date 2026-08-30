'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface OrderConfirmationPageProps {
  whatsappNumber?: string;
}

export default function OrderConfirmationPage({ whatsappNumber }: OrderConfirmationPageProps) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'FN-MEM-XXXX';
  const type = searchParams.get('type') || '';
  const subType = searchParams.get('subType') || '';

  let orderType = 'memories';
  let headerTitle = 'Your memory is on its way.';
  let typeLabel = 'Manual Order Confirmation';
  let bodyInstruction = 'To activate and finalize your custom print design, please tap below to connect with us on WhatsApp Business. We will verify your photo layout and send you payment instructions.';
  
  let whatsappMessage = `Hi FeelsNeat! I have submitted a new memories custom order with ID: ${orderId}. Please send payment instructions.`;

  if (orderId.startsWith('FN-PET-')) {
    orderType = 'pet_tap_tile';
    headerTitle = "🐾 We've received your request!";
    typeLabel = 'Pet Tap Tile Confirmation';
    bodyInstruction = "Thank you for sharing the details with us. 😊\n\nWe've successfully received your Pet Tap Tile customization request. We'll review your details and reach out to you shortly to confirm your order and discuss the next steps.\n\nYou don't need to do anything else right now. ✨";
    whatsappMessage = `Hi FeelsNeat! 👋🐾\n\nI've submitted a Pet Tap Tile request through your website.\n\nMy Request ID is: ${orderId}\n\nI'd like to discuss my request. 😊`;
  } else if (orderId.startsWith('FN-SRV-') || type === 'service') {
    orderType = 'service';
    headerTitle = 'Your service request has been received.';
    typeLabel = 'Project Coordination';
    bodyInstruction = 'To align on specifications and start coordination for your service requirement, please tap below to connect with us on WhatsApp. Our engineer will sync with you directly.';
    
    if (subType === 'website-development') {
      whatsappMessage = `Hi FeelsNeat! 👋\n\nI've submitted a Social Media-to-Store Development service request with ID: ${orderId}.\n\nI'd like to learn more about building a custom shopping website and connecting it with social media, WhatsApp, payments, and other business tools.\n\nI'd love to discuss my business and idea with you. 😊`;
    } else if (subType === 'security-review') {
      whatsappMessage = `Hi FeelsNeat! 👋\n\nI've submitted a Security Review service request with ID: ${orderId}.\n\nI'd like to discuss my current setup and understand how FeelsNeat could help review and improve its security. 😊`;
    } else {
      whatsappMessage = `Hi FeelsNeat! 👋\n\nI've submitted an AI Agentic Integration service request with ID: ${orderId}.\n\nI'd like to discuss my workflow and explore what tasks could potentially be automated using AI. 😊`;
    }
  } else if (orderId.startsWith('FN-DIG-') || type === 'digital_product') {
    orderType = 'digital_product';
    headerTitle = 'Your order request has been received.';
    typeLabel = 'Digital Download Confirmation';
    bodyInstruction = 'To finalize and receive your instant digital download file/template link, please tap below to connect with us on WhatsApp. We will send you payment and download instructions.';
    whatsappMessage = `Hi FeelsNeat! I have submitted a new digital product order with ID: ${orderId}. Please send payment and download instructions.`;
  } else if (orderId.startsWith('FN-TAP-') || type === 'tap_tiles') {
    orderType = 'tap_tiles';
    headerTitle = 'Your Tap Tile order has been received.';
    typeLabel = 'Tap Tile Confirmation';
    bodyInstruction = 'To finalize and program your custom NFC mini artwork tile, please tap below to connect with us on WhatsApp. We will verify your photo crop and target link.';
    
    if (subType === 'pets') {
      whatsappMessage = `Hi FeelsNeat! 🐶🐱\n\nI've submitted a Pet Tap Tile order with ID: ${orderId}.\n\nI'd like to use a photograph of my pet and connect the NFC tap to something meaningful or useful. 😊`;
    } else if (subType === 'nostalgia') {
      whatsappMessage = `Hi FeelsNeat! 🕹️✨\n\nI've submitted a Nostalgia & Childhood Tap Tile order with ID: ${orderId}.\n\nI have an old memory, childhood photograph, retro reference, or special song that I'd like to turn into a personalized NFC Tap Tile. 😊`;
    } else if (subType === 'friends') {
      whatsappMessage = `Hi FeelsNeat! 😄\n\nI've submitted a Funny & Personal Tap Tile order with ID: ${orderId}.\n\nI have a funny photo, friendship memory, inside joke, or personal idea that I'd like to turn into a custom NFC Tap Tile. 🎵`;
    } else {
      whatsappMessage = `Hi FeelsNeat! 👋🎵\n\nI've submitted a Tap Tile order with ID: ${orderId}.\n\nI'd like to create a small custom artwork with an NFC tap that can open a song, playlist, video, photo album, or another link. 😊`;
    }
  } else {
    orderType = 'memories';
    headerTitle = 'Your memory is on its way.';
    typeLabel = 'Manual Order Confirmation';
    bodyInstruction = 'To activate and finalize your custom print design, please tap below to connect with us on WhatsApp Business. We will verify your photo layout and send you payment instructions.';
    
    if (subType === 'travel') {
      whatsappMessage = `Hi FeelsNeat! ✈️\n\nI've submitted a Travel Memory Canvas order with ID: ${orderId}.\n\nI'd like to use photographs and memories from a trip and turn them into a personalized physical artwork. 😊`;
    } else if (subType === 'events') {
      whatsappMessage = `Hi FeelsNeat! 🎉\n\nI've submitted a Memory Canvas order for a special event or celebration with ID: ${orderId}.\n\nI'd like to preserve some photographs and memories from the occasion in a personalized artwork. 😊`;
    } else if (subType === 'couples') {
      whatsappMessage = `Hi FeelsNeat! ❤️\n\nI've submitted a Couple Memory Canvas order with ID: ${orderId}.\n\nI'd like to turn some special shared memories and photographs into something personal and meaningful. 😊`;
    } else {
      whatsappMessage = `Hi FeelsNeat! 👋🐾\n\nI've submitted a Family, Life or Pet Memory Canvas order with ID: ${orderId}.\n\nI'd like to turn some meaningful photographs and memories into a personalized artwork. 😊`;
    }
  }

  const targetPhone = whatsappNumber || '919999999999';
  const whatsappUrl = `https://wa.me/${targetPhone.replace(/[+\s-]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

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
          {headerTitle}
        </h1>
        <p className="text-sm text-zinc-500 uppercase font-black tracking-widest mb-6">
          Order ID: <span className="text-[#E30613]">{orderId}</span>
        </p>

        {/* Manual Payment WhatsApp Instructions Callout OR Pet Confirmation Alert Box */}
        {orderType === 'pet_tap_tile' ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-8 text-left space-y-3">
            <div className="flex items-center gap-2 text-zinc-800">
              <LucideIcon name="ShieldCheck" className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
              <h3 className="text-sm font-black uppercase tracking-wider">{typeLabel}</h3>
            </div>
            
            <p className="text-sm text-zinc-650 leading-relaxed font-semibold whitespace-pre-line">
              {bodyInstruction}
            </p>
          </div>
        ) : (
          <div className="bg-[#E30613]/5 border border-[#E30613]/20 rounded-xl p-5 mb-8 text-left space-y-4">
            <div className="flex items-center gap-2 text-[#E30613]">
              <LucideIcon name="MessageSquare" className="h-4.5 w-4.5 shrink-0" />
              <h3 className="text-sm font-black uppercase tracking-wider">{typeLabel}</h3>
            </div>
            
            <p className="text-sm text-zinc-700 leading-relaxed font-semibold">
              {bodyInstruction}
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#E30613] hover:bg-zinc-900 text-sm font-black uppercase tracking-wider text-white transition-colors duration-300 shadow-md cursor-pointer select-none"
            >
              Confirm on WhatsApp <LucideIcon name="ArrowRight" className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* NEXT STEPS PROCESS WORKFLOW CARDS */}
        <div className="space-y-4 text-left border-t border-zinc-100 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-3">What happens next?</h3>
          
          <div className="space-y-4">
            {orderType === 'pet_tap_tile' ? (
              <>
                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">1</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">We review your customization request</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We review your customization choices, photos, and NFC details.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">2</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">We'll contact you to confirm final details</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We reach out to you directly to verify layout options and answer questions.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">3</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Once everything is confirmed, we'll share payment details</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">Once everything looks perfect, we share UPI payment details to begin production.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">4</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">We create and prepare your personalized Pet Tap Tile</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We prepare your pet's public page and write the target link to the embedded chip.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">5</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Your order is packed and delivered to you</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We hand-craft your personalized Pet Tap Tile, package it, and ship it to you.</p>
                  </div>
                </div>
              </>
            ) : orderType === 'memories' ? (
              <>
                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">1</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Order Review</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We check your print dimensions and shared Google Photos link details.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">2</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Confirm & Pay</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We coordinate layout approvals and payment completion manually via WhatsApp.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">3</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Design & Print</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We print your custom photo onto rigid MDF board with matte photographic laminations.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">4</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Configure NFC</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We load and program the NFC tag with the shared album link on the back of the panel.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">5</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Ship Canvas</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We pack, check quality, and ship your finished visual panels directly to you.</p>
                  </div>
                </div>
              </>
            ) : orderType === 'digital_product' ? (
              <>
                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">1</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Request Review</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We verify your selected template configuration details.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">2</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Confirm & Pay</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We send manual UPI details and verification notes via WhatsApp.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">3</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Download Link</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">Upon payment, we send your custom Notion template or spreadsheet download link directly.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">1</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Requirements Sync</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">Our technical lead reviews your requirements notes and goals.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">2</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Alignment & Quote</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We align on layout variables, technology stack, and manual coordination on WhatsApp.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-black shrink-0">3</div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-black leading-none">Kick-off & Design</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 font-semibold leading-normal">We initiate clean engineering development and visual updates once specs are locked.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Optional WhatsApp Contact box for Pet Tap Tile requests */}
        {orderType === 'pet_tap_tile' && (
          <div className="mt-8 pt-6 border-t border-zinc-100 text-left space-y-3">
            <h4 className="text-xs font-black uppercase text-black tracking-widest">Want to contact us directly?</h4>
            <p className="text-xs text-zinc-500 font-semibold leading-normal">If you'd like to discuss your request with us right away, you can also message us on WhatsApp.</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 hover:border-[#25D366] bg-white px-4 text-xs font-black uppercase tracking-wider text-zinc-800 transition-colors shadow-3xs cursor-pointer select-none gap-2 hover:bg-[#25D366]/5"
            >
              <LucideIcon name="MessageSquare" className="h-4 w-4 text-[#25D366]" /> Chat with us on WhatsApp
            </a>
          </div>
        )}

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
