'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

const STEPS = [
  { step: 1, title: 'Product Details' },
  { step: 2, title: 'NFC Destination' },
  { step: 3, title: 'Contact & Submit' },
];

export default function CreateTapTilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Customizer form values
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    product_type: 'magnet', // 'magnet' | 'keychain'
    custom_text: '',
    design_style: 'minimal', // 'retro' | 'modern' | 'minimal' | 'vintage' | 'funny'
    nfc_dest_type: 'spotify_song', // 'spotify_song' | 'spotify_playlist' | 'youtube' | 'google_photos' | 'website'
    nfc_url: '',
    quantity: 1,
    instructions: '',
    photo_filename: ''
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOptionSelect = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.nfc_url) {
        setErrorMsg('Please specify the destination link for the NFC tag.');
        return;
      }
      setErrorMsg('');
      setCurrentStep(3);
    }
  };

  const handleStepBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email) {
      setErrorMsg('Please specify your name and email address.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    // Simulate submission delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Something went wrong processing your order. Please try again.');
    }
  };

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] relative overflow-hidden py-24 sm:py-32">
      {/* Background blobs */}
      <div className="morphing-blob absolute top-10 left-5 opacity-20" />
      <div className="morphing-blob absolute bottom-20 right-5 opacity-15" />

      <div className="mx-auto max-w-xl px-4 sm:px-6 relative z-10">
        {/* Breadcrumbs link */}
        <div className="mb-8 text-left">
          <Link
            href="/tap-tiles"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F4F4F5]/60 hover:text-[#E30613] transition-colors"
          >
            <LucideIcon name="ArrowLeft" className="h-3 w-3" /> Back to Tap Tiles
          </Link>
        </div>

        {/* Step Indicator Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full select-none">
            {STEPS.map((s) => (
              <div key={s.step} className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-black font-mono h-4 w-4 rounded-full flex items-center justify-center ${
                    currentStep === s.step
                      ? 'bg-[#E30613] text-white'
                      : currentStep > s.step
                      ? 'bg-zinc-700 text-zinc-300'
                      : 'bg-white/10 text-zinc-500'
                  }`}
                >
                  {s.step}
                </span>
                {s.step < STEPS.length && <span className="text-[10px] text-zinc-650">/</span>}
              </div>
            ))}
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Customize Your Tap Tile
          </h1>
          <p className="text-xs text-[#F4F4F5]/60 font-semibold uppercase tracking-wider mt-1">
            {STEPS[currentStep - 1].title}
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-zinc-200/80">
          {status === 'success' ? (
            <div className="text-center py-10 space-y-5 animate-fade-in text-black">
              <div className="h-12 w-12 rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] flex items-center justify-center mx-auto">
                <LucideIcon name="Check" className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black uppercase text-black">Order Design Received!</h2>
              <div className="text-xs text-zinc-600 font-medium leading-relaxed max-w-sm mx-auto space-y-4">
                <p>
                  Thank you for configuring your Tap Tile, **{formData.customer_name}**! We have captured your specifications.
                </p>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-150 text-left space-y-2.5 text-zinc-800">
                  <p><span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider block">Product Format</span> {formData.product_type === 'magnet' ? 'Fridge Magnet Version' : 'Collectible Keychain Version'}</p>
                  <p><span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider block">Design Style</span> {formData.design_style.toUpperCase()}</p>
                  <p><span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider block">NFC Destination Link</span> <code className="break-all text-[10px] font-mono text-[#E30613]">{formData.nfc_url}</code></p>
                </div>
                <p>
                  Since payments and final confirmations are handled manually, please click below to send these details to our coordination team.
                </p>
              </div>
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(
                  `Hi FeelsNeat! I just configured a Tap Tile (${formData.product_type === 'magnet' ? 'Magnet' : 'Keychain'}) in ${formData.design_style} style. Please send final checkout instructions for ${formData.customer_email}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-black text-white px-6 text-xs font-black uppercase tracking-wider transition-colors duration-300 shadow-md cursor-pointer"
              >
                Send Specifications
              </a>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-800 flex items-center gap-2 select-none">
                  <LucideIcon name="AlertTriangle" className="h-4 w-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: PRODUCT SELECTION */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in text-left">
                  {/* Form factor type */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">Select Format</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleOptionSelect('product_type', 'magnet')}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          formData.product_type === 'magnet'
                            ? 'border-[#E30613] bg-red-50/10'
                            : 'border-zinc-200 bg-white hover:bg-zinc-50'
                        }`}
                      >
                        <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Fridge Magnet</span>
                        <h4 className="text-xs font-bold uppercase text-black">Magnet Version</h4>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleOptionSelect('product_type', 'keychain')}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          formData.product_type === 'keychain'
                            ? 'border-[#E30613] bg-red-50/10'
                            : 'border-zinc-200 bg-white hover:bg-zinc-50'
                        }`}
                      >
                        <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Art Keychain</span>
                        <h4 className="text-xs font-bold uppercase text-black">Keychain Version</h4>
                      </button>
                    </div>
                  </div>

                  {/* Design style selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">Visual Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['minimal', 'retro', 'modern', 'vintage', 'funny'].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => handleOptionSelect('design_style', style)}
                          className={`py-2 rounded-lg border text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            formData.design_style === style
                              ? 'border-[#E30613] bg-[#E30613] text-white shadow-sm'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text personalization */}
                  <div>
                    <label htmlFor="custom_text" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                      Custom Text / Quote (Optional)
                    </label>
                    <input
                      type="text"
                      id="custom_text"
                      name="custom_text"
                      maxLength={40}
                      value={formData.custom_text}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                      placeholder="e.g. You + Me, Since 2023"
                    />
                    <div className="text-[10px] text-zinc-400 font-medium text-right mt-1.5 uppercase">
                      {formData.custom_text.length}/40 characters
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LINK & PHOTO */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in text-left">
                  {/* Link type selectors */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest font-sans">NFC Destination Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'spotify_song', label: 'Spotify Song' },
                        { id: 'spotify_playlist', label: 'Playlist' },
                        { id: 'youtube', label: 'YouTube' },
                        { id: 'google_photos', label: 'Photos Album' },
                        { id: 'website', label: 'Website' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleOptionSelect('nfc_dest_type', item.id)}
                          className={`py-2 rounded-lg border text-center text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            formData.nfc_dest_type === item.id
                              ? 'border-black bg-black text-white'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Destination link input */}
                  <div>
                    <label htmlFor="nfc_url" className="block text-xs font-black text-black mb-2 uppercase tracking-widest font-sans">
                      Target Link Destination URL <span className="text-[#E30613]">*</span>
                    </label>
                    <input
                      type="url"
                      id="nfc_url"
                      name="nfc_url"
                      required
                      value={formData.nfc_url}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                      placeholder="Paste Spotify code, Google Photos link, or URL..."
                    />
                  </div>

                  {/* Photo upload placeholder selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">Upload Photo / Artwork</label>
                    <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center bg-zinc-50/50 relative hover:border-zinc-300 transition-colors">
                      <LucideIcon name="Feather" className="h-6 w-6 text-zinc-400 mx-auto mb-2" />
                      <span className="block text-xs font-bold text-zinc-600 uppercase">Select Art/Photo Print file</span>
                      <span className="block text-[10px] text-zinc-400 mt-1 font-semibold">JPG or PNG formats (Max 15MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData((prev) => ({ ...prev, photo_filename: file.name }));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {formData.photo_filename && (
                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs text-zinc-800 font-semibold select-none">
                        <span className="truncate max-w-[200px]">{formData.photo_filename}</span>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, photo_filename: '' }))}
                          className="text-[#E30613] hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT & SUMMARY */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in text-left text-black">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="customer_name" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                        Full Name <span className="text-[#E30613]">*</span>
                      </label>
                      <input
                        type="text"
                        id="customer_name"
                        name="customer_name"
                        required
                        value={formData.customer_name}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                        placeholder="Name for coordination"
                      />
                    </div>

                    <div>
                      <label htmlFor="customer_email" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                        Email Address <span className="text-[#E30613]">*</span>
                      </label>
                      <input
                        type="email"
                        id="customer_email"
                        name="customer_email"
                        required
                        value={formData.customer_email}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                        placeholder="email@example.com"
                      />
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <label className="block text-xs font-black text-black uppercase tracking-widest">Quantity</label>
                        <p className="text-[10px] text-zinc-450 font-bold uppercase mt-0.5">Quantity of identical tiles</p>
                      </div>
                      
                      <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden h-9 bg-white">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                          className="px-3 text-zinc-500 hover:bg-zinc-50 h-full font-bold transition-colors cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="px-4 text-xs font-black text-black">{formData.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, quantity: prev.quantity + 1 }))}
                          className="px-3 text-zinc-500 hover:bg-zinc-50 h-full font-bold transition-colors cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Extra Instructions */}
                    <div>
                      <label htmlFor="instructions" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                        Special requests or alignment instructions
                      </label>
                      <textarea
                        id="instructions"
                        name="instructions"
                        rows={2}
                        value={formData.instructions}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                        placeholder="Specify color alignments, sizing notes, or placement notes..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS FOOTER */}
              <div className="pt-6 border-t border-zinc-150 flex gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleStepBack}
                    disabled={status === 'submitting'}
                    className="flex-1 inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-black uppercase text-zinc-700 tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Back
                  </button>
                )}
                
                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleStepNext}
                    className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-950 text-xs font-black uppercase text-white tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-black hover:bg-zinc-900 text-xs font-black uppercase text-white tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {status === 'submitting' ? 'Submitting...' : 'Register Design'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
