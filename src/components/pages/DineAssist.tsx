'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface DineAssistPageProps {
  whatsappNumber: string;
}

const dineImages = [
  {
    src: '/images/dine-assist/customer-qr-menu.png',
    alt: 'Customers scanning a restaurant table QR code and viewing a digital menu',
    title: 'Customer table menu',
    text: 'Guests scan the table QR, browse the live menu, and add items without installing an app.',
  },
  {
    src: '/images/dine-assist/restaurant-order-tablet.png',
    alt: 'Restaurant staff managing Dine Assist orders on a tablet',
    title: 'Restaurant order desk',
    text: 'Staff receive table orders in the restaurant portal and move them through preparation.',
  },
  {
    src: '/images/dine-assist/live-orders-kitchen.png',
    alt: 'Kitchen team viewing live Dine Assist order status board',
    title: 'Live order workflow',
    text: 'Orders can be confirmed, prepared, marked ready, and completed with a simple status flow.',
  },
];

export default function DineAssistPage({ whatsappNumber }: DineAssistPageProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    restaurant_name: '',
    location: '',
    contact_person: '',
    phone: '',
    whatsapp: '',
    email: '',
    table_count: '20',
    qr_stands_required: '20',
    additional_requirements: '',
  });
  const [menuAttachment, setMenuAttachment] = useState<{ name: string; type: string; data: string } | null>(null);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, qr_stands_required: prev.qr_stands_required || prev.table_count }));
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'table_count' ? { qr_stands_required: value } : {}),
    }));
  };

  const handleMenuUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setStatus('error');
      setMessage('Please upload a JPG, PNG, WEBP, or PDF menu file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus('error');
      setMessage('Please upload a menu file under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMenuAttachment({ name: file.name, type: file.type, data: String(reader.result || '') });
      setStatus('idle');
      setMessage('');
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/dine/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, table_count: Number(formData.table_count), qr_stands_required: Number(formData.qr_stands_required), menu_attachment: menuAttachment }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not submit request.');
      setStatus('success');
      setMessage(`Request received. Your enquiry ID is ${result.enquiryId}.`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Could not submit request.');
    }
  };

  const waMessage = encodeURIComponent("Hi FeelsNeat! I'm interested in Dine Assist for my restaurant. I'd like to know more about the ₹999/month plan and how I can get started.");

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] relative overflow-hidden">
      <div className="morphing-blob absolute top-20 left-10 opacity-20" />
      <section className="relative pt-32 pb-20 px-4 sm:px-6 z-10">
        <div className="mx-auto max-w-5xl grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex rounded-full bg-[#E30613]/10 border border-[#E30613]/20 px-3 py-1 text-[10px] font-black text-[#E30613] uppercase tracking-widest">FeelsNeat Dine Assist</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold uppercase leading-tight">
              Your menu. Always up to date. Orders from the table.
            </h1>
            <p className="text-sm sm:text-base text-[#F4F4F5]/85 leading-relaxed font-semibold">
              Give your customers a simple way to check today's menu and place orders directly from their table. No app required.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#get-started" className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] px-6 text-xs font-black uppercase tracking-wider text-white hover:bg-white hover:text-black transition-colors">Get Started</a>
              <a href={`https://wa.me/${whatsappNumber}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 text-xs font-black uppercase tracking-wider hover:bg-white/10 transition-colors">Talk to FeelsNeat</a>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E0E12] shadow-2xl aspect-[4/3]">
              <img
                src="/images/dine-assist/customer-qr-menu.png"
                alt="Restaurant customers using a QR code to open a Dine Assist menu"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E30613]">QR Menu + Table Ordering</p>
                <p className="mt-2 text-sm font-black uppercase leading-tight">Scan, browse, order, and let the restaurant confirm.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-y border-white/5 bg-[#0D0D10] px-4 sm:px-6">
        <div className="mx-auto max-w-5xl grid md:grid-cols-4 gap-5">
          {[
            ['Live Menu', 'Update item availability whenever something sells out.'],
            ['Table Ordering', 'Customers can order without waiting for a server.'],
            ['Order Dashboard', 'All orders appear in one simple restaurant dashboard.'],
            ['Table QR', 'Every table gets its own QR URL.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl border border-white/5 bg-[#0E0E12] p-5">
              <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
              <p className="mt-3 text-xs text-[#F4F4F5]/70 leading-relaxed font-semibold">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-[#0A0A0C]">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black uppercase">Built for the whole restaurant flow</h2>
            <p className="mt-3 text-sm text-[#F4F4F5]/70 leading-relaxed font-semibold">
              Dine Assist covers the customer table experience, the restaurant order dashboard, and the live order status workflow.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {dineImages.map((image) => (
              <article key={image.src} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0E0E12]">
                <div className="aspect-[4/3] overflow-hidden bg-black">
                  <img src={image.src} alt={image.alt} className="h-full w-full object-cover transition-transform duration-500 hover:scale-102" />
                </div>
                <div className="p-5">
                  <h3 className="text-xs font-black uppercase tracking-widest">{image.title}</h3>
                  <p className="mt-3 text-xs text-[#F4F4F5]/70 leading-relaxed font-semibold">{image.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-black uppercase">₹999 / month</h2>
            <p className="text-sm text-[#F4F4F5]/75 leading-relaxed font-semibold">
              Includes hosted digital menu, restaurant menu management, availability control, table-based ordering, restaurant dashboard, order confirmation workflow, table-specific QR URLs, QR generation, standard Dine Assist design, and FeelsNeat hosting.
            </p>
            <p className="text-xs text-[#F4F4F5]/55 font-bold uppercase tracking-wider">
              Physical QR table stands are available separately based on the number of tables required.
            </p>
          </div>
          <form id="get-started" onSubmit={submit} className="lg:col-span-7 rounded-2xl border border-white/10 bg-white text-black p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-black uppercase">Get Started With Dine Assist</h2>
              <p className="mt-2 text-xs text-zinc-500 font-semibold leading-relaxed">Tell us a little about your restaurant and how you'd like to use Dine Assist. We'll review your requirements and contact you for the next steps.</p>
            </div>
            {message && <div className={`rounded-lg p-3 text-xs font-bold ${status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Restaurant name" name="restaurant_name" value={formData.restaurant_name} onChange={handleTextChange} required />
              <Field label="Location" name="location" value={formData.location} onChange={handleTextChange} required />
              <Field label="Contact person" name="contact_person" value={formData.contact_person} onChange={handleTextChange} required />
              <Field label="Phone number" name="phone" value={formData.phone} onChange={handleTextChange} required type="tel" />
              <Field label="WhatsApp number" name="whatsapp" value={formData.whatsapp} onChange={handleTextChange} required type="tel" />
              <Field label="Email" name="email" value={formData.email} onChange={handleTextChange} type="email" />
              <Field label="Number of tables" name="table_count" value={formData.table_count} onChange={handleTextChange} required type="number" />
              <Field label="Number of stands" name="qr_stands_required" value={formData.qr_stands_required} onChange={handleTextChange} type="number" />
            </div>
            <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-5 text-center relative">
              <LucideIcon name="UploadCloud" className="h-6 w-6 mx-auto text-zinc-400 mb-2" />
              <p className="text-xs font-black uppercase">Upload current menu</p>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1">You can upload a photo, PDF, or existing menu. We can help configure your initial menu during onboarding.</p>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleMenuUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              {menuAttachment && <p className="mt-3 text-[10px] font-bold text-[#E30613] truncate">{menuAttachment.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">Additional requirements</label>
              <textarea name="additional_requirements" rows={4} value={formData.additional_requirements} onChange={handleTextChange} className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-xs focus:outline-none focus:border-[#E30613]" placeholder="Tell us anything else you'd like us to know about your restaurant or ordering requirements." />
            </div>
            <button disabled={status === 'submitting'} className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#E30613] px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-black disabled:opacity-60 transition-colors">
              {status === 'submitting' ? 'Sending...' : 'Send Request'}
            </button>
            {status === 'success' && (
              <a href={`https://wa.me/${whatsappNumber}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" className="block text-center text-[10px] font-black uppercase tracking-widest text-[#E30613] hover:text-black">
                Talk to FeelsNeat on WhatsApp
              </a>
            )}
            <Link href="/dine-admin" className="block text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black">Restaurant portal</Link>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({ label, name, value, onChange, required, type = 'text' }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest mb-2">{label} {required && <span className="text-[#E30613]">*</span>}</label>
      <input name={name} value={value} onChange={onChange} required={required} type={type} className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-xs focus:outline-none focus:border-[#E30613]" />
    </div>
  );
}
