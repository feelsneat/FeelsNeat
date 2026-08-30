'use client';

import { useState, useEffect } from 'react';
import { LucideIcon } from '../ui/LucideIcon';

interface AdminDashboardProps {
  userEmail: string;
}

export function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'memories' | 'service' | 'digital_product' | 'general_inquiry' | 'pet_profiles'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Pet Profiles specific states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [modalFormData, setModalFormData] = useState<any>(null); // null means modal is closed

  // WhatsApp Redirect Config State
  const [contentDb, setContentDb] = useState<any>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [updatingWhatsapp, setUpdatingWhatsapp] = useState(false);

  // Load content settings (which contains whatsappNumber)
  const loadContentSettings = async () => {
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        setContentDb(data);
        setWhatsappNumber(data.settings?.whatsappNumber || '919999999999');
      }
    } catch (err) {
      console.error('Failed to load content settings:', err);
    }
  };

  // Update redirect whatsapp number inside settings object
  const handleSaveWhatsappNumber = async () => {
    if (!whatsappNumber.trim()) {
      alert('Please enter a valid WhatsApp phone number.');
      return;
    }
    setUpdatingWhatsapp(true);
    try {
      const updatedDb = {
        ...contentDb,
        settings: {
          ...(contentDb?.settings || {}),
          whatsappNumber: whatsappNumber.replace(/[+\s-]/g, '') // strip spacing/symbols
        }
      };

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDb)
      });

      if (res.ok) {
        setContentDb(updatedDb);
        alert('WhatsApp redirect number updated successfully!');
      } else {
        alert('Failed to update WhatsApp redirect number.');
      }
    } catch (err) {
      alert('Error connecting to settings update API.');
    } finally {
      setUpdatingWhatsapp(false);
    }
  };

  // Load orders list from API
  const loadOrders = async () => {
    setSyncStatus('loading');
    try {
      const res = await fetch('/api/order');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } else {
        setSyncStatus('error');
        setSyncMessage('Failed to fetch orders from server.');
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage('Network error occurred loading orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const res = await fetch('/api/order?type=profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Failed to load pet profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadProfiles();
    loadContentSettings();
  }, []);

  // Update order fields (payment references, production status, etc.)
  const handleUpdateOrderStatus = async (orderId: string, statusUpdates: any) => {
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', order_id: orderId, statusUpdates }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.order_id === orderId) {
              return {
                ...o,
                payment: { ...o.payment, ...(statusUpdates.payment || {}) },
                production: { ...o.production, ...(statusUpdates.production || {}) }
              };
            }
            return o;
          })
        );
      } else {
        alert('Server returned an error updating order status.');
      }
    } catch (err) {
      alert('Failed to connect to API to update status.');
    }
  };

  // Delete order record
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to permanently delete order ${orderId}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', order_id: orderId }),
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
        if (selectedOrderId === orderId) setSelectedOrderId(null);
      } else {
        alert('Failed to delete order record from server.');
      }
    } catch (err) {
      alert('Failed to delete order.');
    }
  };

  // Pet Profile CRUD Handlers
  const handleSaveProfile = async (profileData: any) => {
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_profile', profileData }),
      });
      if (res.ok) {
        await loadProfiles();
        await loadOrders();
        setModalFormData(null);
      } else {
        alert('Failed to save pet profile.');
      }
    } catch (err) {
      alert('Error connecting to pet profile API.');
    }
  };

  const handleToggleProfileStatus = async (profileId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile_status', profile_id: profileId, status: nextStatus }),
      });
      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.profile_id === profileId) {
              return { ...p, status: nextStatus, updated_at: new Date().toISOString() };
            }
            return p;
          })
        );
      } else {
        alert('Failed to update pet profile status.');
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to permanently delete this pet profile? The NFC link will stop working.')) {
      return;
    }
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_profile', profile_id: profileId }),
      });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.profile_id !== profileId));
        if (selectedProfileId === profileId) setSelectedProfileId(null);
      } else {
        alert('Failed to delete pet profile.');
      }
    } catch (err) {
      alert('Error deleting profile.');
    }
  };

  // Export orders backup
  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `feelsneat-orders-backup-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter orders by active tab and search query
  const filteredOrders = orders.filter((order) => {
    // 1. Filter by Tab
    if (activeTab !== 'all' && order.order_type !== activeTab) {
      return false;
    }
    // 2. Filter by Search Query
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_id.toLowerCase().includes(query) ||
      (order.customer?.name || '').toLowerCase().includes(query) ||
      (order.customer?.email || '').toLowerCase().includes(query) ||
      (order.customer?.phone || '').toLowerCase().includes(query) ||
      (order.product_id || '').toLowerCase().includes(query)
    );
  });

  // Filter pet profiles by search query
  const filteredProfiles = profiles.filter((profile) => {
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      profile.pet_name.toLowerCase().includes(query) ||
      profile.order_id.toLowerCase().includes(query) ||
      profile.profile_id.toLowerCase().includes(query)
    );
  });

  const selectedOrder = orders.find((o) => o.order_id === selectedOrderId);
  const selectedProfile = profiles.find((p) => p.profile_id === selectedProfileId);

  return (
    <div className="space-y-6">
      {/* Top Console Control Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border-custom bg-background shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E30613] text-white">
            <LucideIcon name="Package" className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-zinc-900 uppercase tracking-tight">FeelsNeat Operations Control</h1>
            <p className="text-[10px] font-bold text-foreground/50">Admin Console: <span className="underline">{userEmail}</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={loadOrders}
            disabled={syncStatus === 'loading'}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border-custom bg-zinc-900 text-white px-4 text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
          >
            {syncStatus === 'loading' ? 'Loading...' : 'Refresh List'}
          </button>
          <button
            onClick={handleDownloadBackup}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border-custom bg-white px-4 text-xs font-bold text-foreground/80 hover:bg-zinc-50 cursor-pointer shadow-3xs"
          >
            Export Orders (JSON)
          </button>
          <a
            href="/api/auth/logout"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 px-4 text-xs font-bold text-red-750 hover:bg-red-100/40 cursor-pointer"
          >
            Sign Out
          </a>
        </div>
      </div>

      {/* Sync messages alert */}
      {syncStatus === 'error' && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-xs font-bold text-red-800 flex items-center gap-2">
          <LucideIcon name="AlertTriangle" className="h-4.5 w-4.5" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar: Filter Categories */}
        <div className="lg:col-span-3 flex flex-col gap-1.5 rounded-xl border border-border-custom bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest px-3 py-2 block">Order Pipelines</span>
          {[
            { id: 'all', label: 'All Submissions', icon: 'Inbox', count: orders.length },
            { id: 'memories', label: 'Memories Canvas', icon: 'Image', count: orders.filter(o => o.order_type === 'memories').length },
            { id: 'tap_tiles', label: 'Tap Tiles', icon: 'Settings', count: orders.filter(o => o.order_type === 'tap_tiles').length },
            { id: 'service', label: 'Services Inquiries', icon: 'Cpu', count: orders.filter(o => o.order_type === 'service').length },
            { id: 'digital_product', label: 'Digital Products', icon: 'DownloadCloud', count: orders.filter(o => o.order_type === 'digital_product').length },
            { id: 'general_inquiry', label: 'General Inquiries', icon: 'Mail', count: orders.filter(o => o.order_type === 'general_inquiry').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedOrderId(null);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-foreground text-background font-black'
                  : 'text-foreground/75 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <LucideIcon name={tab.icon} className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${activeTab === tab.id ? 'bg-white text-black' : 'bg-zinc-100 text-zinc-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}

          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest px-3 py-2 mt-4 block border-t border-zinc-150 text-left">Pet Tag Management</span>
          <button
            onClick={() => {
              setActiveTab('pet_profiles');
              setSelectedOrderId(null);
              setSelectedProfileId(null);
            }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'pet_profiles'
                ? 'bg-[#E30613] text-white font-black'
                : 'text-foreground/75 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <LucideIcon name="Heart" className="h-4 w-4 shrink-0" />
              <span>NFC Pet Profiles</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${activeTab === 'pet_profiles' ? 'bg-white text-[#E30613]' : 'bg-zinc-100 text-zinc-500'}`}>
              {profiles.length}
            </span>
          </button>

          {/* WhatsApp Redirect Config Box */}
          <div className="mt-4 pt-4 border-t border-zinc-150 px-3">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-2 text-left">WhatsApp Redirect</span>
            <div className="space-y-2">
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-[#1E1E1E] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#E30613]"
                placeholder="e.g. 919999999999"
              />
              <button
                type="button"
                onClick={handleSaveWhatsappNumber}
                disabled={updatingWhatsapp}
                className="w-full flex h-8 items-center justify-center rounded bg-[#E30613] hover:bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {updatingWhatsapp ? 'Saving...' : 'Update Number'}
              </button>
            </div>
          </div>
        </div>

        {/* Console Workspace area */}
        <div className="lg:col-span-9 rounded-xl border border-border-custom bg-white p-6 shadow-xs min-h-[500px]">
          
          <div className="space-y-6">
            
            {/* Search inputs header */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-border-custom pb-4">
              <div className="w-full sm:max-w-md relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customer, ID, phone..."
                    className="w-full rounded-lg border border-border-custom bg-white pl-8 pr-3 py-1.5 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
                  />
                  <LucideIcon name="Search" className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                </div>
                {activeTab === 'pet_profiles' && (
                  <button
                    type="button"
                    onClick={() => {
                      const generateRandomProfileId = () => {
                        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                        let result = '';
                        for (let i = 0; i < 8; i++) {
                          result += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        return result;
                      };
                      setModalFormData({
                        profile_id: generateRandomProfileId(),
                        order_id: '',
                        status: 'ACTIVE',
                        pet_name: '',
                        pet_type: 'dog',
                        pet_breed: '',
                        pet_age: '',
                        pet_photo: '',
                        public_message: 'If you found me, please contact my family.',
                        contact_method: 'both',
                        owner_phone: '',
                        alt_phone: '',
                        emergency_enabled: false,
                        emergency_name: '',
                        emergency_phone: '',
                        medical_info: '',
                        message: ''
                      });
                    }}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 px-3 text-[10px] font-black uppercase tracking-wider text-white transition-colors cursor-pointer shrink-0"
                  >
                    + Create Profile
                  </button>
                )}
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                {activeTab === 'pet_profiles' ? (
                  `Showing ${filteredProfiles.length} of ${profiles.length} Profiles`
                ) : (
                  `Showing ${filteredOrders.length} of ${orders.length} Records`
                )}
              </span>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
              {activeTab === 'pet_profiles' ? (
                /* Filtered Profiles List Column */
                <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-0 md:pr-4 border-r border-zinc-100">
                  {loadingProfiles ? (
                    <p className="text-xs text-zinc-400 italic text-center py-10">Loading pet profiles...</p>
                  ) : filteredProfiles.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic text-center py-10">No pet profiles found.</p>
                  ) : (
                    filteredProfiles.map((profile) => {
                      const isSelected = selectedProfileId === profile.profile_id;
                      return (
                        <div
                          key={profile.profile_id}
                          onClick={() => setSelectedProfileId(profile.profile_id)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-colors select-none ${
                            isSelected 
                              ? 'border-zinc-800 bg-zinc-50' 
                              : 'border-zinc-150 hover:bg-zinc-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Pet Thumbnail */}
                            {profile.pet_photo ? (
                              <img
                                src={profile.pet_photo}
                                alt={profile.pet_name}
                                className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                                <LucideIcon name="Heart" className="h-4.5 w-4.5 text-zinc-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-0.5">
                                <span className="text-xs font-bold text-zinc-900 truncate">
                                  {profile.pet_name}
                                </span>
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                                  profile.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-755 border-emerald-250'
                                    : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                                }`}>
                                  {profile.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-zinc-450 font-semibold">
                                <span>ID: {profile.profile_id}</span>
                                <span>Order: {profile.order_id}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Filtered Orders List Column */
                <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-0 md:pr-4 border-r border-zinc-100">
                  {loadingOrders ? (
                    <p className="text-xs text-zinc-400 italic text-center py-10">Loading submissions...</p>
                  ) : filteredOrders.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic text-center py-10">No matching orders found.</p>
                  ) : (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrderId === order.order_id;
                    const typeColors = 
                      order.order_type === 'memories' ? 'bg-red-50 text-red-750 border-red-200' :
                      order.order_type === 'service' ? 'bg-purple-50 text-purple-750 border-purple-200' :
                      order.order_type === 'digital_product' ? 'bg-emerald-50 text-emerald-755 border-emerald-200' :
                      'bg-blue-50 text-blue-750 border-blue-200';
                    
                    return (
                      <div
                        key={order.order_id}
                        onClick={() => setSelectedOrderId(order.order_id)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-colors select-none ${
                          isSelected 
                            ? 'border-zinc-800 bg-zinc-50' 
                            : 'border-zinc-150 hover:bg-zinc-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="text-[10px] font-black font-mono tracking-tight text-zinc-900">
                            {order.order_id}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${typeColors}`}>
                            {order.order_type === 'digital_product' ? 'digital' : order.order_type === 'general_inquiry' ? 'general' : order.order_type}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-zinc-800 truncate mb-1">
                          {order.customer?.name}
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold">
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          <span className={order.payment?.status === 'PAID' ? 'text-green-600 font-bold' : 'text-red-550 font-bold'}>
                            {order.payment?.status === 'PAID' ? 'PAID' : 'PENDING'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

              {/* Order / Profile Specific Detail Content Column */}
              <div className="md:col-span-7 space-y-6">
                {activeTab === 'pet_profiles' ? (
                  selectedProfile ? (
                    <div className="space-y-6 p-4 rounded-xl border border-border-custom bg-zinc-50/30 text-left">
                      <div className="flex justify-between items-start border-b border-zinc-200 pb-3 gap-3">
                        <div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block font-sans">Pet Profile Details</span>
                          <h3 className="text-sm font-black text-zinc-900 font-mono">ID: {selectedProfile.profile_id}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalFormData({ ...selectedProfile });
                            }}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-[10px] font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer shadow-3xs gap-1"
                          >
                            <LucideIcon name="Edit" className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleProfileStatus(selectedProfile.profile_id, selectedProfile.status)}
                            className={`inline-flex h-8 items-center justify-center rounded-lg border px-3 text-[10px] font-bold cursor-pointer shadow-3xs gap-1 ${
                              selectedProfile.status === 'ACTIVE'
                                ? 'border-amber-200 bg-amber-50 text-amber-750 hover:bg-amber-100/50'
                                : 'border-emerald-250 bg-emerald-50 text-emerald-755 hover:bg-emerald-100/50'
                            }`}
                          >
                            <LucideIcon name={selectedProfile.status === 'ACTIVE' ? 'EyeOff' : 'Eye'} className="h-3.5 w-3.5" />
                            {selectedProfile.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProfile(selectedProfile.profile_id)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-[10px] font-bold text-red-650 hover:bg-red-100/50 cursor-pointer shadow-3xs gap-1.5"
                          >
                            <LucideIcon name="Trash2" className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-zinc-700 bg-white border border-zinc-150 p-4 rounded-lg">
                        <p className="sm:col-span-2"><span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">🐾 Pet Info</span></p>
                        <p><span className="text-zinc-400">Pet Name:</span> {selectedProfile.pet_name}</p>
                        <p><span className="text-zinc-400">Pet Type:</span> <span className="uppercase">{selectedProfile.pet_type}</span></p>
                        <p><span className="text-zinc-400">Breed:</span> {selectedProfile.pet_breed || 'N/A'}</p>
                        <p><span className="text-zinc-400">Age:</span> {selectedProfile.pet_age || 'N/A'}</p>
                        
                        <p className="sm:col-span-2 pt-2 border-t border-zinc-100"><span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">📞 Owner Contact</span></p>
                        <p><span className="text-zinc-400">Primary Phone:</span> {selectedProfile.owner_phone}</p>
                        <p><span className="text-zinc-400">Alt Phone:</span> {selectedProfile.alt_phone || 'None'}</p>
                        <p><span className="text-zinc-400">Preferred Contact Method:</span> <span className="uppercase">{selectedProfile.contact_method}</span></p>
                        <p><span className="text-zinc-400">Linked Order ID:</span> <span className="font-mono">{selectedProfile.order_id}</span></p>

                        <p className="sm:col-span-2 pt-2 border-t border-zinc-100"><span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">🔗 NFC Tap URL Details</span></p>
                        <div className="sm:col-span-2 space-y-2">
                          <div>
                            <span className="text-zinc-450 text-[10px]">NFC Permanent Tap URL:</span>
                            <div className="flex gap-2 items-center mt-1">
                              <code className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 flex-1 break-all text-[10px] font-mono text-zinc-700 font-bold">
                                https://feelsneat.com/t/{selectedProfile.profile_id}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://feelsneat.com/t/${selectedProfile.profile_id}`);
                                  alert('Copied NFC Tap URL to clipboard!');
                                }}
                                className="px-2 py-1 border border-zinc-200 rounded text-[10px] font-bold hover:bg-zinc-50 active:bg-zinc-100 cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-zinc-450 text-[10px]">Public Profile URL:</span>
                            <div className="flex gap-2 items-center mt-1">
                              <code className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 flex-1 break-all text-[10px] font-mono text-zinc-700 font-bold">
                                https://feelsneat.com/p/{selectedProfile.profile_id}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://feelsneat.com/p/${selectedProfile.profile_id}`);
                                  alert('Copied Public Profile URL to clipboard!');
                                }}
                                className="px-2 py-1 border border-zinc-200 rounded text-[10px] font-bold hover:bg-zinc-50 active:bg-zinc-100 cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>

                        {selectedProfile.public_message && (
                          <p className="sm:col-span-2 pt-2 border-t border-zinc-100 font-normal text-zinc-550 leading-relaxed normal-case">
                            <span className="text-zinc-400 font-bold uppercase block text-[9px]">Public Finder Message:</span>
                            "{selectedProfile.public_message}"
                          </p>
                        )}

                        {selectedProfile.emergency_enabled && (
                          <p className="sm:col-span-2 pt-2 border-t border-zinc-100 font-semibold text-zinc-700">
                            <span className="text-red-650 font-bold uppercase block text-[9px]">Emergency Contact:</span>
                            {selectedProfile.emergency_name || 'Emergency Backup'} — {selectedProfile.emergency_phone}
                          </p>
                        )}

                        {(selectedProfile.medical_info || selectedProfile.message) && (
                          <div className="sm:col-span-2 pt-2 border-t border-zinc-100 space-y-1.5 normal-case font-normal text-zinc-550 leading-relaxed">
                            <span className="text-zinc-400 font-bold uppercase block text-[9px]">Medical & Temperament Notes</span>
                            {selectedProfile.medical_info && <p><strong className="text-zinc-600 font-semibold">Medical:</strong> {selectedProfile.medical_info}</p>}
                            {selectedProfile.message && <p><strong className="text-zinc-600 font-semibold">Instructions:</strong> {selectedProfile.message}</p>}
                          </div>
                        )}
                      </div>

                      {/* Pet Image Preview inside Admin */}
                      {selectedProfile.pet_photo && (
                        <div className="space-y-1.5">
                          <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Public Profile Photo</span>
                          <div className="max-w-[200px] rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-2xs aspect-square relative group">
                            <img src={selectedProfile.pet_photo} alt={selectedProfile.pet_name} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400 space-y-2">
                      <LucideIcon name="Heart" className="h-8 w-8 text-zinc-300 animate-pulse" />
                      <p className="text-xs italic">Select a pet profile from the list to preview details or modify settings.</p>
                    </div>
                  )
                ) : selectedOrder ? (() => {
                  const whatsappMsg = `Hi ${selectedOrder.customer?.name}! This is FeelsNeat. We received your order ${selectedOrder.order_id} for ${
                    selectedOrder.order_type === 'memories' ? 'Memories Artwork' : selectedOrder.product_id
                  }. Let's coordinate payment and setup.`;
                  const waLink = `https://wa.me/${selectedOrder.customer?.phone?.replace(/[+\s-]/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

                  return (
                    <div className="space-y-6 p-4 rounded-xl border border-border-custom bg-zinc-50/30">
                      {/* Control toolbar */}
                      <div className="flex justify-between items-start border-b border-zinc-200 pb-3 gap-3">
                        <div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block font-sans">Selected Order ID</span>
                          <h3 className="text-sm font-black text-zinc-900 font-mono">{selectedOrder.order_id}</h3>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-[#25D366] px-3 text-[10px] font-bold text-white hover:bg-[#128C7E] cursor-pointer shadow-3xs gap-1.5"
                          >
                            <LucideIcon name="MessageSquare" className="h-3.5 w-3.5" /> Chat WhatsApp
                          </a>
                          <button
                            onClick={() => handleDeleteOrder(selectedOrder.order_id)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-[10px] font-bold text-red-650 hover:bg-red-100/50 cursor-pointer shadow-3xs gap-1.5"
                          >
                            <LucideIcon name="Trash2" className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>

                      {/* Customer Info Card */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Customer Name</span>
                          <span className="text-xs font-semibold text-zinc-800">{selectedOrder.customer?.name}</span>
                        </div>
                        {selectedOrder.company && selectedOrder.company !== 'N/A' && (
                          <div>
                            <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Company / Organization</span>
                            <span className="text-xs font-semibold text-zinc-800">{selectedOrder.company}</span>
                          </div>
                        )}
                        <div>
                          <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Phone / WhatsApp</span>
                          <a href={`tel:${selectedOrder.customer?.phone}`} className="text-xs font-bold text-[#E30613] hover:underline block">{selectedOrder.customer?.phone}</a>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</span>
                          <a href={`mailto:${selectedOrder.customer?.email}`} className="text-xs font-bold text-foreground/80 hover:underline block">{selectedOrder.customer?.email}</a>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Date Submitted</span>
                          <span className="text-xs font-semibold text-zinc-800">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Shipping Address (For Memories Artwork) */}
                      {selectedOrder.customer?.address && (
                        <div className="border-t border-zinc-200 pt-4 space-y-1">
                          <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Shipping Address</span>
                          <p className="text-xs font-semibold text-zinc-800 leading-normal font-sans">
                            {selectedOrder.customer.address.line}, {selectedOrder.customer.address.city}, {selectedOrder.customer.address.state} - {selectedOrder.customer.address.pincode} ({selectedOrder.customer.address.country})
                          </p>
                        </div>
                      )}

                      {/* Order Type Specific Parameters Config Cards */}
                      {selectedOrder.order_type === 'memories' && (
                        <div className="border-t border-zinc-200 pt-4 space-y-3">
                          <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Memory Print Details</span>
                          <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white border border-zinc-150 p-3 rounded-lg font-semibold text-zinc-700">
                            <p><span className="text-zinc-400">Theme:</span> {selectedOrder.product?.memory_type}</p>
                            <p><span className="text-zinc-400">Dimensions:</span> {selectedOrder.product?.size}</p>
                            <p><span className="text-zinc-400">Quantity:</span> {selectedOrder.product?.quantity} pc</p>
                            <p className="sm:col-span-2">
                              <span className="text-zinc-400 block mb-0.5">Google Photos URL:</span>
                              <a href={selectedOrder.digital_memory?.google_photos_url} target="_blank" rel="noopener noreferrer" className="text-[#E30613] hover:underline block break-all font-mono text-[10px]">{selectedOrder.digital_memory?.google_photos_url}</a>
                            </p>
                            <p className="sm:col-span-2"><span className="text-zinc-400">Print Title:</span> {selectedOrder.memory_details?.title || 'None'}</p>
                            <p className="sm:col-span-2"><span className="text-zinc-400">Location:</span> {selectedOrder.memory_details?.location || 'None'}</p>
                            <p className="sm:col-span-2"><span className="text-zinc-400">Date/Year:</span> {selectedOrder.memory_details?.date || 'None'}</p>
                            <p className="sm:col-span-2"><span className="text-zinc-400">Caption:</span> {selectedOrder.memory_details?.caption || 'None'}</p>
                            {selectedOrder.memory_details?.design_notes && (
                              <p className="sm:col-span-2 bg-yellow-50/50 p-2 border border-yellow-100 rounded text-zinc-600 italic text-[11px] font-medium leading-normal">
                                &ldquo;{selectedOrder.memory_details.design_notes}&rdquo;
                              </p>
                            )}
                          </div>
                          
                          {/* Main Print Image Attachment Preview */}
                          {selectedOrder.photos?.main_photo && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center max-w-[280px]">
                                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Canvas Photo Preview</span>
                                <a
                                  href={selectedOrder.photos.main_photo}
                                  download={`canvas_${selectedOrder.order_id}.png`}
                                  className="inline-flex items-center gap-1 text-[9px] font-bold text-[#E30613] hover:underline cursor-pointer select-none"
                                >
                                  <LucideIcon name="Download" className="h-3 w-3" /> Download High-Res
                                </a>
                              </div>
                              <div className="max-w-[280px] rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-2xs aspect-[1.5/1] relative group">
                                <img src={selectedOrder.photos.main_photo} alt="Print Preview" className="w-full h-full object-cover" />
                                <a
                                  href={selectedOrder.photos.main_photo}
                                  download={`canvas_${selectedOrder.order_id}.png`}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 text-white font-bold text-xs gap-1.5 cursor-pointer"
                                >
                                  <LucideIcon name="Download" className="h-5 w-5 animate-bounce" />
                                  <span>Download Image File</span>
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Additional Photos Attachment Previews */}
                          {selectedOrder.photos?.additional_photos && selectedOrder.photos.additional_photos.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Additional Photo Attachments</span>
                              <div className="grid grid-cols-3 gap-2 max-w-[280px]">
                                {selectedOrder.photos.additional_photos.map((photo: string, idx: number) => (
                                  <div key={idx} className="relative group rounded-md border border-zinc-150 overflow-hidden bg-zinc-50 aspect-square">
                                    <img src={photo} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                                    <a
                                      href={photo}
                                      download={`additional_${selectedOrder.order_id}_${idx + 1}.png`}
                                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 text-white font-black text-[9px] gap-1 cursor-pointer"
                                    >
                                      <LucideIcon name="Download" className="h-3 w-3" /> Get
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedOrder.order_type === 'tap_tiles' && (
                        <div className="border-t border-zinc-200 pt-4 space-y-3">
                          <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tap Tile Details</span>

                          {selectedOrder.product_id === 'pets' ? (
                            <>
                              <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white border border-zinc-150 p-3 rounded-lg font-semibold text-zinc-700">
                                <p className="sm:col-span-2"><span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">🐾 Pet Info</span></p>
                                <p><span className="text-zinc-400">Pet Name:</span> {selectedOrder.pet_details?.pet_name || 'N/A'}</p>
                                <p><span className="text-zinc-400">Pet Type:</span> <span className="uppercase">{selectedOrder.pet_details?.pet_type || 'N/A'}</span></p>
                                <p><span className="text-zinc-400">Breed:</span> {selectedOrder.pet_details?.pet_breed || 'N/A'}</p>
                                <p><span className="text-zinc-400">Age:</span> {selectedOrder.pet_details?.pet_age || 'N/A'}</p>
                                {selectedOrder.pet_details?.pet_description && (
                                  <p className="sm:col-span-2 font-normal text-zinc-550 leading-relaxed normal-case"><span className="text-zinc-400 font-bold uppercase block text-[9px]">Description:</span> "{selectedOrder.pet_details.pet_description}"</p>
                                )}

                                <p className="sm:col-span-2 pt-2 border-t border-zinc-100"><span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">📦 Product Customization</span></p>
                                <p><span className="text-zinc-400">Format:</span> {selectedOrder.product?.size === 'magnet' ? 'Fridge Magnet (₹149)' : 'Art Keychain (₹199)'}</p>
                                <p><span className="text-zinc-400">Quantity:</span> {selectedOrder.product?.quantity || 1} pc</p>
                                {selectedOrder.memory_details?.title && (
                                  <p className="sm:col-span-2"><span className="text-zinc-400">Overlay Text on Tile:</span> "{selectedOrder.memory_details.title}"</p>
                                )}
                                {selectedOrder.pet_details?.alt_phone && (
                                  <p><span className="text-zinc-400">Alternative Phone:</span> {selectedOrder.pet_details.alt_phone}</p>
                                )}
                                {selectedOrder.memory_details?.design_notes && (
                                  <p className="sm:col-span-2 bg-yellow-50/50 p-2 border border-yellow-100 rounded text-[#1E1E1E] italic text-[11px] font-medium leading-normal normal-case">
                                    &ldquo;{selectedOrder.memory_details.design_notes}&rdquo;
                                  </p>
                                )}

                                <p className="sm:col-span-2 pt-2 border-t border-zinc-100"><span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">🔗 NFC Destination & Hosting</span></p>
                                <p><span className="text-zinc-400">Hosting Type:</span> <span className="font-bold text-zinc-900 uppercase">{selectedOrder.pet_details?.nfc_hosting_type === 'custom_url' ? 'CUSTOMER OWN URL' : 'FEELSNEAT HOSTED'}</span></p>
                                <p><span className="text-zinc-400">Hosting Fee:</span> <span className="font-bold text-zinc-900">₹{selectedOrder.pet_details?.nfc_hosting_type === 'custom_url' ? '0' : '99 (1 Year)'}</span></p>
                                
                                {selectedOrder.pet_details?.nfc_hosting_type === 'custom_url' ? (
                                  <>
                                    <p className="sm:col-span-2">
                                      <span className="text-zinc-400 block mb-0.5">NFC Destination Link (Custom URL):</span>
                                      <span className="flex items-center gap-2">
                                        <a href={selectedOrder.pet_details?.nfc_custom_url} target="_blank" rel="noopener noreferrer" className="text-[#E30613] hover:underline block break-all font-mono text-[10px]">{selectedOrder.pet_details?.nfc_custom_url || 'N/A'}</a>
                                        {selectedOrder.pet_details?.nfc_custom_url && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(selectedOrder.pet_details.nfc_custom_url);
                                              alert('NFC link copied!');
                                            }}
                                            className="text-[9px] bg-zinc-100 hover:bg-zinc-200 text-zinc-650 px-1.5 py-0.5 rounded uppercase font-bold shrink-0"
                                          >
                                            Copy Link
                                          </button>
                                        )}
                                      </span>
                                    </p>
                                    {selectedOrder.pet_details?.nfc_custom_url_notes && (
                                      <p className="sm:col-span-2 font-normal text-zinc-555 leading-relaxed normal-case"><span className="text-zinc-400 font-bold uppercase block text-[9px]">Custom Link Notes:</span> "{selectedOrder.pet_details.nfc_custom_url_notes}"</p>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {selectedOrder.pet_details?.nfc_hosting_start_date && (
                                      <p><span className="text-zinc-400">Start Date:</span> {new Date(selectedOrder.pet_details.nfc_hosting_start_date).toLocaleDateString()}</p>
                                    )}
                                    {selectedOrder.pet_details?.nfc_hosting_expiry_date && (
                                      <p><span className="text-zinc-400">Expiry Date:</span> {new Date(selectedOrder.pet_details.nfc_hosting_expiry_date).toLocaleDateString()}</p>
                                    )}
                                    {selectedOrder.pet_details?.nfc_hosting_status && (
                                      <p><span className="text-zinc-400">Hosting Status:</span> <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black text-[9px]">{selectedOrder.pet_details.nfc_hosting_status}</span></p>
                                    )}
                                    <p className="sm:col-span-2 pt-2 border-t border-zinc-100"><span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] block">Public Pet Profile Preview Details</span></p>
                                    <p><span className="text-zinc-400">Public Name:</span> {selectedOrder.pet_details?.nfc_profile?.public_name || 'N/A'}</p>
                                    <p><span className="text-zinc-400">Owner Contact:</span> {selectedOrder.pet_details?.nfc_profile?.owner_phone || 'N/A'}</p>
                                    <p><span className="text-zinc-400">Emergency Phone:</span> {selectedOrder.pet_details?.nfc_profile?.emergency_contact || 'N/A'}</p>
                                    {selectedOrder.pet_details?.nfc_profile?.medical_info && (
                                      <p className="sm:col-span-2 font-normal text-zinc-555 leading-relaxed normal-case"><span className="text-zinc-400 font-bold uppercase block text-[9px]">Medical/Important Info:</span> {selectedOrder.pet_details.nfc_profile.medical_info}</p>
                                    )}
                                    {selectedOrder.pet_details?.nfc_profile?.message && (
                                      <p className="sm:col-span-2 font-normal text-zinc-555 leading-relaxed normal-case"><span className="text-zinc-400 font-bold uppercase block text-[9px]">Public Scan Message:</span> "{selectedOrder.pet_details.nfc_profile.message}"</p>
                                    )}
                                  </>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white border border-zinc-150 p-3 rounded-lg font-semibold text-zinc-700">
                              <p><span className="text-zinc-400">Niche Category:</span> {selectedOrder.product_id || 'None'}</p>
                              <p><span className="text-zinc-400">Format:</span> {selectedOrder.product?.size === 'magnet' ? 'Fridge Magnet' : 'Art Keychain'}</p>
                              <p><span className="text-zinc-400">Design Style:</span> {selectedOrder.product?.memory_type || 'None'}</p>
                              <p><span className="text-zinc-400">Quantity:</span> {selectedOrder.product?.quantity || 1} pc</p>
                              <p className="sm:col-span-2">
                                <span className="text-zinc-400 block mb-0.5">NFC Destination Link:</span>
                                <a href={selectedOrder.digital_memory?.google_photos_url} target="_blank" rel="noopener noreferrer" className="text-[#E30613] hover:underline block break-all font-mono text-[10px]">{selectedOrder.digital_memory?.google_photos_url}</a>
                              </p>
                              {selectedOrder.memory_details?.title && (
                                <p className="sm:col-span-2"><span className="text-zinc-400">Overlay Text:</span> "{selectedOrder.memory_details.title}"</p>
                              )}
                              {selectedOrder.memory_details?.design_notes && (
                                <p className="sm:col-span-2 bg-yellow-50/50 p-2 border border-yellow-100 rounded text-[#1E1E1E] italic text-[11px] font-medium leading-normal">
                                  &ldquo;{selectedOrder.memory_details.design_notes}&rdquo;
                                </p>
                              )}
                            </div>
                          )}

                          {/* Canvas Photo Preview */}
                          {selectedOrder.photos?.main_photo && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center max-w-[280px]">
                                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Custom Artwork Print</span>
                                <a
                                  href={selectedOrder.photos.main_photo}
                                  download={`taptile_${selectedOrder.order_id}.png`}
                                  className="inline-flex items-center gap-1 text-[9px] font-bold text-[#E30613] hover:underline cursor-pointer select-none"
                                >
                                  <LucideIcon name="Download" className="h-3 w-3" /> Download High-Res
                                </a>
                              </div>
                              <div className="max-w-[280px] rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-2xs aspect-square relative group">
                                <img src={selectedOrder.photos.main_photo} alt="Print Preview" className="w-full h-full object-cover" />
                                <a
                                  href={selectedOrder.photos.main_photo}
                                  download={`taptile_${selectedOrder.order_id}.png`}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 text-white font-bold text-xs gap-1.5 cursor-pointer"
                                >
                                  <LucideIcon name="Download" className="h-5 w-5 animate-bounce" />
                                  <span>Download Image File</span>
                                </a>
                              </div>
                            </div>
                          )}

                          {/* PET NFC PROFILE MANAGEMENT SECTION */}
                          {selectedOrder.product_id === 'pets' && (() => {
                            const linkedProfile = profiles.find((p) => p.order_id === selectedOrder.order_id || p.profile_id === selectedOrder.nfc_profile_id);
                            const isCustomUrl = selectedOrder.pet_details?.nfc_hosting_type === 'custom_url';
                            
                            return (
                              <div className="border-t border-zinc-200 pt-4 space-y-3">
                                {!isCustomUrl && (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest text-left">NFC Pet Profile</span>
                                      {linkedProfile ? (
                                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                                          linkedProfile.status === 'ACTIVE' 
                                            ? 'bg-emerald-50 text-emerald-755 border-emerald-250' 
                                            : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                                        }`}>
                                          {linkedProfile.status}
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border bg-red-50 text-red-750 border-red-200">
                                          NOT CREATED
                                        </span>
                                      )}
                                    </div>

                                    {linkedProfile ? (
                                      <div className="bg-white border border-zinc-155 p-4 rounded-lg space-y-4 text-left">
                                        <div className="grid sm:grid-cols-2 gap-3 text-xs font-semibold text-zinc-700">
                                          <p><span className="text-zinc-400 font-bold">Profile ID:</span> <span className="font-mono text-[#E30613]">{linkedProfile.profile_id}</span></p>
                                          <p><span className="text-zinc-400 font-bold">Public Name:</span> {linkedProfile.pet_name}</p>
                                          <div className="sm:col-span-2 space-y-1">
                                            <span className="text-zinc-400 block text-[10px]">NFC Permanent Tap URL:</span>
                                            <div className="flex gap-2 items-center">
                                              <code className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 flex-1 break-all text-[10px] font-mono text-zinc-700">
                                                https://feelsneat.com/t/{linkedProfile.profile_id}
                                              </code>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  navigator.clipboard.writeText(`https://feelsneat.com/t/${linkedProfile.profile_id}`);
                                                  alert('Copied NFC Tap URL to clipboard!');
                                                }}
                                                className="px-2 py-1 border border-zinc-200 rounded text-[10px] font-bold hover:bg-zinc-50 active:bg-zinc-100 cursor-pointer"
                                              >
                                                Copy
                                              </button>
                                            </div>
                                          </div>
                                          <div className="sm:col-span-2 space-y-1">
                                            <span className="text-zinc-400 block text-[10px]">Public Profile URL:</span>
                                            <div className="flex gap-2 items-center">
                                              <code className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 flex-1 break-all text-[10px] font-mono text-zinc-700">
                                                https://feelsneat.com/p/{linkedProfile.profile_id}
                                              </code>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  navigator.clipboard.writeText(`https://feelsneat.com/p/${linkedProfile.profile_id}`);
                                                  alert('Copied Public Profile URL to clipboard!');
                                                }}
                                                className="px-2 py-1 border border-zinc-200 rounded text-[10px] font-bold hover:bg-zinc-50 active:bg-zinc-100 cursor-pointer"
                                              >
                                                Copy
                                              </button>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setModalFormData({ ...linkedProfile });
                                            }}
                                            className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-[10px] font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                                          >
                                            <LucideIcon name="Edit" className="h-3.5 w-3.5 mr-1" /> Edit Profile
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleProfileStatus(linkedProfile.profile_id, linkedProfile.status)}
                                            className={`inline-flex h-8 items-center justify-center rounded-lg border px-3 text-[10px] font-bold cursor-pointer ${
                                              linkedProfile.status === 'ACTIVE'
                                                ? 'border-amber-200 bg-amber-50 text-amber-750 hover:bg-amber-100/50'
                                                : 'border-emerald-250 bg-emerald-50 text-emerald-755 hover:bg-emerald-100/50'
                                            }`}
                                          >
                                            <LucideIcon name={linkedProfile.status === 'ACTIVE' ? 'EyeOff' : 'Eye'} className="h-3.5 w-3.5 mr-1" />
                                            {linkedProfile.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                          </button>
                                          <a
                                            href={`/p/${linkedProfile.profile_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-900 px-3 text-[10px] font-bold text-white hover:bg-zinc-800 cursor-pointer gap-1"
                                          >
                                            <LucideIcon name="ExternalLink" className="h-3.5 w-3.5" /> Preview Profile
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-white border border-zinc-155 p-4 rounded-lg text-center space-y-3">
                                        <p className="text-xs text-zinc-500 font-medium">No public pet profile has been created for this order yet.</p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const generateRandomProfileId = () => {
                                              const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                                              let result = '';
                                              for (let i = 0; i < 8; i++) {
                                                result += chars.charAt(Math.floor(Math.random() * chars.length));
                                              }
                                              return result;
                                            };

                                            setModalFormData({
                                              profile_id: generateRandomProfileId(),
                                              order_id: selectedOrder.order_id,
                                              status: 'ACTIVE',
                                              pet_name: selectedOrder.pet_details?.pet_name || '',
                                              pet_type: selectedOrder.pet_details?.pet_type || 'dog',
                                              pet_breed: selectedOrder.pet_details?.pet_breed || '',
                                              pet_age: selectedOrder.pet_details?.pet_age || '',
                                              pet_photo: selectedOrder.photos?.main_photo || '',
                                              public_message: selectedOrder.pet_details?.nfc_profile?.message || 'If you found me, please contact my family.',
                                              contact_method: 'both',
                                              owner_phone: selectedOrder.pet_details?.nfc_profile?.owner_phone || selectedOrder.customer?.phone || '',
                                              alt_phone: selectedOrder.pet_details?.alt_phone || '',
                                              emergency_enabled: !!(selectedOrder.pet_details?.nfc_profile?.emergency_contact),
                                              emergency_name: '',
                                              emergency_phone: selectedOrder.pet_details?.nfc_profile?.emergency_contact || '',
                                              medical_info: selectedOrder.pet_details?.nfc_profile?.medical_info || '',
                                              message: selectedOrder.pet_details?.nfc_profile?.message || ''
                                            });
                                          }}
                                          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 text-xs font-black uppercase tracking-wider text-white transition-colors cursor-pointer px-4"
                                        >
                                          Create Pet Profile
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Production Checklist */}
                                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3 text-left">
                                  <span className="block text-[10px] font-black text-zinc-555 uppercase tracking-widest">Pet Tag Production Checklist</span>
                                  <div className="space-y-2 text-xs font-semibold text-zinc-700">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isCustomUrl || !!linkedProfile}
                                        readOnly
                                        className="h-4 w-4 rounded border-zinc-300 text-[#E30613] focus:ring-[#E30613]"
                                      />
                                      <span className={(isCustomUrl || linkedProfile) ? 'text-emerald-700 font-bold' : 'text-zinc-400'}>
                                        {isCustomUrl ? 'NFC Custom Destination URL Provided ✓' : `Pet Profile Created ${linkedProfile ? '✓' : ''}`}
                                      </span>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isCustomUrl || !!linkedProfile}
                                        readOnly
                                        className="h-4 w-4 rounded border-zinc-300 text-[#E30613] focus:ring-[#E30613]"
                                      />
                                      <span className={(isCustomUrl || linkedProfile) ? 'text-emerald-700 font-bold' : 'text-zinc-400'}>
                                        {isCustomUrl ? 'NFC Custom Link Ready ✓' : `NFC URL Generated ${linkedProfile ? '✓' : ''}`}
                                      </span>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={!!selectedOrder.production?.nfc_chip_programmed}
                                        onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, {
                                          production: {
                                            ...selectedOrder.production,
                                            nfc_chip_programmed: e.target.checked
                                          }
                                        })}
                                        className="h-4 w-4 rounded border-zinc-300 text-[#E30613] focus:ring-[#E30613]"
                                      />
                                      <span>NFC Chip Programmed</span>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={!!selectedOrder.production?.nfc_tested}
                                        onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, {
                                          production: {
                                            ...selectedOrder.production,
                                            nfc_tested: e.target.checked
                                          }
                                        })}
                                        className="h-4 w-4 rounded border-zinc-300 text-[#E30613] focus:ring-[#E30613]"
                                      />
                                      <span>NFC Tested (Staff Verified)</span>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={!!selectedOrder.production?.quality_check}
                                        onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, {
                                          production: {
                                            ...selectedOrder.production,
                                            quality_check: e.target.checked
                                          }
                                        })}
                                        className="h-4 w-4 rounded border-zinc-300 text-[#E30613] focus:ring-[#E30613]"
                                      />
                                      <span>Quality Check Approved</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {selectedOrder.order_type === 'digital_product' && (
                        <div className="border-t border-zinc-200 pt-4 space-y-3">
                          <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Digital Template Details</span>
                          <div className="text-xs bg-white border border-zinc-150 p-3 rounded-lg font-semibold text-zinc-700 space-y-1.5">
                            <p><span className="text-zinc-400">Template ID:</span> {selectedOrder.product_id}</p>
                            <p><span className="text-zinc-400">Quantity:</span> {selectedOrder.product?.quantity} pc</p>
                            {selectedOrder.design_notes && (
                              <p className="bg-zinc-50 p-2 border border-zinc-150 rounded text-zinc-655 italic">
                                &ldquo;{selectedOrder.design_notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedOrder.order_type === 'service' && (
                        <div className="border-t border-zinc-200 pt-4 space-y-3">
                          <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Service Request Specifics</span>
                          <div className="text-xs bg-white border border-zinc-150 p-3 rounded-lg font-semibold text-zinc-700 space-y-2">
                            <p><span className="text-zinc-400">Service capability:</span> {selectedOrder.product_id}</p>
                            
                            {/* Website Dev */}
                            {selectedOrder.product_id === 'website-development' && selectedOrder.service_details && (
                              <>
                                <p>
                                  <span className="text-zinc-400 block mb-0.5">Instagram / Catalog page:</span>
                                  <a href={selectedOrder.service_details.instagram_page.startsWith('http') ? selectedOrder.service_details.instagram_page : `https://${selectedOrder.service_details.instagram_page}`} target="_blank" rel="noopener noreferrer" className="text-[#E30613] hover:underline block break-all">{selectedOrder.service_details.instagram_page}</a>
                                </p>
                                <p><span className="text-zinc-400">Platform Choice:</span> {selectedOrder.service_details.platform_preference || 'None'}</p>
                                <p><span className="text-zinc-400">Integrations needed:</span> {[
                                  selectedOrder.service_details.needs_whatsapp && 'WhatsApp checkout',
                                  selectedOrder.service_details.needs_payment && 'UPI Payment gateway',
                                  selectedOrder.service_details.needs_cms && 'CMS engine support',
                                  selectedOrder.service_details.needs_notifications && 'Automations'
                                  ].filter(Boolean).join(', ') || 'None'}</p>
                              </>
                            )}

                            {/* Security Review */}
                            {selectedOrder.product_id === 'security-review' && selectedOrder.service_details && (
                              <>
                                <p>
                                  <span className="text-zinc-400 block mb-0.5">Audit Target URL:</span>
                                  <a href={selectedOrder.service_details.audit_url} target="_blank" rel="noopener noreferrer" className="text-[#E30613] hover:underline block break-all">{selectedOrder.service_details.audit_url}</a>
                                </p>
                                <p><span className="text-zinc-400">Hosting Provider:</span> {selectedOrder.service_details.hosting_provider}</p>
                                <p><span className="text-zinc-400">Compliance target:</span> {selectedOrder.service_details.compliance_needs || 'None'}</p>
                                {selectedOrder.service_details.main_concerns && (
                                  <p className="bg-red-50/50 p-2 border border-red-100 rounded text-red-800 italic">
                                    &ldquo;{selectedOrder.service_details.main_concerns}&rdquo;
                                  </p>
                                )}
                              </>
                            )}

                            {/* AI Integration */}
                            {selectedOrder.product_id === 'ai-integration' && selectedOrder.service_details && (
                              <>
                                <p><span className="text-zinc-400">Pipeline Platform:</span> {selectedOrder.service_details.pipeline_platform}</p>
                                <p><span className="text-zinc-400">Preferred AI vendor:</span> {selectedOrder.service_details.agent_llm_vendor}</p>
                                <p><span className="text-zinc-400">Agent Automations:</span> {[
                                  selectedOrder.service_details.agent_needs_support && 'Customer Support Chat',
                                  selectedOrder.service_details.agent_needs_orders && 'Order Verification',
                                  selectedOrder.service_details.agent_needs_emails && 'Follow-up notifications'
                                  ].filter(Boolean).join(', ') || 'None'}</p>
                              </>
                            )}

                            {selectedOrder.design_notes && (
                              <p className="bg-zinc-50 p-2 border border-zinc-150 rounded text-zinc-650 italic">
                                &ldquo;{selectedOrder.design_notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedOrder.order_type === 'general_inquiry' && (
                        <div className="border-t border-zinc-200 pt-4 space-y-3">
                          <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">General Inquiry Message</span>
                          <div className="text-xs bg-white border border-zinc-150 p-3 rounded-lg font-semibold text-zinc-700">
                            <p className="whitespace-pre-wrap leading-relaxed font-sans">&ldquo;{selectedOrder.design_notes}&rdquo;</p>
                          </div>
                        </div>
                      )}

                      {/* Payment Settings Controller */}
                      <div className="border-t border-zinc-200 pt-4 space-y-4">
                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">State & Payment Controls</span>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-foreground/60 mb-1">Payment Status</label>
                            <select
                              value={selectedOrder.payment?.status || 'AWAITING_PAYMENT'}
                              onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, { payment: { status: e.target.value } })}
                              className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
                            >
                              <option value="AWAITING_PAYMENT">Unpaid / Awaiting Payment</option>
                              <option value="PAID">Paid</option>
                              <option value="CANCELLED">Cancelled</option>
                              <option value="REFUNDED">Refunded</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-foreground/60 mb-1">Payment Reference</label>
                            <input
                              type="text"
                              value={selectedOrder.payment?.reference || ''}
                              onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, { payment: { reference: e.target.value } })}
                              className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
                              placeholder="UPI Txn reference number"
                            />
                          </div>

                          {selectedOrder.product_id === 'pets' ? (
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-foreground/60 mb-1">Order / Inquiry Status</label>
                              <select
                                  value={selectedOrder.production?.design_status || 'NEW REQUEST'}
                                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, { production: { design_status: e.target.value } })}
                                  className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
                                >
                                <option value="NEW REQUEST">NEW REQUEST</option>
                                <option value="REVIEWING">REVIEWING</option>
                                <option value="CONTACTED">CONTACTED</option>
                                <option value="DETAILS CONFIRMED">DETAILS CONFIRMED</option>
                                <option value="PAYMENT PENDING">PAYMENT PENDING</option>
                                <option value="PAID">PAID</option>
                                <option value="PROFILE SETUP">PROFILE SETUP</option>
                                <option value="IN PRODUCTION">IN PRODUCTION</option>
                                <option value="QUALITY CHECK">QUALITY CHECK</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                          ) : selectedOrder.order_type === 'memories' ? (
                            <>
                              <div>
                                <label className="block text-[10px] font-bold text-foreground/60 mb-1">Design Status</label>
                                <select
                                  value={selectedOrder.production?.design_status || 'NEW'}
                                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, { production: { design_status: e.target.value } })}
                                  className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
                                >
                                  <option value="NEW">New Draft</option>
                                  <option value="APPROVED">Layout Approved</option>
                                  <option value="DELIVERED">Delivered / Shipped</option>
                                  <option value="CANCELLED">Cancelled</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-foreground/60 mb-1">NFC Status</label>
                                <select
                                  value={selectedOrder.production?.nfc_status || 'NEW'}
                                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, { production: { nfc_status: e.target.value } })}
                                  className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
                                >
                                  <option value="NEW">Pending Programming</option>
                                  <option value="PROGRAMMED">NFC Sticky Programmed</option>
                                </select>
                              </div>
                            </>
                          ) : (
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-foreground/60 mb-1">Order / Inquiry Status</label>
                              <select
                                  value={selectedOrder.production?.design_status || 'NEW'}
                                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, { production: { design_status: e.target.value } })}
                                  className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
                                >
                                <option value="NEW">New Submission</option>
                                <option value="CONTACTED">Client Contacted</option>
                                <option value="IN_PROGRESS">Project In Progress</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400 space-y-2">
                    <LucideIcon name="Inbox" className="h-8 w-8 text-zinc-300 animate-pulse" />
                    <p className="text-xs italic">Select an order or inquiry to check its specifications and proceed.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* PET PROFILE CREATION/EDITING MODAL */}
      {modalFormData && (() => {
        const isNew = !profiles.some((p) => p.profile_id === modalFormData.profile_id);
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!modalFormData.pet_name?.trim()) {
            alert('Pet Name is required.');
            return;
          }
          if (!modalFormData.owner_phone?.trim()) {
            alert('Owner Contact Phone is required.');
            return;
          }
          
          handleSaveProfile({
            ...modalFormData,
            updated_at: new Date().toISOString(),
            created_at: modalFormData.created_at || new Date().toISOString()
          });
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-zinc-200 shadow-2xl p-6 text-left space-y-4 text-black animate-slide-up">
              <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-900">
                  {isNew ? 'Create Pet NFC Profile' : 'Edit Pet NFC Profile'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalFormData(null)}
                  className="text-zinc-400 hover:text-zinc-650 cursor-pointer"
                >
                  <LucideIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-zinc-700">
                
                {/* Photo Preview & Base64 input */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Pet Photo</label>
                  <div className="flex items-center gap-4">
                    {modalFormData.pet_photo ? (
                      <img
                        src={modalFormData.pet_photo}
                        alt="Pet Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-zinc-250 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col items-center justify-center text-zinc-400 shrink-0">
                        <LucideIcon name="Camera" className="h-6 w-6 stroke-[1.5]" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] text-zinc-450 leading-relaxed normal-case">Photo is pre-loaded from customer request. You can also paste another base64 string or image url below:</p>
                      <input
                        type="text"
                        value={modalFormData.pet_photo || ''}
                        onChange={(e) => setModalFormData((prev: any) => ({ ...prev, pet_photo: e.target.value }))}
                        placeholder="data:image/png;base64,... or https://"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#E30613] font-mono text-[#1E1E1E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Identity Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pet Name *</label>
                    <input
                      type="text"
                      required
                      value={modalFormData.pet_name || ''}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, pet_name: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pet Type *</label>
                    <select
                      value={modalFormData.pet_type || 'dog'}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, pet_type: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                    >
                      <option value="dog">DOG</option>
                      <option value="cat">CAT</option>
                      <option value="other">OTHER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Breed (Optional)</label>
                    <input
                      type="text"
                      value={modalFormData.pet_breed || ''}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, pet_breed: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Age (Optional)</label>
                    <input
                      type="text"
                      value={modalFormData.pet_age || ''}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, pet_age: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                    />
                  </div>
                </div>

                {/* Finder Message */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Public Finder Message *</label>
                  <textarea
                    required
                    rows={2}
                    value={modalFormData.public_message || ''}
                    onChange={(e) => setModalFormData((prev: any) => ({ ...prev, public_message: e.target.value }))}
                    placeholder="e.g. If you found me, please contact my family."
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E] leading-relaxed normal-case"
                  />
                </div>

                {/* Contact Settings */}
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-3">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Contact Method *</label>
                    <select
                      value={modalFormData.contact_method || 'both'}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, contact_method: e.target.value as any }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                    >
                      <option value="both">BOTH (CALL & WHATSAPP)</option>
                      <option value="whatsapp">WHATSAPP ONLY</option>
                      <option value="call">PHONE CALL ONLY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Primary Owner Phone *</label>
                    <input
                      type="text"
                      required
                      value={modalFormData.owner_phone || ''}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, owner_phone: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Alternative Phone (Optional)</label>
                    <input
                      type="text"
                      value={modalFormData.alt_phone || ''}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, alt_phone: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Linked Order ID *</label>
                    <input
                      type="text"
                      required
                      disabled={!isNew}
                      value={modalFormData.order_id || ''}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, order_id: e.target.value }))}
                      placeholder="e.g. FN-PET-FCIF"
                      className={`w-full rounded-lg border border-zinc-200 px-3 py-2 focus:outline-none font-mono ${
                        !isNew ? 'bg-zinc-50 text-zinc-500' : 'bg-white text-black'
                      }`}
                    />
                  </div>
                </div>

                {/* Backup Emergency Toggle & fields */}
                <div className="border-t border-zinc-100 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-900 uppercase tracking-wider text-left">Enable Backup Emergency Contact</label>
                      <span className="text-[9px] text-zinc-450 font-bold block mt-0.5 normal-case text-left">Add a backup phone if primary owner doesn't respond.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!modalFormData.emergency_enabled}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, emergency_enabled: e.target.checked }))}
                      className="h-4 w-4 rounded border-zinc-300 text-[#E30613] focus:ring-[#E30613] cursor-pointer"
                    />
                  </div>

                  {modalFormData.emergency_enabled && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <div>
                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider mb-1">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={modalFormData.emergency_name || ''}
                          onChange={(e) => setModalFormData((prev: any) => ({ ...prev, emergency_name: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider mb-1">Emergency Contact Phone</label>
                        <input
                          type="text"
                          value={modalFormData.emergency_phone || ''}
                          onChange={(e) => setModalFormData((prev: any) => ({ ...prev, emergency_phone: e.target.value }))}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical & Temperament notes */}
                <div className="border-t border-zinc-100 pt-3 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <span className="block text-[10px] font-black text-zinc-900 uppercase tracking-wider mb-0.5 font-sans text-left">Medical & Temperament Notes</span>
                    <p className="text-[9px] text-zinc-450 normal-case mb-2 font-bold leading-normal text-left">These notes will help finders understand how to treat your pet safely.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Medical / Health Notes</label>
                    <textarea
                      rows={2}
                      value={modalFormData.medical_info || ''}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, medical_info: e.target.value }))}
                      placeholder="e.g. Requires daily medication"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E] leading-relaxed normal-case"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Temperament / Approach</label>
                    <textarea
                      rows={2}
                      value={modalFormData.message || ''}
                      onChange={(e) => setModalFormData((prev: any) => ({ ...prev, message: e.target.value }))}
                      placeholder="e.g. Friendly but nervous around strangers"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 focus:outline-none text-[#1E1E1E] leading-relaxed normal-case"
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="border-t border-zinc-150 pt-4 flex justify-between items-center">
                  <div className="text-[10px] font-semibold text-zinc-400 uppercase">
                    Profile ID: <span className="font-mono text-black font-bold">{modalFormData.profile_id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalFormData(null)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#E30613] hover:bg-zinc-900 px-4 text-xs font-black uppercase tracking-wider text-white transition-colors cursor-pointer"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
