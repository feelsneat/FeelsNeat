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
    <div className="w-full rounded-xl border border-border-custom bg-background p-6 shadow-xs relative overflow-hidden transition-all duration-300">
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background mb-5">
            <LucideIcon name="Check" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-2">Message Sent</h3>
          <p className="text-xs text-foreground/70 max-w-xs leading-relaxed">
            Thank you for reaching out. We will read your message and reply within one business day.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 text-xs font-bold text-foreground hover:underline cursor-pointer"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
          {status === 'error' && (
            <div className="rounded-lg bg-red-50/50 border border-red-200 p-4 text-xs text-red-800 flex gap-2 items-center">
              <LucideIcon name="AlertCircle" className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-xs font-bold text-foreground/80 mb-2 uppercase tracking-wide">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={status === 'submitting'}
              className="w-full rounded-lg border border-border-custom bg-white px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none transition-colors disabled:opacity-50"
              placeholder="Your name"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-foreground/80 mb-2 uppercase tracking-wide">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={status === 'submitting'}
                className="w-full rounded-lg border border-border-custom bg-white px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none transition-colors disabled:opacity-50"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-xs font-bold text-foreground/80 mb-2 uppercase tracking-wide">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={status === 'submitting'}
                className="w-full rounded-lg border border-border-custom bg-white px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-bold text-foreground/80 mb-2 uppercase tracking-wide">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              disabled={status === 'submitting'}
              className="w-full rounded-lg border border-border-custom bg-white px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none transition-colors disabled:opacity-50 resize-none leading-relaxed"
              placeholder="Tell us about your project or inquiry..."
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-foreground text-background font-bold hover:bg-accent-custom transition-colors disabled:opacity-75 gap-2 cursor-pointer text-sm shadow-xs"
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
