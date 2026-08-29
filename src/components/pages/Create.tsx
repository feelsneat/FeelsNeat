'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { PRODUCT_PRICES } from './Memories';

// Digital Products Data
const DIGITAL_PRODUCTS: Record<string, { title: string; price: string; description: string; features: string[] }> = {
  'ats-resume': {
    title: 'ATS Tech Resume Template',
    price: '$19.00',
    description: 'A modern, single-page, ATS-friendly LaTeX & PDF resume layout built with clean grids and dynamic content builders.',
    features: ['ATS Scanner Optimized Formatting', 'Modern Single-Page Layout Grid', 'Action Verb Sentence Builders', 'LaTeX / PDF Export Guide']
  },
  'side-hustle-bookkeeping': {
    title: 'Side-Hustle Bookkeeping Sheet',
    price: '$15.00',
    description: 'An automated expense and income log with pre-built profit & loss graphs, currency selectors, and invoicing logs.',
    features: ['Automated Expense Charting', 'Visual Profit & Loss Graphs', 'Etsy & Stripe Invoice Import Log', 'Multi-currency Conversion Engine']
  },
  'life-dashboard': {
    title: 'All-in-One Life Dashboard',
    price: '$24.00',
    description: 'A comprehensive Notion template for daily tracking, habit logging, finance manager, and ADHD-friendly scheduling.',
    features: ['Daily Habit Tracker & Log', 'Weekly Planner & Goals Board', 'ADHD-friendly Visual Schedule', 'Clean Life Compass Wheel']
  },
  'creator-os': {
    title: 'TikTok Creator OS',
    price: '$29.00',
    description: 'A dedicated content organizer built in Notion to manage scripts, sponsorship deals, media packages, and publication pipelines.',
    features: ['Visual Workspace Manager', 'Content Planning Pipeline', 'Asset Library & Repository', 'Revenue & Sponsorship Tracker']
  }
};

// Services Data
const SERVICES: Record<string, { title: string; description: string }> = {
  'website-development': {
    title: 'Social Media-to-Store Development',
    description: 'Instagram shopping catalogs and checkout configurations with automated order routing, WhatsApp, payment gateways, and custom CMS builders.',
  },
  'security-review': {
    title: 'Security Review',
    description: 'Manual security audits of your web server configurations, API keys, hosting environments, and data records compliance.',
  },
  'ai-integration': {
    title: 'AI Agentic Integration',
    description: 'Integrations of LLM customer support, order verification, and follow-up email automations tailored directly to your CRM.',
  }
};

