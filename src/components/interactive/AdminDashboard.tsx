'use client';

import { useState, useEffect } from 'react';
import { LucideIcon } from '../ui/LucideIcon';

interface AdminDashboardProps {
  userEmail: string;
}

export function AdminDashboard({ userEmail }: AdminDashboardProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'memories' | 'service' | 'digital_product' | 'general_inquiry'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

  useEffect(() => {
    loadOrders();
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

  const selectedOrder = orders.find((o) => o.order_id === selectedOrderId);

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
              <div className="w-full sm:max-w-xs relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer, ID, phone..."
                  className="w-full rounded-lg border border-border-custom bg-white pl-8 pr-3 py-1.5 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
                />
                <LucideIcon name="Search" className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Showing {filteredOrders.length} of {orders.length} Records
              </span>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
              {/* Filtered Orders List Column */}
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

              {/* Order Specific Detail Content Column */}
              <div className="md:col-span-7 space-y-6">
                {selectedOrder ? (() => {
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

                          {selectedOrder.order_type === 'memories' ? (
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
                                  className="w-full rounded-lg border border-border-custom bg-white px-3 py-2 text-xs focus:border-foreground focus:outline-none text-[#1E1E1E]"
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
    </div>
  );
}
