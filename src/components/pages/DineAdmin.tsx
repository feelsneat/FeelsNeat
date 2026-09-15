'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LucideIcon } from '@/components/ui/LucideIcon';

export default function DineAdminPage() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [login, setLogin] = useState({ restaurant_name: '', email: '', password: '' });
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'menu' | 'tables' | 'settings'>('dashboard');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [itemForm, setItemForm] = useState({ id: '', name: '', description: '', price: '', category_id: '', image: '', available: true, active: true });
  const [categoryName, setCategoryName] = useState('');
  const [tableName, setTableName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [savingItem, setSavingItem] = useState(false);
  const knownPendingOrders = useRef<Set<string>>(new Set());

  const load = async () => {
    const res = await fetch('/api/dine/restaurant');
    if (res.ok) {
      setData(await res.json());
      setIsAuthed(true);
    } else {
      setIsAuthed(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!isAuthed) return;
    const timer = setInterval(load, 6000);
    return () => clearInterval(timer);
  }, [isAuthed]);

  useEffect(() => {
    const pending = (data?.orders || []).filter((order: any) => order.status === 'PENDING_CONFIRMATION');
    const pendingIds = new Set<string>(pending.map((order: any) => String(order.id)));
    const hasNewPending = pending.some((order: any) => !knownPendingOrders.current.has(order.id));
    if (notificationsEnabled && knownPendingOrders.current.size > 0 && hasNewPending) {
      playOrderSound();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Dine Assist order', { body: `${data.restaurant?.name || 'Restaurant'} has a new order waiting.` });
      }
    }
    knownPendingOrders.current = pendingIds;
  }, [data?.orders, notificationsEnabled, data?.restaurant?.name]);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/dine/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(login),
    });
    const result = await res.json();
    if (res.ok) await load();
    else setError(result.error || 'Invalid login.');
  };

  const action = async (payload: any) => {
    try {
      const res = await fetch('/api/dine/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Update failed.');
        return false;
      }
      setData(result);
      setError('');
      return true;
    } catch {
      setError('Network error. Please try saving again.');
      return false;
    }
  };

  const printAllQrCodes = () => {
    if (!data?.restaurant) return;
    const cards = data.tables.map((table: any) => {
      const url = `${origin}/dine/${data.restaurant.slug}/table/${table.token}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
      return `<section><img src="${qr}" alt="${table.name} QR" /><h2>${table.name}</h2><p>${url}</p></section>`;
    }).join('');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${data.restaurant.name} QR Codes</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}section{border:1px solid #ddd;padding:18px;border-radius:8px;page-break-inside:avoid}img{width:180px;height:180px}h2{font-size:18px;margin:10px 0 4px}p{font-size:10px;word-break:break-all;color:#555}@media print{button{display:none}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}</style></head><body><button onclick="window.print()">Print / Save PDF</button><h1>${data.restaurant.name} Table QR Codes</h1><div class="grid">${cards}</div></body></html>`);
    win.document.close();
  };

  const renameTable = (table: any) => {
    const name = window.prompt('Table name', table.name);
    if (!name || !name.trim()) return;
    action({ action: 'save_table', id: table.id, name: name.trim(), active: table.active });
  };

  const editItem = (item: any) => {
    setItemForm({
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      image: item.image || '',
      available: item.available,
      active: item.active,
    });
  };

  const resetItemForm = (categoryId = itemForm.category_id) => {
    setItemForm({ id: '', name: '', description: '', price: '', category_id: categoryId, image: '', available: true, active: true });
  };

  const saveItem = async () => {
    if (savingItem) return;
    if (!itemForm.category_id || !itemForm.name.trim() || !itemForm.price) {
      setError('Choose a category, item name, and price before saving.');
      return;
    }
    setSavingItem(true);
    const categoryId = itemForm.category_id;
    const ok = await action({ action: 'save_item', ...itemForm, name: itemForm.name.trim() });
    setSavingItem(false);
    if (ok) resetItemForm(categoryId);
  };

  const handleItemImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file for the menu item.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Please keep menu item images under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setItemForm((prev) => ({ ...prev, image: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      setCopyMessage('Copied URL.');
      window.setTimeout(() => setCopyMessage(''), 1800);
    } catch {
      setError('Copy failed. Long-press or select the URL to copy it manually.');
    }
  };

  const enableOrderNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    setNotificationsEnabled(true);
    playOrderSound();
  };

  const renameCategory = (category: any) => {
    const name = window.prompt('Category name', category.name);
    if (!name || !name.trim()) return;
    action({ action: 'save_category', id: category.id, name: name.trim(), active: category.active });
  };

  const saveSettings = (field: string, label: string, currentValue: string) => {
    const value = window.prompt(label, currentValue || '');
    if (value === null) return;
    action({ action: 'update_settings', ...data.restaurant, [field]: value.trim() });
  };

  const counts = useMemo(() => {
    const orders = data?.orders || [];
    return {
      new: orders.filter((order: any) => order.status === 'PENDING_CONFIRMATION').length,
      confirmed: orders.filter((order: any) => order.status === 'CONFIRMED').length,
      preparing: orders.filter((order: any) => order.status === 'PREPARING').length,
      ready: orders.filter((order: any) => order.status === 'READY').length,
    };
  }, [data]);

  if (isAuthed === null) {
    return <main className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center"><p className="text-sm font-bold">Loading restaurant portal...</p></main>;
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-4">
        <form onSubmit={submitLogin} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0E0E12] p-6 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#E30613]">Dine Assist</p>
            <h1 className="mt-2 text-xl font-black uppercase">Restaurant Portal</h1>
            <p className="mt-2 text-xs text-[#F4F4F5]/60 font-semibold">Sign in to manage your restaurant menu, tables and orders. Use the login details provided by FeelsNeat.</p>
          </div>
          {error && <div className="rounded-lg border border-red-900 bg-red-950/30 p-3 text-xs font-bold text-red-200">{error}</div>}
          <input value={login.restaurant_name} onChange={(e) => setLogin((prev) => ({ ...prev, restaurant_name: e.target.value }))} placeholder="Restaurant / store name" className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-[#E30613]" />
          <input type="email" value={login.email} onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email or username" className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-[#E30613]" />
          <input type="password" value={login.password} onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-[#E30613]" />
          <button className="h-11 w-full rounded-lg bg-[#E30613] text-xs font-black uppercase tracking-widest text-white">Sign In</button>
        </form>
      </main>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-black">
      <header className="bg-black text-white p-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-white/60 font-bold uppercase">Dine Assist</p>
            <h1 className="text-sm font-black uppercase">{data.restaurant?.name}</h1>
            <p className="text-[10px] text-white/60 font-bold uppercase">Dine Assist Restaurant Portal</p>
          </div>
          <a href="/api/dine/auth/logout" className="text-[10px] font-black uppercase text-white/70">Sign out</a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        {data.session?.impersonated_by_admin && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>FeelsNeat Admin Access — viewing this restaurant on behalf of the restaurant account.</span>
            <a href="/admin" className="rounded-lg bg-black px-3 py-2 text-[10px] font-black uppercase text-white text-center">Return to FeelsNeat Admin</a>
          </div>
        )}
        <nav className="grid grid-cols-5 gap-2">
          {[
            ['dashboard', 'Dashboard', 'LayoutDashboard'],
            ['orders', 'Orders', 'ReceiptText'],
            ['menu', 'Menu', 'Utensils'],
            ['tables', 'Tables', 'QrCode'],
            ['settings', 'Settings', 'Settings'],
          ].map(([id, label, icon]) => (
            <button key={id} onClick={() => setActiveView(id as any)} className={`rounded-xl border p-3 text-[10px] font-black uppercase flex flex-col items-center gap-1 ${activeView === id ? 'bg-[#E30613] text-white border-[#E30613]' : 'bg-white border-zinc-200 text-zinc-600'}`}>
              <LucideIcon name={icon} className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">{error}</div>}
        {copyMessage && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700">{copyMessage}</div>}

        {activeView === 'dashboard' && (
          <section className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest">Order alerts</h2>
                <p className="mt-1 text-xs font-semibold text-zinc-500">Enable browser notifications and sound for new orders on this device.</p>
              </div>
              <SmallButton label={notificationsEnabled ? 'Alerts enabled' : 'Enable sound alerts'} onClick={enableOrderNotifications} muted={notificationsEnabled} />
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              {[
                ['New orders', counts.new],
                ['Confirmed', counts.confirmed],
                ['Preparing', counts.preparing],
                ['Ready', counts.ready],
              ].map(([label, count]) => (
                <div key={label} className="rounded-xl border border-zinc-200 bg-white p-5">
                  <p className="text-[10px] font-black uppercase text-zinc-400">{label}</p>
                  <p className="text-3xl font-black mt-2">{count}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(activeView === 'orders' || activeView === 'dashboard') && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Orders</h2>
            {(data.orders || []).length === 0 ? <p className="text-sm text-zinc-500 font-semibold">No orders yet.</p> : data.orders.map((order: any) => {
              const table = data.tables.find((candidate: any) => candidate.id === order.table_id);
              return (
                <div key={order.id} className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black uppercase">
                        {order.order_type === 'ADD_ON'
                          ? `Add-on ${order.add_on_sequence || ''} for Order #${order.parent_order_number}`
                          : `Order #${order.order_number}`}
                      </h3>
                      <p className="text-xs text-zinc-500 font-bold">
                        {table?.name} | Code {order.verification_code}
                        {order.order_type === 'ADD_ON' && ` | Add-on order #${order.order_number}`}
                      </p>
                    </div>
                    <div className="text-right">
                      {order.order_type === 'ADD_ON' && <p className="mb-1 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black uppercase text-amber-700">Linked add-on</p>}
                      <span className="text-[10px] font-black uppercase text-[#E30613]">{order.status.replaceAll('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-zinc-700 space-y-1">
                    {order.items.map((item: any) => <p key={item.item_id}>{item.quantity} x {item.name} <span className="float-right">₹{item.line_total}</span></p>)}
                  </div>
                  <p className="text-sm font-black">Total ₹{order.total}</p>
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'PENDING_CONFIRMATION' && <><SmallButton label="Confirm order" onClick={() => action({ action: 'update_order_status', order_id: order.id, status: 'CONFIRMED' })} /><SmallButton label="Reject" muted onClick={() => action({ action: 'update_order_status', order_id: order.id, status: 'REJECTED' })} /></>}
                    {order.status === 'CONFIRMED' && <SmallButton label="Start preparation" onClick={() => action({ action: 'update_order_status', order_id: order.id, status: 'PREPARING' })} />}
                    {order.status === 'PREPARING' && <SmallButton label="Mark ready" onClick={() => action({ action: 'update_order_status', order_id: order.id, status: 'READY' })} />}
                    {order.status === 'READY' && <SmallButton label="Complete" onClick={() => action({ action: 'update_order_status', order_id: order.id, status: 'COMPLETED' })} />}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {activeView === 'menu' && (
          <section className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
              <h2 className="text-xs font-black uppercase">Add category</h2>
              <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs" placeholder="Category name" />
              <SmallButton label="Save category" onClick={() => { action({ action: 'save_category', name: categoryName }); setCategoryName(''); }} />
            </div>
            <div className="lg:col-span-8 rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs font-black uppercase">{itemForm.id ? 'Edit item' : 'Add item'}</h2>
                {itemForm.id && <button onClick={() => resetItemForm()} className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase">Cancel edit</button>}
              </div>
              <select value={itemForm.category_id} onChange={(e) => setItemForm((prev) => ({ ...prev, category_id: e.target.value }))} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs">
                <option value="">Choose category</option>
                {data.categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={itemForm.name} onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))} className="rounded-lg border border-zinc-200 px-3 py-2 text-xs" placeholder="Item name" />
                <input value={itemForm.price} onChange={(e) => setItemForm((prev) => ({ ...prev, price: e.target.value }))} type="number" className="rounded-lg border border-zinc-200 px-3 py-2 text-xs" placeholder="Price" />
              </div>
              <input value={itemForm.description} onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs" placeholder="Description" />
              <div className="grid sm:grid-cols-[120px_1fr] gap-3 items-center">
                <div className="h-24 w-24 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center">
                  {itemForm.image ? <img src={itemForm.image} alt="Item preview" className="h-full w-full object-cover" /> : <LucideIcon name="Image" className="h-5 w-5 text-zinc-400" />}
                </div>
                <label className="rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-4 text-center text-[10px] font-black uppercase text-zinc-500 cursor-pointer">
                  Add item image
                  <input type="file" accept="image/*" onChange={(e) => handleItemImage(e.target.files?.[0])} className="hidden" />
                </label>
              </div>
              <SmallButton label={savingItem ? 'Saving...' : itemForm.id ? 'Save changes' : 'Save item'} onClick={saveItem} disabled={savingItem} />
            </div>
            <div className="lg:col-span-12 space-y-5">
              {data.categories.map((category: any) => (
                <section key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">{category.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => renameCategory(category)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black uppercase">Rename</button>
                      <button onClick={() => action({ action: 'save_category', id: category.id, name: category.name, active: !category.active })} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black uppercase">{category.active ? 'Hide' : 'Show'}</button>
                      <button onClick={() => action({ action: 'delete_category', category_id: category.id })} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black uppercase text-red-700">Delete</button>
                    </div>
                  </div>
                  {data.items.filter((item: any) => item.category_id === category.id).map((item: any) => (
                    <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-start gap-3">
                          {item.image && <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover border border-zinc-200" />}
                          <div>
                            <h3 className="text-sm font-black">{item.name} <span className="text-zinc-400">₹{item.price}</span></h3>
                            <p className="text-xs text-zinc-500 font-semibold">{item.description || 'No description'}</p>
                            <p className="text-[10px] font-black uppercase text-zinc-400">{item.active ? 'Visible' : 'Hidden'} · {item.available ? 'Available' : 'Sold out'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => editItem(item)} className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase">Edit</button>
                        <button onClick={() => action({ action: 'toggle_item', item_id: item.id, available: !item.available })} className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase ${item.available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {item.available ? 'Available' : 'Sold out'}
                        </button>
                        <button onClick={() => action({ action: 'save_item', id: item.id, category_id: item.category_id, name: item.name, description: item.description || '', price: item.price, available: item.available, active: !item.active })} className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase">
                          {item.active ? 'Hide' : 'Show'}
                        </button>
                        <button onClick={() => action({ action: 'delete_item', item_id: item.id })} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black uppercase text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </section>
        )}

        {activeView === 'tables' && (
          <section className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row gap-3">
              <input value={tableName} onChange={(e) => setTableName(e.target.value)} className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs" placeholder="New table name" />
              <SmallButton label="Add table" onClick={() => { action({ action: 'save_table', name: tableName }); setTableName(''); }} />
              <SmallButton label="Download all QR" onClick={printAllQrCodes} muted />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.tables.map((table: any) => {
                const url = `${origin}/dine/${data.restaurant.slug}/table/${table.token}`;
                const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
                return (
                  <div key={table.id} className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-black">{table.name}</h3>
                      <span className="text-[10px] font-black uppercase text-emerald-600">{table.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <img src={qr} alt={`${table.name} QR`} className="h-32 w-32 bg-zinc-50 border border-zinc-200 rounded-lg" />
                    <p className="text-[10px] font-mono break-all text-zinc-500">{url}</p>
                    <div className="flex flex-wrap gap-2">
                      <a href={qr} download className="rounded-lg bg-black px-3 py-2 text-[10px] font-black uppercase text-white">Download QR</a>
                      <button onClick={() => copyText(url)} className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase">Copy URL</button>
                      <button onClick={() => renameTable(table)} className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase">Rename</button>
                      <button onClick={() => action({ action: 'save_table', id: table.id, name: table.name, active: !table.active })} className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase">
                        {table.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => action({ action: 'delete_table', table_id: table.id })} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black uppercase text-red-700">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeView === 'settings' && (
          <section className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
            <h2 className="text-xs font-black uppercase">Restaurant settings</h2>
            <p className="text-sm font-bold">{data.restaurant.name}</p>
            <p className="text-xs text-zinc-500 font-semibold">{data.restaurant.location}</p>
            <div className="flex flex-wrap gap-2">
              <SmallButton label="Edit name" muted onClick={() => saveSettings('name', 'Restaurant name', data.restaurant.name)} />
              <SmallButton label="Edit location" muted onClick={() => saveSettings('location', 'Location', data.restaurant.location)} />
              <SmallButton label="Edit contact" muted onClick={() => saveSettings('contact_person', 'Contact person', data.restaurant.contact_person)} />
              <SmallButton label="Edit phone" muted onClick={() => saveSettings('phone', 'Phone', data.restaurant.phone)} />
            </div>
            <select value={data.restaurant.payment_preference} onChange={(e) => action({ action: 'update_settings', payment_preference: e.target.value })} className="rounded-lg border border-zinc-200 px-3 py-2 text-xs">
              <option value="pay_at_restaurant">Pay at restaurant</option>
              <option value="online_payment">Online payment</option>
              <option value="not_decided">Not decided</option>
            </select>
          </section>
        )}
      </div>
    </main>
  );
}

function SmallButton({ label, onClick, muted, disabled }: { label: string; onClick: () => void; muted?: boolean; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider disabled:opacity-50 ${muted ? 'border border-zinc-200 bg-white text-zinc-700' : 'bg-[#E30613] text-white'}`}>{label}</button>;
}

function playOrderSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.32);
  } catch (_) {}
}
