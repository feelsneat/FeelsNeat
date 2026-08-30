'use client';

import { useState } from 'react';
import { LucideIcon } from '../ui/LucideIcon';

interface ContactFormProps {
  whatsappNumber?: string;
}

export function ContactForm({ whatsappNumber }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setSubmittedData({ ...formData });

        // Auto-redirect to WhatsApp click-to-chat
        const waNum = whatsappNumber || '919999999999';
        const text = `Hi FeelsNeat! 👋\n\nI just submitted a contact form on your website.\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\n\nMessage:\n${formData.message}`;
        const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');

        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMsg('A network error occurred. Please check your connection.');
    }
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xs relative overflow-hidden transition-all duration-300">
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] mb-5">
            <LucideIcon name="Check" className="h-5 w-5" />
          </div>
          <h3 className="text-base font-black text-[#000000] uppercase tracking-tight mb-2">Message Sent</h3>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed font-bold uppercase mb-6">
            Thank you for reaching out. We have received your message.
          </p>

          {submittedData && (
            <a
              href={`https://wa.me/${whatsappNumber || '919999999999'}?text=${encodeURIComponent(
                `Hi FeelsNeat! 👋\n\nI just submitted a contact form on your website.\n\nName: ${submittedData.name}\nEmail: ${submittedData.email}\nPhone: ${submittedData.phone || 'N/A'}\n\nMessage:\n${submittedData.message}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#E30613] hover:bg-zinc-950 text-xs font-black uppercase tracking-wider text-white px-6 transition-colors duration-300 shadow-md cursor-pointer mb-6"
            >
              Continue on WhatsApp <LucideIcon name="ArrowRight" className="h-4 w-4" />
            </a>
          )}

          <button
            onClick={() => setStatus('idle')}
            className="text-xs font-black uppercase text-[#E30613] hover:underline cursor-pointer"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          {status === 'error' && (
            <div className="rounded bg-rose-50/50 border border-rose-200 p-4 text-xs text-rose-855 flex gap-2 items-center">
              <LucideIcon name="AlertCircle" className="h-4.5 w-4.5 shrink-0 text-[#E30613]" />
              <span className="text-[#E30613] font-bold">{errorMsg}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-[10px] font-black text-[#000000] mb-2 uppercase tracking-widest">
              Name <span className="text-[#E30613]">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={status === 'submitting'}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#000000] placeholder-zinc-400 focus:border-[#E30613] focus:outline-none transition-colors disabled:opacity-50"
              placeholder="Your name"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-[#000000] mb-2 uppercase tracking-widest">
                Email Address <span className="text-[#E30613]">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={status === 'submitting'}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#000000] placeholder-zinc-400 focus:border-[#E30613] focus:outline-none transition-colors disabled:opacity-50"
                placeholder="name@domain.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-[10px] font-black text-[#000000] mb-2 uppercase tracking-widest">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={status === 'submitting'}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#000000] placeholder-zinc-400 focus:border-[#E30613] focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-[10px] font-black text-[#000000] mb-2 uppercase tracking-widest">
              Message <span className="text-[#E30613]">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              disabled={status === 'submitting'}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#000000] placeholder-zinc-400 focus:border-[#E30613] focus:outline-none transition-colors disabled:opacity-50 resize-none leading-relaxed"
              placeholder="Tell us about your project or inquiry..."
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#000000] text-[#FFFFFF] font-black uppercase tracking-wider text-xs hover:bg-[#E30613] hover:text-[#FFFFFF] transition-all duration-300 disabled:opacity-75 gap-2 cursor-pointer shadow-sm"
          >
            {status === 'submitting' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending Message...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
