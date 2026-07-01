'use client';

import { useState } from 'react';
import { LucideIcon } from '../ui/LucideIcon';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
        setFormData({ name: '', email: '', company: '', message: '' });
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
        <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-custom/5 border border-accent-custom text-accent-custom mb-5">
            <LucideIcon name="Check" className="h-5 w-5" />
          </div>
          <h3 className="text-base font-black text-foreground uppercase tracking-tight mb-2">Message Sent</h3>
          <p className="text-xs text-neutral-gray max-w-xs leading-relaxed">
            Thank you for reaching out. We will read your message and reply within one business day.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 text-xs font-black uppercase text-accent-custom hover:underline cursor-pointer"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          {status === 'error' && (
            <div className="rounded bg-rose-50/50 border border-rose-200 p-4 text-xs text-rose-800 flex gap-2 items-center">
              <LucideIcon name="AlertCircle" className="h-4.5 w-4.5 shrink-0 text-accent-custom" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-[10px] font-black text-foreground mb-2 uppercase tracking-widest">
              Name <span className="text-accent-custom">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={status === 'submitting'}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-foreground focus:border-accent-custom focus:outline-none transition-colors disabled:opacity-50"
              placeholder="Your name"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-foreground mb-2 uppercase tracking-widest">
                Email Address <span className="text-accent-custom">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={status === 'submitting'}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-foreground focus:border-accent-custom focus:outline-none transition-colors disabled:opacity-50"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-[10px] font-black text-foreground mb-2 uppercase tracking-widest">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={status === 'submitting'}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-foreground focus:border-accent-custom focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-[10px] font-black text-foreground mb-2 uppercase tracking-widest">
              Message <span className="text-accent-custom">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              disabled={status === 'submitting'}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-foreground focus:border-accent-custom focus:outline-none transition-colors disabled:opacity-50 resize-none leading-relaxed"
              placeholder="Tell us about your project or inquiry..."
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-foreground text-background font-black uppercase tracking-wider text-xs hover:bg-accent-custom transition-all duration-300 disabled:opacity-75 gap-2 cursor-pointer shadow-sm"
          >
            {status === 'submitting' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
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