export default function CreateMemoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialType = searchParams.get('type') || '';
  const productId = searchParams.get('product') || '';
  const serviceId = searchParams.get('service') || '';

  // Determine current checkout mode
  let order_type: 'memories' | 'digital_product' | 'service' | 'tap_tiles' = 'memories';
  let targetProduct = null;
  let targetService = null;

  if (initialType === 'tap_tiles') {
    order_type = 'tap_tiles';
  } else if (productId && DIGITAL_PRODUCTS[productId]) {
    order_type = 'digital_product';
    targetProduct = DIGITAL_PRODUCTS[productId];
  } else if (serviceId && SERVICES[serviceId]) {
    order_type = 'service';
    targetService = SERVICES[serviceId];
  }

  // Set steps list dynamically based on mode
  const STEPS = order_type === 'memories'
    ? [
        { id: 1, label: 'Memory' },
        { id: 2, label: 'Product' },
        { id: 3, label: 'Photos' },
        { id: 4, label: 'Album' },
        { id: 5, label: 'Details' },
        { id: 6, label: 'Review' },
      ]
    : order_type === 'tap_tiles'
    ? [
        { id: 1, label: 'Customization' },
        { id: 2, label: 'NFC Link' },
        { id: 3, label: 'Photos' },
        { id: 4, label: 'Delivery' },
        { id: 5, label: 'Review' },
      ]
    : [
        { id: 1, label: 'Configure' },
        { id: 2, label: 'Contact' },
        { id: 3, label: 'Review' },
      ];

  const [currentStep, setCurrentStep] = useState(1);

  // Main order customization state
  const [formData, setFormData] = useState({
    memory_type: initialType === 'tap_tiles' ? 'minimal' : (initialType || 'travel'),
    size: initialType === 'tap_tiles' ? (searchParams.get('format') || 'magnet') : 'standard',
    quantity: 1,
    google_photos_url: '',
    title: '',
    location: '',
    date: '',
    caption: '',
    design_notes: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',

    // Website Development fields
    instagram_page: '',
    platform_preference: '',
    needs_whatsapp: false,
    needs_payment: false,
    needs_cms: false,
    needs_notifications: false,
    
    // Security Review fields
    audit_url: '',
    hosting_provider: '',
    compliance_needs: '',
    main_concerns: '',

    // AI Agentic Integration fields
    pipeline_platform: '',
    agent_needs_support: false,
    agent_needs_orders: false,
    agent_needs_emails: false,
    agent_llm_vendor: 'no-preference',
  });

  // Photo uploads state (base64 stored in-memory, excluded from localStorage autosave)
  const [mainPhoto, setMainPhoto] = useState<string | null>(null);
  const [mainPhotoName, setMainPhotoName] = useState<string>('');
  const [additionalPhotos, setAdditionalPhotos] = useState<Array<{ name: string; data: string }>>([]);

  // Form submission / validation states
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // 1. Load autosaved form state from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('feelsneat_memories_draft');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Could not restore draft state:', e);
    }
  }, []);

  // 2. Autosave form state text inputs to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('feelsneat_memories_draft', JSON.stringify(formData));
    } catch (e) {
      // Ignore
    }
  }, [formData]);

  // Handle textual changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 3 file reader handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // File size safety boundary: max 12MB
    if (file.size > 12 * 1024 * 1024) {
      setValidationError('File is too large. Please select an image under 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      if (isMain) {
        setMainPhoto(base64Str);
        setMainPhotoName(file.name);
      } else {
        setAdditionalPhotos((prev) => [...prev, { name: file.name, data: base64Str }]);
      }
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeAdditionalPhoto = (idx: number) => {
    setAdditionalPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper validate checks for moving between steps
  const validateStep = (step: number): boolean => {
    setValidationError(null);

    if (order_type === 'memories') {
      if (step === 1) {
        if (!formData.memory_type) {
          setValidationError('Please select a memory type.');
          return false;
        }
      }
      if (step === 2) {
        if (!formData.size) {
          setValidationError('Please select a canvas size.');
          return false;
        }
      }
      if (step === 3) {
        if (!mainPhoto) {
          setValidationError('Please upload a print photo for your memory canvas.');
          return false;
        }
      }
      if (step === 4) {
        if (!formData.google_photos_url) {
          setValidationError('Please enter a Google Photos shared album URL.');
          return false;
        }
        const photosUrlRegex = /^(https?:\/\/)?(www\.)?(photos\.app\.goo\.gl|photos\.google\.com)\/.+$/;
        if (!photosUrlRegex.test(formData.google_photos_url)) {
          setValidationError('Invalid Google Photos shared album URL format.');
          return false;
        }
      }
      if (step === 6) {
        if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
          setValidationError('Please fill in your contact details.');
          return false;
        }
        if (!formData.address_line || !formData.city || !formData.state || !formData.pincode) {
          setValidationError('Please fill in your complete delivery address details.');
          return false;
        }
      }
    } else if (order_type === 'service') {
      if (step === 1) {
        if (serviceId === 'website-development' && !formData.instagram_page) {
          setValidationError('Please enter your Instagram Page link / Catalog URL.');
          return false;
        }
        if (serviceId === 'security-review') {
          if (!formData.audit_url) {
            setValidationError('Please enter the website URL to audit.');
            return false;
          }
          if (!formData.hosting_provider) {
            setValidationError('Please enter your hosting provider / tech stack.');
            return false;
          }
        }
        if (serviceId === 'ai-integration' && !formData.pipeline_platform) {
          setValidationError('Please enter your order/purchase platform details.');
          return false;
        }
      }
      if (step === 2) {
        if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
          setValidationError('Please fill in your contact details.');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.customer_email)) {
          setValidationError('Invalid email address format.');
          return false;
        }
        const phoneRegex = /^[6-9]\d{9}$|^[+]\d{1,4}\d{9,10}$/;
        if (!phoneRegex.test(formData.customer_phone.replace(/[\s-]/g, ''))) {
          setValidationError('Invalid phone number format.');
          return false;
        }
      }
      if (step === 2) {
        if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
          setValidationError('Please fill in your contact information.');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.customer_email)) {
          setValidationError('Invalid email address format.');
          return false;
        }
        const phoneRegex = /^[6-9]\d{9}$|^[+]\d{1,4}\d{9,10}$/;
        if (!phoneRegex.test(formData.customer_phone.replace(/[\s-]/g, ''))) {
          setValidationError('Invalid phone number format.');
          return false;
        }
      }
    } else if (order_type === 'tap_tiles') {
      if (step === 1) {
        if (!formData.size) {
          setValidationError('Please select a format type.');
          return false;
        }
        if (!formData.memory_type) {
          setValidationError('Please select a visual style.');
          return false;
        }
      }
      if (step === 2) {
        if (!formData.google_photos_url) {
          setValidationError('Please enter a target link destination.');
          return false;
        }
      }
      if (step === 3) {
        if (!mainPhoto) {
          setValidationError('Please upload your print photo or artwork file.');
          return false;
        }
      }
      if (step === 4) {
        if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
          setValidationError('Please fill in your contact details.');
          return false;
        }
        if (!formData.address_line || !formData.city || !formData.state || !formData.pincode) {
          setValidationError('Please fill in your complete delivery address details.');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.customer_email)) {
          setValidationError('Invalid email address format.');
          return false;
        }
        const phoneRegex = /^[6-9]\d{9}$|^[+]\d{1,4}\d{9,10}$/;
        if (!phoneRegex.test(formData.customer_phone.replace(/[\s-]/g, ''))) {
          setValidationError('Invalid phone number format.');
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalStep = STEPS.length;
    if (!validateStep(finalStep)) return;

    setStatus('submitting');
    setValidationError(null);

    const payload = (order_type === 'memories' || order_type === 'tap_tiles')
      ? {
          order_type,
          product_id: productId || null,
          ...formData,
          main_photo: mainPhoto,
          additional_photos: additionalPhotos.map((p) => p.data),
        }
      : {
          order_type,
          product_id: order_type === 'digital_product' ? productId : serviceId,
          quantity: formData.quantity,
          design_notes: formData.design_notes,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          
          // Service configuration parameters
          instagram_page: formData.instagram_page,
          platform_preference: formData.platform_preference,
          needs_whatsapp: formData.needs_whatsapp,
          needs_payment: formData.needs_payment,
          needs_cms: formData.needs_cms,
          needs_notifications: formData.needs_notifications,
          audit_url: formData.audit_url,
          hosting_provider: formData.hosting_provider,
          compliance_needs: formData.compliance_needs,
          main_concerns: formData.main_concerns,
          pipeline_platform: formData.pipeline_platform,
          agent_needs_support: formData.agent_needs_support,
          agent_needs_orders: formData.agent_needs_orders,
          agent_needs_emails: formData.agent_needs_emails,
          agent_llm_vendor: formData.agent_llm_vendor,
        };

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        localStorage.removeItem('feelsneat_memories_draft');
        router.push(`/confirmation?orderId=${result.orderId}`);
      } else {
        setStatus('error');
        setValidationError(result.error || 'Failed to submit order. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setValidationError('A network error occurred. Please check your connection.');
    }
  };

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#000000] py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background blobs */}
      <div className="morphing-blob absolute top-10 left-10 opacity-20" />
      <div className="morphing-blob absolute bottom-20 right-10 opacity-15" />

      {/* Outer form boundaries card layout */}
      <div className="w-full max-w-xl bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-6 sm:p-10 relative z-10 text-left transition-all duration-300">
        
        {/* PROGRESS STEP BAR HEADER */}
        <div className="mb-8 border-b border-zinc-100 pb-4">
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
            <span>Step {currentStep} of {STEPS.length}</span>
            <span className="text-[#E30613]">{STEPS[currentStep - 1].label}</span>
          </div>
          
          {/* Visual track line bar */}
          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden flex">
            {STEPS.map((step) => (
              <div 
                key={step.id} 
                className={`h-full flex-1 transition-all duration-300 ${
                  step.id <= currentStep ? 'bg-[#E30613]' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* VALIDATION ERROR INDICATOR */}
        {validationError && (
          <div className="mb-6 rounded-lg bg-rose-50/80 border border-rose-200 p-4 text-xs text-[#E30613] flex gap-2.5 items-center animate-fade-in">
            <LucideIcon name="AlertCircle" className="h-4.5 w-4.5 shrink-0" />
            <span className="font-bold">{validationError}</span>
          </div>
        )}

        {/* STEP CONTROLLERS RENDERING */}
        <form onSubmit={handleOrderSubmit} className="space-y-6">
          
          {/* =========================================================================
              MEMORIES WIZARD FLOW (6 STEPS)
              ========================================================================= */}
          {order_type === 'memories' && (
            <>
              {/* STEP 1: CHOOSE YOUR MEMORY */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">What kind of memory are you creating?</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Select the theme that maps to your photo collection</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'travel', label: 'Travel', icon: 'Globe' },
                      { id: 'events', label: 'Wedding & Events', icon: 'PartyPopper' },
                      { id: 'couples', label: 'Couple', icon: 'Heart' },
                      { id: 'family', label: 'Family, Life & Pets', icon: 'Users' },
                      { id: 'friends', label: 'College / Friends', icon: 'GraduationCap' },
                      { id: 'birthday', label: 'Birthday', icon: 'Cake' },
                      { id: 'housewarming', label: 'Housewarming', icon: 'Home' },
                      { id: 'other', label: 'Something Else', icon: 'HelpCircle' },
                    ].map((type) => {
                      const isSelected = formData.memory_type === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, memory_type: type.id }))}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 text-center cursor-pointer min-h-[90px] select-none ${
                            isSelected 
                              ? 'border-[#E30613] bg-[#E30613]/5 text-[#E30613]' 
                              : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                          }`}
                        >
                          <LucideIcon name={type.icon} className="h-5 w-5 mb-2 shrink-0" />
                          <span className="text-xs font-black uppercase tracking-wider">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: CHOOSE YOUR PRODUCT */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Choose your Memory Canvas</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Configure your canvas size and quantity preferences</p>
                  </div>

                  {/* Sizes Row */}
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">Select Size</label>
                    <div className="grid gap-3">
                      {[
                        { id: 'mini', label: 'Mini', dims: '4x4 inches', price: PRODUCT_PRICES.mini },
                        { id: 'standard', label: 'Standard', dims: '6x6 inches', price: PRODUCT_PRICES.standard },
                        { id: 'landscape', label: 'Landscape', dims: '8x6 inches', price: PRODUCT_PRICES.landscape },
                      ].map((size) => {
                        const isSelected = formData.size === size.id;
                        return (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, size: size.id }))}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none ${
                              isSelected 
                                ? 'border-[#E30613] bg-[#E30613]/5 text-[#E30613]' 
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            <div>
                              <h4 className="text-xs font-black uppercase">{size.label}</h4>
                              <span className="text-xs text-zinc-400 font-semibold uppercase">{size.dims}</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-500">{size.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-black text-black uppercase tracking-widest">How many pieces?</label>
                      <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Order multiple individual prints at once</p>
                    </div>
                    
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden h-10">
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
                </div>
              )}

              {/* STEP 3: UPLOAD PHOTOS */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Choose your photo</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Upload files for physical printing onto the panel</p>
                  </div>

                  {/* Main Photo File Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">
                      Photo for the canvas <span className="text-[#E30613]">*</span>
                    </label>
                    
                    {!mainPhoto ? (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl p-8 hover:border-zinc-300 transition-colors cursor-pointer bg-zinc-50/50">
                        <LucideIcon name="UploadCloud" className="h-8 w-8 text-zinc-400 mb-2" />
                        <span className="text-xs font-bold text-zinc-600 uppercase">Select Print Photo</span>
                        <span className="text-xs text-zinc-400 mt-1.5 font-semibold">JPG, PNG, or WEBP (Max 12MB)</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handlePhotoUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-200 aspect-[16/10] bg-zinc-100 flex items-center justify-center">
                        <img
                          src={mainPhoto}
                          alt="Uploaded print canvas preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setMainPhoto(null); setMainPhotoName(''); }}
                            className="bg-black/60 border border-white/20 text-white rounded-full p-1.5 hover:bg-black transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <LucideIcon name="Trash" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-semibold p-1.5 truncate uppercase tracking-wider text-center">
                          {mainPhotoName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Additional Photos */}
                  <div className="space-y-3 pt-4 border-t border-zinc-100">
                    <div>
                      <label className="block text-xs font-black text-black uppercase tracking-widest">Additional Photos</label>
                      <p className="text-xs text-zinc-400 font-semibold mt-0.5">Upload a few alternatives if you want us to help choose the best one</p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {additionalPhotos.map((photo, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border border-zinc-200 aspect-square bg-zinc-100">
                          <img
                            src={photo.data}
                            alt={`Additional alternative preview ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalPhoto(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black transition-colors cursor-pointer"
                          >
                            <LucideIcon name="X" className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}

                      {additionalPhotos.length < 4 && (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg aspect-square hover:border-zinc-300 transition-colors cursor-pointer bg-zinc-50/50">
                          <LucideIcon name="Plus" className="h-4 w-4 text-zinc-400" />
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handlePhotoUpload(e, false)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: GOOGLE PHOTOS ALBUM */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Connect your memories</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Provide the link that the physical NFC tag will launch</p>
                  </div>

                  <div>
                    <label htmlFor="google_photos_url" className="block text-xs font-black text-[#000000] mb-2 uppercase tracking-widest">
                      Google Photos shared album link <span className="text-[#E30613]">*</span>
                    </label>
                    <input
                      type="url"
                      id="google_photos_url"
                      name="google_photos_url"
                      required
                      value={formData.google_photos_url}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#000000] placeholder-zinc-400 focus:border-[#E30613] focus:outline-none transition-colors"
                      placeholder="https://photos.app.goo.gl/..."
                    />
                  </div>

                  {/* Instructions and Help Link */}
                  <div className="rounded-lg bg-zinc-50 p-4 space-y-3 border border-zinc-150">
                    <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                      Create an album in Google Photos, select **Share**, enable **Link Sharing**, and copy the shared link here. We program the hidden NFC sticker on the back of your frame with this URL.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-sm font-black uppercase text-[#E30613] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <LucideIcon name="HelpCircle" className="h-4 w-4" /> How to get your Google Photos link
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: TELL US ABOUT THE MEMORY */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Tell us about the memory</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Provide design instructions and helper context for our team</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Memory Title (Optional)</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                        placeholder="e.g. Goa Trip"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Location (Optional)</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                        placeholder="e.g. Goa, India"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Date / Year (Optional)</label>
                    <input
                      type="text"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                      placeholder="e.g. November 2026"
                    />
                  </div>

                  <div>
                    <label htmlFor="caption" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Short Caption (Optional)</label>
                    <input
                      type="text"
                      id="caption"
                      name="caption"
                      value={formData.caption}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                      placeholder="e.g. The trip we'll always talk about"
                    />
                  </div>

                  <div>
                    <label htmlFor="design_notes" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Design Preferences (Optional)</label>
                    <textarea
                      id="design_notes"
                      name="design_notes"
                      rows={3}
                      value={formData.design_notes}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                      placeholder="e.g. Minimal, warm colors, no large text"
                    />
                    <span className="text-xs text-zinc-400 font-semibold mt-1 block">Notes for our production designer. These details are not necessarily printed.</span>
                  </div>
                </div>
              )}

              {/* STEP 6: CUSTOMER INFORMATION & REVIEW */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Customer & Delivery Details</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Provide your shipping address and contact details</p>
                  </div>

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
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
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
                      <div>
                        <label htmlFor="customer_phone" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          Phone Number <span className="text-[#E30613]">*</span>
                        </label>
                        <input
                          type="tel"
                          id="customer_phone"
                          name="customer_phone"
                          required
                          value={formData.customer_phone}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address_line" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                        Delivery Address <span className="text-[#E30613]">*</span>
                      </label>
                      <input
                        type="text"
                        id="address_line"
                        name="address_line"
                        required
                        value={formData.address_line}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none mb-3"
                        placeholder="Street address, Apartment, Suite"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-xs font-black text-black mb-1 uppercase tracking-widest">City <span className="text-[#E30613]">*</span></label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs text-black focus:border-[#E30613] focus:outline-none"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-xs font-black text-black mb-1 uppercase tracking-widest">State <span className="text-[#E30613]">*</span></label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            required
                            value={formData.state}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs text-black focus:border-[#E30613] focus:outline-none"
                            placeholder="State"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <label htmlFor="pincode" className="block text-xs font-black text-black mb-1 uppercase tracking-widest">PIN Code <span className="text-[#E30613]">*</span></label>
                          <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            required
                            value={formData.pincode}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs text-black focus:border-[#E30613] focus:outline-none"
                            placeholder="PIN code"
                          />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-xs font-black text-black mb-1 uppercase tracking-widest">Country <span className="text-[#E30613]">*</span></label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            required
                            value={formData.country}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs text-black focus:border-[#E30613] focus:outline-none"
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CUSTOM CUSTOMIZATION ORDER SUMMARY BOX */}
                  <div className="pt-4 border-t border-zinc-150 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-black">Order Summary</h3>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2 text-xs font-semibold text-zinc-700 uppercase">
                      <div className="flex justify-between">
                        <span>Memory Theme:</span>
                        <span className="text-[#E30613] font-black">{formData.memory_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Product Canvas Size:</span>
                        <span className="text-black font-black">{formData.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity Pieces:</span>
                        <span className="text-black font-black">{formData.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Google Photos connection:</span>
                        <span className="text-[#E30613] font-black">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* =========================================================================
              TAP TILES WIZARD FLOW (5 STEPS)
              ========================================================================= */}
          {order_type === 'tap_tiles' && (
            <>
              {/* STEP 1: STYLE & FORMAT */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Customize your Tap Tile</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Select your preferred format, style, and optional text</p>
                  </div>

                  {/* Format selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">Select Format</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'magnet', label: 'Magnet', subtitle: 'Fridge Magnet' },
                        { id: 'keychain', label: 'Keychain', subtitle: 'Art Keychain' }
                      ].map((format) => (
                        <button
                          key={format.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, size: format.id }))}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none ${
                            formData.size === format.id
                              ? 'border-[#E30613] bg-[#E30613]/5'
                              : 'border-zinc-200 bg-white hover:bg-zinc-50'
                          }`}
                        >
                          <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">{format.subtitle}</span>
                          <h4 className="text-xs font-bold uppercase text-black">{format.label}</h4>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">Visual Direction Style</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['minimal', 'retro', 'modern', 'vintage', 'funny'].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, memory_type: style }))}
                          className={`py-2 rounded-lg border text-center text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            formData.memory_type === style
                              ? 'border-[#E30613] bg-[#E30613] text-white shadow-sm'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom overlay text */}
                  <div>
                    <label htmlFor="title" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                      Custom Overlay Text / Caption (Optional)
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      maxLength={40}
                      value={formData.title}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                      placeholder="e.g. 2008 was a personality."
                    />
                    <div className="text-[9px] text-zinc-400 font-bold text-right mt-1.5 uppercase">
                      {formData.title.length}/40 characters
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: NFC LINK */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Connect your NFC link</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Provide the URL destination programmed into the tile</p>
                  </div>

                  <div>
                    <label htmlFor="google_photos_url" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                      Destination Link URL <span className="text-[#E30613]">*</span>
                    </label>
                    <input
                      type="url"
                      id="google_photos_url"
                      name="google_photos_url"
                      required
                      value={formData.google_photos_url}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none transition-colors"
                      placeholder="Paste Spotify song, YouTube link, or website..."
                    />
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-150 text-left">
                    <p className="text-xs text-zinc-600 leading-relaxed font-semibold">
                      Provide a Spotify track/playlist link, YouTube video URL, Google Photos shared album, or custom webpage. FeelsNeat will program this link onto the NFC chip before shipping.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: PHOTO UPLOAD */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Upload your photo</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Choose the main artwork image for your tile</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">
                      Tile Artwork Photo <span className="text-[#E30613]">*</span>
                    </label>
                    
                    {!mainPhoto ? (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl p-8 hover:border-zinc-300 transition-colors cursor-pointer bg-zinc-50/50">
                        <LucideIcon name="Feather" className="h-8 w-8 text-zinc-400 mb-2 animate-pulse" />
                        <span className="text-xs font-bold text-zinc-600 uppercase">Select Tile Artwork</span>
                        <span className="text-[10px] text-zinc-400 mt-1.5 font-semibold">JPG, PNG, or WEBP (Max 12MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-200 aspect-square max-w-[240px] mx-auto bg-zinc-50">
                        <img src={mainPhoto} alt="Tile preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setMainPhoto(null); setMainPhotoName(''); }}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors cursor-pointer"
                        >
                          <LucideIcon name="X" className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-1.5 text-[9px] font-bold text-white truncate text-center select-none">
                          {mainPhotoName || 'uploaded_image.png'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: CONTACT & SHIPPING */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Delivery details</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Provide details for shipping and manual payments coordinate</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
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
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="customer_phone" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          WhatsApp Number <span className="text-[#E30613]">*</span>
                        </label>
                        <input
                          type="tel"
                          id="customer_phone"
                          name="customer_phone"
                          required
                          value={formData.customer_phone}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
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

                    <div className="border-t border-zinc-100 pt-4 space-y-4">
                      <div>
                        <label htmlFor="address_line" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          Shipping Address <span className="text-[#E30613]">*</span>
                        </label>
                        <input
                          type="text"
                          id="address_line"
                          name="address_line"
                          required
                          value={formData.address_line}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                          placeholder="Flat/House No, Building, Street"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                            City <span className="text-[#E30613]">*</span>
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                            State <span className="text-[#E30613]">*</span>
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            required
                            value={formData.state}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="pincode" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                            Pincode <span className="text-[#E30613]">*</span>
                          </label>
                          <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            required
                            value={formData.pincode}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                            placeholder="6-digit PIN code"
                          />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-500 focus:outline-none"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-black text-black uppercase tracking-widest">Quantity</label>
                        <p className="text-[10px] text-zinc-450 font-bold uppercase mt-0.5">Order multiple identical pieces</p>
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
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Review your Tap Tile</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Confirm customization details before registering design</p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-4 text-black text-xs font-semibold uppercase">
                    <div className="border-b border-zinc-200 pb-3">
                      <span className="text-[9px] font-black text-[#E30613] uppercase tracking-widest block mb-0.5">
                        Selected Niche
                      </span>
                      <span className="text-xs font-bold uppercase">
                        {productId || 'General'} Tap Tile
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 pb-3">
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Format</span>
                        <span className="font-bold text-black">{formData.size === 'magnet' ? 'Fridge Magnet' : 'Art Keychain'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Design Style</span>
                        <span className="font-bold text-black">{formData.memory_type}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Quantity</span>
                        <span className="font-bold text-black">{formData.quantity} pc</span>
                      </div>
                    </div>

                    <div className="border-b border-zinc-200 pb-3">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">NFC Destination Link</span>
                      <code className="text-[10px] font-mono break-all font-bold text-[#E30613]">{formData.google_photos_url}</code>
                    </div>

                    {formData.title && (
                      <div className="border-b border-zinc-200 pb-3">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Overlay Text</span>
                        <p className="font-semibold text-xs text-black">"{formData.title}"</p>
                      </div>
                    )}

                    <div className="border-b border-zinc-200 pb-3 space-y-1">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Delivery To</span>
                      <p className="font-bold text-black">{formData.customer_name}</p>
                      <p className="text-zinc-500 leading-relaxed font-sans font-medium text-[11px] normal-case">
                        {formData.address_line}, {formData.city}, {formData.state} - {formData.pincode}
                      </p>
                    </div>

                    {formData.design_notes && (
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Special Instructions</span>
                        <p className="text-xs text-zinc-500 italic lowercase first-letter:uppercase">"{formData.design_notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* =========================================================================
              DIGITAL PRODUCTS / SERVICES FLOW (3 STEPS)
              ========================================================================= */}
          {(order_type === 'digital_product' || order_type === 'service') && (
            <>
              {/* STEP 1: CONFIGURE & PREFERENCES */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">
                      Configure your {order_type === 'service' ? 'Service Request' : 'Digital Order'}
                    </h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">
                      Review details and specify custom preferences
                    </p>
                  </div>

                  {/* Product/Service Details Card */}
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest block mb-1">
                        Selected {order_type === 'service' ? 'Service' : 'Product'}
                      </span>
                      <h3 className="text-lg font-bold text-black uppercase tracking-tight">
                        {order_type === 'service' ? targetService?.title : targetProduct?.title}
                      </h3>
                      {order_type === 'digital_product' && (
                        <span className="text-sm font-black text-zinc-800 block mt-1">
                          Price: {targetProduct?.price}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-zinc-600 leading-relaxed font-semibold">
                      {order_type === 'service' ? targetService?.description : targetProduct?.description}
                    </p>

                    {order_type === 'digital_product' && targetProduct?.features && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block">Features included:</span>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-zinc-600 font-bold list-disc pl-4 uppercase">
                          {targetProduct.features.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Quantity picker for digital products */}
                  {order_type === 'digital_product' && (
                    <div className="pt-2 flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-black text-black uppercase tracking-widest">Quantity</label>
                        <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Select copies to buy</p>
                      </div>
                      
                      <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden h-10">
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
                  )}

                  {/* SERVICE 1: WEBSITE DEVELOPMENT FORM */}
                  {order_type === 'service' && serviceId === 'website-development' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label htmlFor="instagram_page" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          Instagram Page Link / Catalog URL <span className="text-[#E30613]">*</span>
                        </label>
                        <input
                          type="text"
                          id="instagram_page"
                          name="instagram_page"
                          required
                          value={formData.instagram_page}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                          placeholder="e.g. instagram.com/yourbrand"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Required Integrations & Automations</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'needs_whatsapp', label: 'WhatsApp Integration' },
                            { id: 'needs_payment', label: 'Payment Gateway' },
                            { id: 'needs_cms', label: 'CMS Setup (External)' },
                            { id: 'needs_notifications', label: 'Order Notifications' }
                          ].map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={(formData as any)[opt.id]}
                                onChange={(e) => setFormData((prev) => ({ ...prev, [opt.id]: e.target.checked }))}
                                className="rounded border-zinc-300 text-[#E30613] focus:ring-[#E30613] h-4 w-4"
                              />
                              <span className="text-xs font-bold text-zinc-700">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="platform_preference" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          Platform Preference (Optional)
                        </label>
                        <input
                          type="text"
                          id="platform_preference"
                          name="platform_preference"
                          value={formData.platform_preference}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                          placeholder="e.g. Shopify, Next.js, no preference"
                        />
                      </div>
                    </div>
                  )}

                  {/* SERVICE 2: SECURITY REVIEW FORM */}
                  {order_type === 'service' && serviceId === 'security-review' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label htmlFor="audit_url" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          Website Environment URL <span className="text-[#E30613]">*</span>
                        </label>
                        <input
                          type="url"
                          id="audit_url"
                          name="audit_url"
                          required
                          value={formData.audit_url}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="hosting_provider" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                            Hosting Provider / Stack <span className="text-[#E30613]">*</span>
                          </label>
                          <input
                            type="text"
                            id="hosting_provider"
                            name="hosting_provider"
                            required
                            value={formData.hosting_provider}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                            placeholder="e.g. AWS, Cloudflare, Shopify"
                          />
                        </div>

                        <div>
                          <label htmlFor="compliance_needs" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                            Compliance Target (Optional)
                          </label>
                          <input
                            type="text"
                            id="compliance_needs"
                            name="compliance_needs"
                            value={formData.compliance_needs}
                            onChange={handleTextChange}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                            placeholder="e.g. PCI-DSS, GDPR, HIPAA"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="main_concerns" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          Primary Security Concerns
                        </label>
                        <textarea
                          id="main_concerns"
                          name="main_concerns"
                          rows={3}
                          value={formData.main_concerns}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                          placeholder="e.g. SQL exposures, raw API key protection, compliance review..."
                        />
                      </div>
                    </div>
                  )}

                  {/* SERVICE 3: AI INTEGRATION FORM */}
                  {order_type === 'service' && serviceId === 'ai-integration' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label htmlFor="pipeline_platform" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          Order / Purchase Platform <span className="text-[#E30613]">*</span>
                        </label>
                        <input
                          type="text"
                          id="pipeline_platform"
                          name="pipeline_platform"
                          required
                          value={formData.pipeline_platform}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                          placeholder="e.g. Notion, Shopify, custom database"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Agent Tasks to Automate</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'agent_needs_support', label: 'Customer support' },
                            { id: 'agent_needs_orders', label: 'Order verification' },
                            { id: 'agent_needs_emails', label: 'Follow-up emails' }
                          ].map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={(formData as any)[opt.id]}
                                onChange={(e) => setFormData((prev) => ({ ...prev, [opt.id]: e.target.checked }))}
                                className="rounded border-zinc-300 text-[#E30613] focus:ring-[#E30613] h-4 w-4"
                              />
                              <span className="text-xs font-bold text-zinc-700">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="agent_llm_vendor" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                          Preferred AI Model / LLM Provider
                        </label>
                        <select
                          id="agent_llm_vendor"
                          name="agent_llm_vendor"
                          value={formData.agent_llm_vendor}
                          onChange={handleTextChange}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black focus:border-[#E30613] focus:outline-none"
                        >
                          <option value="no-preference">No Preference (Recommend best fit)</option>
                          <option value="openai">OpenAI (GPT-4o)</option>
                          <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                          <option value="gemini">Google Gemini (Gemini Pro/Flash)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* General Custom Prefs/Design Notes */}
                  <div>
                    <label htmlFor="design_notes" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                      {order_type === 'service' 
                        ? 'Additional Notes / Requirements' 
                        : order_type === 'digital_product'
                          ? 'Specific Inquiries or Custom setup requests (Optional)'
                          : 'Custom Preferences (Optional)'}
                    </label>
                    <textarea
                      id="design_notes"
                      name="design_notes"
                      rows={3}
                      value={formData.design_notes}
                      onChange={handleTextChange}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                      placeholder={
                        order_type === 'service'
                          ? 'Specify details on budget, timing requests, or technology parameters...'
                          : order_type === 'digital_product'
                            ? 'e.g. Any specific queries, custom setup help, integration questions...'
                            : 'e.g. Any custom template fields, logo requests, or formatting notes...'
                      }
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: CONTACT DETAILS */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Your Contact Details</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Provide details for delivery and coordination</p>
                  </div>

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
                        placeholder="Your full name"
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

                    <div>
                      <label htmlFor="customer_phone" className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                        {order_type === 'digital_product' ? 'WhatsApp Number (For coordination and delivery)' : 'Phone Number'} <span className="text-[#E30613]">*</span>
                      </label>
                      <input
                        type="tel"
                        id="customer_phone"
                        name="customer_phone"
                        required
                        value={formData.customer_phone}
                        onChange={handleTextChange}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:border-[#E30613] focus:outline-none"
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & CONFIRM */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-base font-black uppercase text-black mb-1">Review Request</h2>
                    <p className="text-xs text-zinc-500 font-bold tracking-wider">Confirm details before submitting your manual order</p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-4">
                    <div className="border-b border-zinc-200 pb-3">
                      <span className="text-[10px] font-black text-[#E30613] uppercase tracking-widest block mb-0.5">
                        Selected {order_type === 'service' ? 'Service' : 'Product'}
                      </span>
                      <span className="text-sm font-bold text-black uppercase">
                        {order_type === 'service' ? targetService?.title : targetProduct?.title}
                      </span>
                    </div>

                    {order_type === 'digital_product' && (
                      <div className="border-b border-zinc-200 pb-3 flex justify-between">
                        <div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Price</span>
                          <span className="text-xs font-bold text-black">{targetProduct?.price}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Quantity</span>
                          <span className="text-xs font-bold text-black">{formData.quantity}</span>
                        </div>
                      </div>
                    )}

                    {/* Specific Service Summary details */}
                    {order_type === 'service' && serviceId === 'website-development' && (
                      <div className="border-b border-zinc-200 pb-3 text-xs font-semibold text-zinc-700 uppercase space-y-1">
                        <p><span className="text-zinc-400">Instagram URL:</span> {formData.instagram_page}</p>
                        <p><span className="text-zinc-400">Pref Platform:</span> {formData.platform_preference || 'None'}</p>
                        <p><span className="text-zinc-400">Automations:</span> {[
                          formData.needs_whatsapp && 'WhatsApp',
                          formData.needs_payment && 'Payments',
                          formData.needs_cms && 'CMS',
                          formData.needs_notifications && 'Notifications'
                        ].filter(Boolean).join(', ') || 'None'}</p>
                      </div>
                    )}

                    {order_type === 'service' && serviceId === 'security-review' && (
                      <div className="border-b border-zinc-200 pb-3 text-xs font-semibold text-zinc-700 uppercase space-y-1">
                        <p><span className="text-zinc-400">Environment URL:</span> {formData.audit_url}</p>
                        <p><span className="text-zinc-400">Hosting Provider:</span> {formData.hosting_provider}</p>
                        <p><span className="text-zinc-400">Compliance target:</span> {formData.compliance_needs || 'None'}</p>
                      </div>
                    )}

                    {order_type === 'service' && serviceId === 'ai-integration' && (
                      <div className="border-b border-zinc-200 pb-3 text-xs font-semibold text-zinc-700 uppercase space-y-1">
                        <p><span className="text-zinc-400">Order Platform:</span> {formData.pipeline_platform}</p>
                        <p><span className="text-zinc-400">AI Vendor:</span> {formData.agent_llm_vendor}</p>
                        <p><span className="text-zinc-400">Tasks:</span> {[
                          formData.agent_needs_support && 'Support',
                          formData.agent_needs_orders && 'Orders',
                          formData.agent_needs_emails && 'Emails'
                        ].filter(Boolean).join(', ') || 'None'}</p>
                      </div>
                    )}

                    <div className="border-b border-zinc-200 pb-3">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Contact</span>
                      <div className="text-xs font-semibold text-zinc-700 uppercase space-y-0.5">
                        <p><span className="text-zinc-400">Name:</span> {formData.customer_name}</p>
                        <p><span className="text-zinc-400">Email:</span> {formData.customer_email}</p>
                        <p><span className="text-zinc-400">Phone:</span> {formData.customer_phone}</p>
                      </div>
                    </div>

                    {formData.design_notes && (
                      <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Additional Notes</span>
                        <p className="text-xs text-zinc-700 italic">{formData.design_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ACTIONS STEP NAVIGATION BUTTONS FOOTER */}
          <div className="pt-6 border-t border-zinc-100 flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={status === 'submitting'}
                className="flex-1 inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-black uppercase text-zinc-700 tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                Back
              </button>
            )}
            
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 text-xs font-black uppercase text-white tracking-wider transition-colors cursor-pointer shadow-md"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 text-xs font-black uppercase text-white tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit Custom Order'}
              </button>
            )}
          </div>

        </form>
      </div>

      {/* INSTRUCTIONAL GOOGLE PHOTOS MODAL (Only memories mode uses this) */}
      {order_type === 'memories' && showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 space-y-6 text-left relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <LucideIcon name="X" className="h-5 w-5" />
            </button>
            
            <div className="space-y-2">
              <h3 className="text-base font-black uppercase text-black">Get Shared Google Photos Link</h3>
              <p className="text-xs text-zinc-500 font-bold tracking-wider">Follow these steps inside Google Photos</p>
            </div>

            <ol className="space-y-4 text-xs text-zinc-700 font-medium">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-xs font-black shrink-0">1</span>
                <span>Open Google Photos (app or website) and select the album containing your memories.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-xs font-black shrink-0">2</span>
                <span>Click the **Share** button (usually in the top right or bottom menu).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-xs font-black shrink-0">3</span>
                <span>Select **Create Link** (or click the Link icon to enable link sharing).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E30613]/10 border border-[#E30613]/30 text-[#E30613] text-xs font-black shrink-0">4</span>
                <span>Copy the generated link (e.g. `https://photos.app.goo.gl/...`) and paste it back into Step 4.</span>
              </li>
            </ol>
            
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full inline-flex h-9 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 text-xs font-black uppercase text-white tracking-wider transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
