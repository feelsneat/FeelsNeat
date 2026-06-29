'use client';

import { useState, useEffect } from 'react';
import { LucideIcon } from '../ui/LucideIcon';

function ImageUploader({ 
  label, 
  value, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
}) {
  const uploaderId = `uploader-${label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(dataUrl);
        } else {
          onChange(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-foreground/60 mb-1 uppercase tracking-wider">{label}</label>
      
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-zinc-50/50 border border-border-custom rounded-xl p-3">
        {/* Thumbnail Preview */}
        {value ? (
          <div className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border-custom bg-white flex-shrink-0 shadow-2xs">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            >
              <LucideIcon name="Trash2" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg border border-dashed border-border-custom bg-white flex-shrink-0 flex flex-col items-center justify-center text-foreground/30 text-[9px] uppercase font-bold tracking-wide">
            Empty
          </div>
        )}

        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor={uploaderId}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border-custom bg-white px-3 text-[11px] font-bold text-foreground hover:bg-zinc-50 transition-colors cursor-pointer shadow-3xs"
            >
              <LucideIcon name="Feather" className="h-3.5 w-3.5" />
              <span>Choose Image File</span>
            </label>
            <input
              type="file"
              id={uploaderId}
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            {value && (
              <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-100 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                Linked
              </span>
            )}
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Paste image URL or upload above..."}
            className="w-full rounded-lg border border-border-custom bg-white px-3 py-1.5 text-xs focus:border-foreground focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function GalleryManager({ 
  images = [], 
  onChange 
}: { 
  images: string[]; 
  onChange: (imgs: string[]) => void;
}) {
  const uploaderId = `uploader-gallery-${Math.random().toString(36).substr(2, 9)}`;
  const [newUrl, setNewUrl] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange([...images, dataUrl]);
        } else {
          onChange([...images, e.target?.result as string]);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(handleFile);
    }
  };

  const removeImage = (idxToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== idxToRemove));
  };

  const addUrl = () => {
    if (newUrl.trim()) {
      onChange([...images, newUrl.trim()]);
      setNewUrl('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Project Gallery Images</label>
      
      {images.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 border border-border-custom rounded-xl p-3 bg-zinc-50/50">
          {images.map((img, idx) => (
            <div key={idx} className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-border-custom bg-white shadow-3xs">
              <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                <LucideIcon name="Trash2" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border-custom rounded-xl p-4 text-center text-[10px] text-foreground/40 bg-zinc-50/20 font-bold uppercase tracking-wider">
          No gallery images uploaded
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 items-center bg-zinc-50/50 border border-border-custom rounded-xl p-3">
        <div className="w-full sm:w-auto">
          <label
            htmlFor={uploaderId}
            className="inline-flex h-8 w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-border-custom bg-white px-3 text-[11px] font-bold text-foreground hover:bg-zinc-50 transition-colors cursor-pointer shadow-3xs"
          >
            <LucideIcon name="Feather" className="h-3.5 w-3.5" />
            <span>Upload Photos</span>
          </label>
          <input
            type="file"
            id={uploaderId}
            accept="image/*"
            multiple
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 w-full flex gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Or paste external image URL..."
            className="flex-1 rounded-lg border border-border-custom bg-white px-3 py-1.5 text-xs focus:border-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={addUrl}
            className="h-8 rounded-lg bg-foreground px-3 text-[11px] font-bold text-background hover:bg-accent-custom transition-colors cursor-pointer"
          >
            Add URL
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminDashboardProps {
  userEmail: string;
}

export function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'pages' | 'services' | 'work' | 'observations'>('settings');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Selected item sub-states for Lists (Services, Work, Observations)
  const [selectedWorkSlug, setSelectedWorkSlug] = useState<string | null>(null);
  const [selectedObservationSlug, setSelectedObservationSlug] = useState<string | null>(null);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const data = await res.json();
          setDb(data);
        } else {
          setSaveStatus('error');
          setSaveMessage('Failed to load content database.');
        }
      } catch (err) {
        setSaveStatus('error');
        setSaveMessage('Network error loading content.');
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSaveToKv = async () => {
    setSaveStatus('saving');
    setSaveMessage('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('success');
        setSaveMessage(data.message);
        setTimeout(() => setSaveStatus('idle'), 3500);
      } else {
        setSaveStatus('error');
        setSaveMessage(data.error || 'Failed to save changes.');
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage('Network error occurred while saving.');
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'content-db.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSyncFromCodebase = async () => {
    if (!confirm('Are you sure you want to restore the database to the codebase defaults? This will overwrite your current draft in the dashboard.')) {
      return;
    }
    try {
      setSaveStatus('saving');
      setSaveMessage('Loading codebase defaults...');
      const res = await fetch('/api/admin/content?default=true');
      if (res.ok) {
        const data = await res.json();
        setDb(data);
        setSaveStatus('success');
        setSaveMessage('Codebase default database loaded. Click "Save Draft to KV" to publish these changes to Cloudflare KV.');
      } else {
        setSaveStatus('error');
        setSaveMessage('Failed to fetch default database from server.');
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage('Network error occurred while fetching defaults.');
    }
  };

  // State handlers for settings updates
  const updateSettings = (key: string, value: any) => {
    setDb((prev: any) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const updateLogo = (key: string, value: any) => {
    setDb((prev: any) => ({
      ...prev,
      settings: {
        ...prev.settings,
        logo: {
          ...prev.settings.logo,
          [key]: value,
        },
      },
    }));
  };

  // State handlers for page updates
  const updatePage = (pageKey: string, fieldKey: string, value: any) => {
    setDb((prev: any) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: {
          ...prev.pages[pageKey],
          [fieldKey]: value,
        },
      },
    }));
  };

  // List management updates: Services
  const handleServiceChange = (slug: string, field: string, value: any) => {
    setDb((prev: any) => ({
      ...prev,
      services: prev.services.map((s: any) => (s.slug === slug ? { ...s, [field]: value } : s)),
    }));
  };

  const handleServiceTagsChange = (slug: string, tagsStr: string) => {
    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    handleServiceChange(slug, 'tags', tags);
  };

  const handleAddService = () => {
    const slug = `new-service-${Date.now()}`;
    const newService = {
      slug,
      title: 'New Service Capability',
      icon: 'Cpu',
      order: db.services.length + 1,
      summary: 'Short service overview capability summary.',
      content: 'Detailed description of how we create value...',
      image: '',
      externalUrl: '',
      additionalImages: [],
      tags: [],
    };
    setDb((prev: any) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
    setSelectedServiceSlug(slug);
  };

  const handleDeleteService = (slug: string) => {
    if (confirm('Are you sure you want to delete this service capablity?')) {
      setDb((prev: any) => ({
        ...prev,
        services: prev.services.filter((s: any) => s.slug !== slug),
      }));
      if (selectedServiceSlug === slug) setSelectedServiceSlug(null);
    }
  };

  // List management updates: Work Items
  const handleWorkChange = (slug: string, field: string, value: any) => {
    setDb((prev: any) => ({
      ...prev,
      work: prev.work.map((w: any) => (w.slug === slug ? { ...w, [field]: value } : w)),
    }));
  };

  const handleWorkTagsChange = (slug: string, tagsStr: string) => {
    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    handleWorkChange(slug, 'tags', tags);
  };

  const handleWorkAdditionalImagesChange = (slug: string, imagesStr: string) => {
    const images = imagesStr.split(',').map((img) => img.trim()).filter(Boolean);
    handleWorkChange(slug, 'additionalImages', images);
  };

  const handleAddWork = () => {
    const slug = `new-project-${Date.now()}`;
    const newProject = {
      slug,
      title: 'New Exploration',
      client: 'Internal Experiment',
      date: new Date().toISOString().substring(0, 7),
      summary: 'Short project summary overview.',
      coverImage: '',
      additionalImages: [],
      externalUrl: '',
      category: 'Design Exploration',
      status: 'Active',
      order: db.work.length + 1,
      content: 'Detailed description of the tool/exploration...',
    };
    setDb((prev: any) => ({
      ...prev,
      work: [...prev.work, newProject],
    }));
    setSelectedWorkSlug(slug);
  };

  const handleDeleteWork = (slug: string) => {
    if (confirm('Are you sure you want to delete this case study?')) {
      setDb((prev: any) => ({
        ...prev,
        work: prev.work.filter((w: any) => w.slug !== slug),
      }));
      if (selectedWorkSlug === slug) setSelectedWorkSlug(null);
    }
  };

  // List management updates: Observations
  const handleObservationChange = (slug: string, field: string, value: any) => {
    setDb((prev: any) => ({
      ...prev,
      observations: prev.observations.map((o: any) => (o.slug === slug ? { ...o, [field]: value } : o)),
    }));
  };

  const handleObservationTagsChange = (slug: string, tagsStr: string) => {
    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    handleObservationChange(slug, 'tags', tags);
  };

  const handleAddObservation = () => {
    const slug = `new-observation-${Date.now()}`;
    const newPost = {
      slug,
      title: 'New Observation',
      date: new Date().toISOString().substring(0, 10),
      author: 'FeelsNeat Team',
      summary: 'Reflective summary of the observation.',
      coverImage: '',
      tags: ['Design'],
      externalSubstackUrl: 'https://substack.com',
      youtubeUrl: '',
      content: 'Published on Substack.',
    };
    setDb((prev: any) => ({
      ...prev,
      observations: [...prev.observations, newPost],
    }));
    setSelectedObservationSlug(slug);
  };

  const handleDeleteObservation = (slug: string) => {
    if (confirm('Are you sure you want to delete this observation article?')) {
      setDb((prev: any) => ({
        ...prev,
        observations: prev.observations.filter((o: any) => o.slug !== slug),
      }));
      if (selectedObservationSlug === slug) setSelectedObservationSlug(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-foreground border-t-transparent mb-4" />
        <p className="text-xs font-bold text-foreground/60">Loading CMS Content...</p>
      </div>
    );
  }

  const selectedWork = db.work.find((w: any) => w.slug === selectedWorkSlug);
  const selectedObservation = db.observations.find((o: any) => o.slug === selectedObservationSlug);
  const selectedService = db.services.find((s: any) => s.slug === selectedServiceSlug);

  return (
    <div className="space-y-6">
      {/* Top Banner Control Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border-custom bg-background shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <LucideIcon name="ShieldAlert" className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">FeelsNeat Admin Workspace</h1>
            <p className="text-[10px] font-bold text-foreground/50">Signed in as <span className="underline">{userEmail}</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleSyncFromCodebase}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border-custom bg-zinc-900 text-foreground px-4 text-xs font-bold hover:bg-zinc-800 cursor-pointer"
          >
            Sync from Codebase
          </button>
          <button
            onClick={handleDownloadBackup}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border-custom bg-white px-4 text-xs font-bold text-foreground/80 hover:bg-zinc-50 cursor-pointer"
          >
            Export Backup (JSON)
          </button>
          <button
            onClick={handleSaveToKv}
            disabled={saveStatus === 'saving'}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground px-4 text-xs font-bold text-background hover:bg-accent-custom disabled:opacity-50 cursor-pointer"
          >
            {saveStatus === 'saving' ? 'Saving changes...' : 'Save Draft to KV'}
          </button>
          <a
            href="/api/auth/logout"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border-custom bg-red-50 px-4 text-xs font-bold text-red-750 hover:bg-red-100/40 cursor-pointer"
          >
            Sign Out
          </a>
        </div>
      </div>

      {/* Save Status Banner */}
      {saveMessage && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          saveStatus === 'error' 
            ? 'bg-red-50/50 border-red-200 text-red-800' 
            : 'bg-green-50/50 border-green-200 text-green-800'
        }`}>
          <LucideIcon name={saveStatus === 'error' ? 'AlertTriangle' : 'Check'} className="h-4.5 w-4.5" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-1.5 rounded-xl border border-border-custom bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest px-3 py-2 block">CMS Sections</span>
          {[
            { id: 'settings', label: 'General Settings', icon: 'Settings' },
            { id: 'pages', label: 'Text Pages copy', icon: 'FileText' },
            { id: 'services', label: 'What We Do', icon: 'Cpu' },
            { id: 'work', label: 'Our Work (Portfolio)', icon: 'Briefcase' },
            { id: 'observations', label: 'Observations Blog', icon: 'Bookmark' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-foreground text-background'
                  : 'text-foreground/70 hover:bg-zinc-50'
              }`}
            >
              <LucideIcon name={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Editor Main Content Window */}
        <div className="lg:col-span-9 rounded-xl border border-border-custom bg-white p-6 shadow-xs min-h-[400px]">
          {/* TAB: GENERAL SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-foreground border-b border-border-custom pb-3">General Settings</h2>
              
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-foreground/80 mb-2 uppercase">Site Name</label>
                  <input
                    type="text"
                    value={db.settings.siteName}
                    onChange={(e) => updateSettings('siteName', e.target.value)}
                    className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/80 mb-2 uppercase">Contact Email</label>
                  <input
                    type="email"
                    value={db.settings.contactEmail}
                    onChange={(e) => updateSettings('contactEmail', e.target.value)}
                    className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-2 uppercase">SEO Site Title</label>
                <input
                  type="text"
                  value={db.settings.siteTitle}
                  onChange={(e) => updateSettings('siteTitle', e.target.value)}
                  className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/80 mb-2 uppercase">SEO Site Description</label>
                <textarea
                  rows={3}
                  value={db.settings.siteDescription}
                  onChange={(e) => updateSettings('siteDescription', e.target.value)}
                  className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border-custom">
                <h3 className="text-xs font-bold text-foreground/80 uppercase mb-4">Logo Setting</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 mb-1">Logo Text</label>
                    <input
                      type="text"
                      value={db.settings.logo.text}
                      onChange={(e) => updateLogo('text', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <ImageUploader
                      label="Logo Asset Path (e.g. logo.png)"
                      value={db.settings.logo.icon}
                      onChange={(val) => updateLogo('icon', val)}
                      placeholder="e.g. /logo.png or uploaded image"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TEXT PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-8">
              <h2 className="text-base font-extrabold text-foreground border-b border-border-custom pb-3">Static Pages Copy</h2>
              
              {/* Home Page Copy Editor */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground border-l-2 border-foreground pl-3">Home Page</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 mb-1">Hero Title</label>
                    <input
                      type="text"
                      value={db.pages.home.title}
                      onChange={(e) => updatePage('home', 'title', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 mb-1">Hero Subtitle</label>
                    <input
                      type="text"
                      value={db.pages.home.subtitle}
                      onChange={(e) => updatePage('home', 'subtitle', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/50 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={db.pages.home.tagline}
                    onChange={(e) => updatePage('home', 'tagline', e.target.value)}
                    className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/50 mb-1">Introduction Body (Markdown)</label>
                  <textarea
                    rows={4}
                    value={db.pages.home.content}
                    onChange={(e) => updatePage('home', 'content', e.target.value)}
                    className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* About Page Copy Editor */}
              <div className="space-y-4 pt-6 border-t border-border-custom">
                <h3 className="text-sm font-bold text-foreground border-l-2 border-foreground pl-3">About Page</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 mb-1">Page Title</label>
                    <input
                      type="text"
                      value={db.pages.about.title}
                      onChange={(e) => updatePage('about', 'title', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 mb-1">Page Subtitle</label>
                    <input
                      type="text"
                      value={db.pages.about.subtitle}
                      onChange={(e) => updatePage('about', 'subtitle', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/50 mb-1">Philosophy Title</label>
                  <input
                    type="text"
                    value={db.pages.about.philosophyTitle}
                    onChange={(e) => updatePage('about', 'philosophyTitle', e.target.value)}
                    className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/50 mb-1">Philosophy Description</label>
                  <textarea
                    rows={2}
                    value={db.pages.about.philosophyText}
                    onChange={(e) => updatePage('about', 'philosophyText', e.target.value)}
                    className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/50 mb-1">About Body Content (Markdown)</label>
                  <textarea
                    rows={4}
                    value={db.pages.about.content}
                    onChange={(e) => updatePage('about', 'content', e.target.value)}
                    className="w-full rounded-lg border border-border-custom bg-zinc-50/50 px-3 py-2 text-xs focus:border-foreground focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border-custom pb-3">
                <h2 className="text-base font-extrabold text-foreground">Services Capabilities</h2>
                <button
                  onClick={handleAddService}
                  className="inline-flex h-7 items-center justify-center rounded-lg bg-foreground px-3 text-[10px] font-bold text-background hover:bg-accent-custom cursor-pointer"
                >
                  Add Service
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {db.services.map((service: any) => (
                  <div key={service.slug} className="flex items-center rounded-lg border border-border-custom overflow-hidden">
                    <button
                      onClick={() => setSelectedServiceSlug(service.slug)}
                      className={`px-3 py-1.5 text-xs font-semibold cursor-pointer border-r border-border-custom transition-colors ${
                        selectedServiceSlug === service.slug
                          ? 'bg-foreground text-background'
                          : 'text-foreground/70 hover:bg-zinc-50'
                      }`}
                    >
                      {service.title}
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.slug)}
                      className="p-1.5 text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Delete service"
                    >
                      <LucideIcon name="Trash2" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {selectedService ? (
                <div className="space-y-4 p-4 rounded-xl border border-border-custom bg-zinc-50/30">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Service Title</label>
                      <input
                        type="text"
                        value={selectedService.title}
                        onChange={(e) => handleServiceChange(selectedService.slug, 'title', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Icon (Lucide name)</label>
                      <input
                        type="text"
                        value={selectedService.icon}
                        onChange={(e) => handleServiceChange(selectedService.slug, 'icon', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <ImageUploader
                        label="Image Graphic URL (optional)"
                        value={selectedService.image || ''}
                        onChange={(val) => handleServiceChange(selectedService.slug, 'image', val)}
                        placeholder="e.g. /images/service.png or uploaded image"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">External Resource URL (optional)</label>
                      <input
                        type="text"
                        value={selectedService.externalUrl || ''}
                        onChange={(e) => handleServiceChange(selectedService.slug, 'externalUrl', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                        placeholder="e.g. GitHub repo, Substack, YouTube video URL"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 mb-1">Short Summary</label>
                    <textarea
                      rows={2}
                      value={selectedService.summary}
                      onChange={(e) => handleServiceChange(selectedService.slug, 'summary', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 mb-1">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      value={(selectedService.tags || []).join(', ')}
                      onChange={(e) => handleServiceTagsChange(selectedService.slug, e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <GalleryManager
                      images={selectedService.additionalImages || []}
                      onChange={(imgs) => handleServiceChange(selectedService.slug, 'additionalImages', imgs)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 mb-1">Detailed Description (Markdown)</label>
                    <textarea
                      rows={6}
                      value={selectedService.content}
                      onChange={(e) => handleServiceChange(selectedService.slug, 'content', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic text-center py-6">Select a capability to edit or click Add Service.</p>
              )}
            </div>
          )}

          {/* TAB: WORK / PORTFOLIO */}
          {activeTab === 'work' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border-custom pb-3">
                <h2 className="text-base font-extrabold text-foreground">Portfolio Projects</h2>
                <button
                  onClick={handleAddWork}
                  className="inline-flex h-7 items-center justify-center rounded-lg bg-foreground px-3 text-[10px] font-bold text-background hover:bg-accent-custom cursor-pointer"
                >
                  Add Project
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {db.work.map((project: any) => (
                  <div key={project.slug} className="flex items-center rounded-lg border border-border-custom overflow-hidden">
                    <button
                      onClick={() => setSelectedWorkSlug(project.slug)}
                      className={`px-3 py-1.5 text-xs font-semibold cursor-pointer border-r border-border-custom transition-colors ${
                        selectedWorkSlug === project.slug
                          ? 'bg-foreground text-background'
                          : 'text-foreground/70 hover:bg-zinc-50'
                      }`}
                    >
                      {project.title}
                    </button>
                    <button
                      onClick={() => handleDeleteWork(project.slug)}
                      className="p-1.5 text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Delete project"
                    >
                      <LucideIcon name="Trash2" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {selectedWork ? (
                <div className="space-y-4 p-4 rounded-xl border border-border-custom bg-zinc-50/30">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={selectedWork.title}
                        onChange={(e) => handleWorkChange(selectedWork.slug, 'title', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Client Name / Sponsor</label>
                      <input
                        type="text"
                        value={selectedWork.client}
                        onChange={(e) => handleWorkChange(selectedWork.slug, 'client', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Date (YYYY-MM)</label>
                      <input
                        type="text"
                        value={selectedWork.date}
                        onChange={(e) => handleWorkChange(selectedWork.slug, 'date', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Category</label>
                      <input
                        type="text"
                        value={selectedWork.category}
                        onChange={(e) => handleWorkChange(selectedWork.slug, 'category', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                        placeholder="e.g. Digital Product, Visual Refresh"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Status</label>
                      <input
                        type="text"
                        value={selectedWork.status}
                        onChange={(e) => handleWorkChange(selectedWork.slug, 'status', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                        placeholder="e.g. Completed, In Development"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <ImageUploader
                        label="Main Cover Image URL"
                        value={selectedWork.coverImage || ''}
                        onChange={(val) => handleWorkChange(selectedWork.slug, 'coverImage', val)}
                        placeholder="e.g. /images/cover.jpg or uploaded image"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">External URL (GitHub, YouTube, site link)</label>
                      <input
                        type="text"
                        value={selectedWork.externalUrl || ''}
                        onChange={(e) => handleWorkChange(selectedWork.slug, 'externalUrl', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                        placeholder="e.g. https://github.com/... or https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 mb-1">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      value={selectedWork.tags.join(', ')}
                      onChange={(e) => handleWorkTagsChange(selectedWork.slug, e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <GalleryManager
                      images={selectedWork.additionalImages || []}
                      onChange={(imgs) => handleWorkChange(selectedWork.slug, 'additionalImages', imgs)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      value={selectedWork.summary}
                      onChange={(e) => handleWorkChange(selectedWork.slug, 'summary', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 mb-1">Case Study Content (Markdown)</label>
                    <textarea
                      rows={6}
                      value={selectedWork.content}
                      onChange={(e) => handleWorkChange(selectedWork.slug, 'content', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic text-center py-6">Select a project to edit or click Add Project.</p>
              )}
            </div>
          )}

          {/* TAB: OBSERVATIONS */}
          {activeTab === 'observations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border-custom pb-3">
                <h2 className="text-base font-extrabold text-foreground">Observations index (Substack)</h2>
                <button
                  onClick={handleAddObservation}
                  className="inline-flex h-7 items-center justify-center rounded-lg bg-foreground px-3 text-[10px] font-bold text-background hover:bg-accent-custom cursor-pointer"
                >
                  Add Article
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {db.observations.map((post: any) => (
                  <div key={post.slug} className="flex items-center rounded-lg border border-border-custom overflow-hidden">
                    <button
                      onClick={() => setSelectedObservationSlug(post.slug)}
                      className={`px-3 py-1.5 text-xs font-semibold cursor-pointer border-r border-border-custom transition-colors ${
                        selectedObservationSlug === post.slug
                          ? 'bg-foreground text-background'
                          : 'text-foreground/70 hover:bg-zinc-50'
                      }`}
                    >
                      {post.title}
                    </button>
                    <button
                      onClick={() => handleDeleteObservation(post.slug)}
                      className="p-1.5 text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Delete post"
                    >
                      <LucideIcon name="Trash2" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {selectedObservation ? (
                <div className="space-y-4 p-4 rounded-xl border border-border-custom bg-zinc-50/30">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Article Title</label>
                      <input
                        type="text"
                        value={selectedObservation.title}
                        onChange={(e) => handleObservationChange(selectedObservation.slug, 'title', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Author</label>
                      <input
                        type="text"
                        value={selectedObservation.author}
                        onChange={(e) => handleObservationChange(selectedObservation.slug, 'author', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Publish Date (YYYY-MM-DD)</label>
                      <input
                        type="text"
                        value={selectedObservation.date}
                        onChange={(e) => handleObservationChange(selectedObservation.slug, 'date', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">Cover Image URL</label>
                      <input
                        type="text"
                        value={selectedObservation.coverImage}
                        onChange={(e) => handleObservationChange(selectedObservation.slug, 'coverImage', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                        placeholder="e.g. /images/observation.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">External Substack URL</label>
                      <input
                        type="text"
                        value={selectedObservation.externalSubstackUrl}
                        onChange={(e) => handleObservationChange(selectedObservation.slug, 'externalSubstackUrl', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                        placeholder="e.g. https://feelsneat.substack.com/p/speed-is-neat"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/60 mb-1">YouTube URL (optional, for video posts)</label>
                      <input
                        type="text"
                        value={selectedObservation.youtubeUrl || ''}
                        onChange={(e) => handleObservationChange(selectedObservation.slug, 'youtubeUrl', e.target.value)}
                        className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                        placeholder="e.g. https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 mb-1">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      value={selectedObservation.tags.join(', ')}
                      onChange={(e) => handleObservationTagsChange(selectedObservation.slug, e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-foreground/60 mb-1">Short Summary</label>
                    <textarea
                      rows={2}
                      value={selectedObservation.summary}
                      onChange={(e) => handleObservationChange(selectedObservation.slug, 'summary', e.target.value)}
                      className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic text-center py-6">Select an article to edit or click Add Article.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
