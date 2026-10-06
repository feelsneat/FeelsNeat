'use client';

import { useRef, useState } from 'react';

interface ReviewCardsPageProps {
  whatsappNumber: string;
}

type StickerMaterial = 'WHITE_PAPER' | 'TRANSPARENT';

function normalizeIndianPhone(value: string): string {
  return value.replace(/\D/g, '');
}

export default function ReviewCardsPage({ whatsappNumber }: ReviewCardsPageProps) {
  const [form, setForm] = useState({
    businessName: '',
    googleReviewUrl: '',
    quantity: '10',
    material: 'WHITE_PAPER' as StickerMaterial,
    stickerText: 'Review us on Google',
    customerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    deliveryAddress: '',
    notes: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoName, setLogoName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedOrderId, setSubmittedOrderId] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (name === 'phone' && !form.whatsapp) setForm((previous) => ({ ...previous, whatsapp: value }));
  };

  const prepareLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLogoFile(null);
    setLogoName('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a PNG, JPG, or WEBP logo smaller than 5 MB.');
      return;
    }

    const image = new Image();
    const imageUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      const scale = Math.min(1, 600 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Could not process the logo. You can continue without it.');
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < pixels.data.length; index += 4) {
        const luminance = pixels.data[index] * 0.299 + pixels.data[index + 1] * 0.587 + pixels.data[index + 2] * 0.114;
        if (luminance > 190) {
          pixels.data[index + 3] = 0;
        } else {
          pixels.data[index] = 0;
          pixels.data[index + 1] = 0;
          pixels.data[index + 2] = 0;
          pixels.data[index + 3] = 255;
        }
      }
      context.putImageData(pixels, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Could not process the logo. You can continue without it.');
          return;
        }
        if (blob.size > 250_000) {
          setError('That logo is too detailed for a thermal sticker. Try a smaller or simpler black-and-white image.');
          return;
        }
        setLogoFile(new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.png`, { type: 'image/png' }));
        setLogoName(file.name);
        setError('');
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      setError('Could not read the selected logo.');
    };
    image.src = imageUrl;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        whatsapp: form.whatsapp || form.phone,
      };
      const requestBody = new FormData();
      requestBody.append('payload', JSON.stringify(payload));
      if (logoFile) requestBody.append('logo_file', logoFile, logoFile.name);
      const response = await fetch('/api/review-cards/orders', {
        method: 'POST',
        body: requestBody,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit the order request.');

      const message = [
        `Hi FeelsNeat, I submitted a Google Review Card order request (${result.orderId}).`,
        `Shop: ${form.businessName}`,
        `Quantity: ${form.quantity}`,
        `Sticker: ${form.material === 'TRANSPARENT' ? 'Transparent' : 'White paper'}`,
        `Review link: ${form.googleReviewUrl}`,
        'Please confirm the final price and shipping before production.',
      ].join('\n');
      const phone = normalizeIndianPhone(whatsappNumber);
      setWhatsappLink(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
      setSubmittedOrderId(result.orderId);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not submit the order request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0C] px-4 pb-20 pt-28 text-white sm:px-6">
      <section className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
        <div className="space-y-7">
          <span className="inline-flex rounded-full border border-[#E30613]/30 bg-[#E30613]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#E30613]">FeelsNeat Review Cards</span>
          <h1 className="text-4xl font-black uppercase leading-tight sm:text-6xl">Make every happy customer easy to hear.</h1>
          <p className="max-w-xl text-sm leading-7 text-zinc-300">A clean, pre-branded Google review card with a shop-specific QR sticker, prepared for your business and shipped to you.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['01', 'Share your Google review link'],
              ['02', 'Approve your shop sticker'],
              ['03', 'We print, apply, and ship'],
            ].map(([number, text]) => (
              <div key={number} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="text-xs font-black text-[#E30613]">{number}</span>
                <p className="mt-2 text-xs font-bold leading-5">{text}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white p-6 text-zinc-900">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">How the card is customized</p>
            <h2 className="mt-2 text-xl font-black">White FeelsNeat card. Custom shop sticker.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">The card has FeelsNeat branding and a Google Review reference already printed. We add a separate thermal sticker with your shop name, optional logo, and QR code. Choose white paper or transparent sticker material.</p>
            <p className="mt-3 text-xs font-bold text-zinc-500">Sticker artwork is one 50 × 30 mm label, designed for 203 dpi thermal printing.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-6 text-zinc-900 shadow-2xl sm:p-8">
          {submittedOrderId ? (
            <div className="space-y-5 py-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl font-black text-emerald-700">✓</div>
              <h2 className="text-2xl font-black">Request saved</h2>
              <p className="text-sm text-zinc-600">Your reference is <strong>{submittedOrderId}</strong>. WhatsApp will open with your order details. Tap Send so we can confirm the final price and shipping before production.</p>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-emerald-600 px-5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700">Continue to WhatsApp</a>
              <button type="button" onClick={() => { setSubmittedOrderId(''); setWhatsappLink(''); }} className="w-full text-xs font-bold text-zinc-500">Submit another request</button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black uppercase">Request your custom card order</h2>
              <p className="mt-2 text-xs leading-5 text-zinc-500">We’ll review the QR, confirm price and delivery on WhatsApp, then make your order.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Shop / business name *
                    <input required name="businessName" value={form.businessName} onChange={update} maxLength={100} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Google review link *
                    <input required type="url" name="googleReviewUrl" value={form.googleReviewUrl} onChange={update} placeholder="https://g.page/r/..." className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Card quantity *
                    <input required type="number" min="1" max="500" name="quantity" value={form.quantity} onChange={update} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Sticker material *
                    <select name="material" value={form.material} onChange={update} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900">
                      <option value="WHITE_PAPER">White paper</option>
                      <option value="TRANSPARENT">Transparent</option>
                    </select>
                  </label>
                </div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Text on your sticker
                  <input name="stickerText" value={form.stickerText} onChange={update} maxLength={80} placeholder="Review us on Google" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                </label>
                <div className="rounded-lg border border-dashed border-zinc-300 p-3">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Shop logo (optional)
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={prepareLogo} className="mt-2 block w-full text-xs normal-case text-zinc-600" />
                  </label>
                  <p className="mt-2 text-[10px] leading-4 text-zinc-500">We convert it to black-and-white for thermal printing.{logoName ? ` Selected: ${logoName}` : ''}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Contact name *
                    <input required name="customerName" value={form.customerName} onChange={update} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Phone *
                    <input required type="tel" name="phone" value={form.phone} onChange={update} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">WhatsApp
                    <input type="tel" name="whatsapp" value={form.whatsapp} onChange={update} placeholder="Defaults to phone" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                  </label>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Email (optional)
                    <input type="email" name="email" value={form.email} onChange={update} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                  </label>
                </div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Delivery address *
                  <textarea required name="deliveryAddress" value={form.deliveryAddress} onChange={update} rows={3} maxLength={1200} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                </label>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Additional details (optional)
                  <textarea name="notes" value={form.notes} onChange={update} rows={2} maxLength={1000} placeholder="Anything else to include on the sticker?" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold normal-case text-zinc-900" />
                </label>
                {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
                <button disabled={submitting} className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#E30613] px-5 text-xs font-black uppercase tracking-wider text-white hover:bg-zinc-900 disabled:opacity-50">
                  {submitting ? 'Saving request…' : 'Submit request'}
                </button>
                <p className="text-center text-[10px] leading-4 text-zinc-400">No payment is taken here. We’ll confirm pricing and shipping with you on WhatsApp.</p>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
