'use client';

import { useCallback, useEffect, useState } from 'react';
import { createReviewCardStickerSvg, REVIEW_CARD_STICKER_HEIGHT_MM, REVIEW_CARD_STICKER_WIDTH_MM } from '@/lib/review-card-sticker';
import { REVIEW_CARD_STATUS, type ReviewCardMaterial, type ReviewCardOrder, type ReviewCardPrintRun } from '@/lib/review-card-types';

const STATUS_LABELS: Record<(typeof REVIEW_CARD_STATUS)[number], string> = {
  NEW: 'New request',
  DESIGN_REVIEW: 'Design review',
  APPROVED: 'Approved',
  PRINTED: 'Printed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function ReviewCardsAdmin() {
  const [orders, setOrders] = useState<ReviewCardOrder[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [stickerText, setStickerText] = useState('');
  const [material, setMaterial] = useState<ReviewCardMaterial>('WHITE_PAPER');
  const [adminNotes, setAdminNotes] = useState('');
  const [copies, setCopies] = useState('1');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewSvg, setPreviewSvg] = useState('');
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [migratingLogos, setMigratingLogos] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    businessName: '',
    googleReviewUrl: '',
    customerName: '',
    phone: '',
    whatsapp: '',
    quantity: '10',
    material: 'WHITE_PAPER' as ReviewCardMaterial,
    stickerText: 'Review us on Google',
    notes: '',
  });
  const selectedOrder = orders.find((order) => order.id === selectedId) || null;

  const refreshOrders = useCallback(async (preferredId?: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/review-cards/admin');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load Review Cards orders.');
      const loadedOrders = result.orders as ReviewCardOrder[];
      setOrders(loadedOrders);
      setSelectedId((currentId) => {
        const nextId = preferredId || currentId;
        return loadedOrders.some((order) => order.id === nextId) ? nextId : loadedOrders[0]?.id || '';
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load Review Cards orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    if (!selectedOrder) return;
    setStickerText(selectedOrder.stickerText);
    setMaterial(selectedOrder.material);
    setAdminNotes(selectedOrder.adminNotes || '');
    setCopies(String(selectedOrder.quantity));
  }, [selectedOrder]);

  useEffect(() => {
    if (!selectedOrder) {
      setPreviewSvg('');
      return;
    }
    try {
      setPreviewError('');
      setPreviewSvg(createReviewCardStickerSvg(
        selectedOrder.googleReviewUrl,
        selectedOrder.businessName,
        stickerText,
        material,
        selectedOrder.logoDataUrl
      ));
    } catch {
      setPreviewError('This review link is too long to fit a reliably scannable QR sticker. Use the short Google review link.');
      setPreviewSvg('');
    }
  }, [selectedOrder, stickerText, material]);

  useEffect(() => {
    if (!previewSvg) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(new Blob([previewSvg], { type: 'image/svg+xml' }));
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [previewSvg]);

  const postAction = async (action: string, extra: Record<string, unknown> = {}) => {
    if (!selectedOrder) return null;
    const response = await fetch('/api/review-cards/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, orderId: selectedOrder.id, ...extra }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not update the order.');
    if (result.order) {
      setOrders((current) => current.map((order) => order.id === result.order.id ? result.order : order));
    }
    return result.order as ReviewCardOrder | undefined;
  };

  const saveDesign = async () => {
    if (!previewSvg) return;
    setSaving(true);
    setError('');
    try {
      await postAction('save_design', { material, stickerText, adminNotes });
      await refreshOrders(selectedId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the sticker design.');
    } finally {
      setSaving(false);
    }
  };

  const saveStatusAndNotes = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    setError('');
    try {
      await postAction('update_order', { status: selectedOrder.status, adminNotes });
      await refreshOrders(selectedId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the order.');
    } finally {
      setSaving(false);
    }
  };

  const saveStatus = async (status: (typeof REVIEW_CARD_STATUS)[number]) => {
    setSaving(true);
    setError('');
    try {
      await postAction('update_order', { status, adminNotes });
      await refreshOrders(selectedId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update the order status.');
    } finally {
      setSaving(false);
    }
  };

  const createWalkInOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/review-cards/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_walk_in_order',
          ...walkInForm,
          quantity: Number(walkInForm.quantity),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create the walk-in order.');
      setWalkInForm({
        businessName: '',
        googleReviewUrl: '',
        customerName: '',
        phone: '',
        whatsapp: '',
        quantity: '10',
        material: 'WHITE_PAPER',
        stickerText: 'Review us on Google',
        notes: '',
      });
      setShowWalkInForm(false);
      await refreshOrders(result.order.id);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create the walk-in order.');
    } finally {
      setSaving(false);
    }
  };

  const downloadSvg = (svg: string, suffix: string) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedOrder?.id || 'review-card'}-${suffix}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const migrateLegacyLogos = async () => {
    if (!confirm('Move existing uploaded shop logos to private R2 storage?')) return;
    setMigratingLogos(true);
    setError('');
    try {
      let cursor: string | undefined;
      let complete = false;
      let migratedCount = 0;
      while (!complete) {
        const response = await fetch('/api/review-cards/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'migrate_logos_to_r2',
            ...(cursor ? { cursor } : {}),
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not migrate shop logos.');
        migratedCount += Number(result.migratedCount) || 0;
        complete = result.complete === true;
        const nextCursor = typeof result.nextCursor === 'string' ? result.nextCursor : undefined;
        if (!complete && (!nextCursor || nextCursor === cursor)) {
          throw new Error('Logo migration stopped before all orders were scanned. Run it again to resume safely.');
        }
        cursor = nextCursor;
      }
      await refreshOrders(selectedId);
      setError(migratedCount
        ? `Moved ${migratedCount} shop logo${migratedCount === 1 ? '' : 's'} to R2. All Review Cards orders were scanned.`
        : 'All uploaded shop logos are already in R2. All Review Cards orders were scanned.');
    } catch (migrationError) {
      setError(migrationError instanceof Error ? migrationError.message : 'Could not migrate shop logos.');
    } finally {
      setMigratingLogos(false);
    }
  };

  const printSvg = (printWindow: Window, svg: string, quantity: number) => {
    const pages = Array.from({ length: quantity }, () => `<section class="label">${svg}</section>`).join('');
    const printDocument = `<!doctype html><html><head><title>${selectedOrder?.id || 'Review card sticker'}</title><style>@page{size:${REVIEW_CARD_STICKER_WIDTH_MM}mm ${REVIEW_CARD_STICKER_HEIGHT_MM}mm;margin:0}html,body{margin:0;padding:0}.label{width:${REVIEW_CARD_STICKER_WIDTH_MM}mm;height:${REVIEW_CARD_STICKER_HEIGHT_MM}mm;overflow:hidden;break-after:page;page-break-after:always}.label:last-child{break-after:auto;page-break-after:auto}.label svg{display:block;width:${REVIEW_CARD_STICKER_WIDTH_MM}mm;height:${REVIEW_CARD_STICKER_HEIGHT_MM}mm}</style></head><body>${pages}<script>window.onload=()=>window.print()</script></body></html>`;
    const printUrl = URL.createObjectURL(new Blob([printDocument], { type: 'text/html' }));
    printWindow.location.href = printUrl;
    window.setTimeout(() => URL.revokeObjectURL(printUrl), 60_000);
  };

  const recordPrint = async (run?: ReviewCardPrintRun) => {
    if (!selectedOrder) return;
    const quantity = Number(copies);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > selectedOrder.quantity) {
      setError(`Enter a print quantity from 1 to ${selectedOrder.quantity}.`);
      return;
    }
    const printWindow = window.open('about:blank', '_blank');
    if (!printWindow) {
      setError('Allow pop-ups for this site to open the thermal print preview.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const order = await postAction(run ? 'record_reprint' : 'record_print', {
        copies: quantity,
        printRunId: run?.id,
      });
      if (!order?.printRuns.length) throw new Error('Print history was not saved.');
      const savedRun = order.printRuns[order.printRuns.length - 1];
      await refreshOrders(selectedId);
      printSvg(printWindow, savedRun.stickerSvg, savedRun.copies);
    } catch (printError) {
      printWindow.close();
      setError(printError instanceof Error ? printError.message : 'Could not record or print the sticker.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="md:col-span-12 grid gap-5 xl:grid-cols-[minmax(250px,0.8fr)_minmax(0,2fr)]">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">Review Card Orders</h2>
            <p className="mt-1 text-[10px] font-semibold text-zinc-500">{orders.length} saved order{orders.length === 1 ? '' : 's'}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void migrateLegacyLogos()} disabled={migratingLogos} className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase text-zinc-700 disabled:opacity-50">
              {migratingLogos ? 'Moving logos...' : 'Move logos to R2'}
            </button>
            <button type="button" onClick={() => setShowWalkInForm((open) => !open)} className="rounded-lg bg-zinc-900 px-3 py-2 text-[10px] font-black uppercase text-white">Add walk-in</button>
            <button type="button" onClick={() => void refreshOrders()} className="rounded-lg border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase text-zinc-700">Refresh</button>
          </div>
        </div>
        {showWalkInForm && (
          <form onSubmit={createWalkInOrder} className="mb-4 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">In-person shop order</p>
            <input required name="businessName" value={walkInForm.businessName} onChange={(event) => setWalkInForm((form) => ({ ...form, businessName: event.target.value }))} placeholder="Shop / business name" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900" />
            <input required type="url" name="googleReviewUrl" value={walkInForm.googleReviewUrl} onChange={(event) => setWalkInForm((form) => ({ ...form, googleReviewUrl: event.target.value }))} placeholder="Google review link" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900" />
            <input required name="customerName" value={walkInForm.customerName} onChange={(event) => setWalkInForm((form) => ({ ...form, customerName: event.target.value }))} placeholder="Shop contact name" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900" />
            <div className="grid grid-cols-2 gap-2">
              <input required type="tel" name="phone" value={walkInForm.phone} onChange={(event) => setWalkInForm((form) => ({ ...form, phone: event.target.value, whatsapp: form.whatsapp || event.target.value }))} placeholder="Phone" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900" />
              <input type="tel" name="whatsapp" value={walkInForm.whatsapp} onChange={(event) => setWalkInForm((form) => ({ ...form, whatsapp: event.target.value }))} placeholder="WhatsApp" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input required type="number" min="1" max="500" name="quantity" value={walkInForm.quantity} onChange={(event) => setWalkInForm((form) => ({ ...form, quantity: event.target.value }))} aria-label="Walk-in quantity" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900" />
              <select name="material" value={walkInForm.material} onChange={(event) => setWalkInForm((form) => ({ ...form, material: event.target.value as ReviewCardMaterial }))} aria-label="Walk-in sticker material" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900">
                <option value="WHITE_PAPER">White paper</option>
                <option value="TRANSPARENT">Transparent</option>
              </select>
            </div>
            <input required name="stickerText" value={walkInForm.stickerText} onChange={(event) => setWalkInForm((form) => ({ ...form, stickerText: event.target.value }))} placeholder="Sticker text" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900" />
            <textarea name="notes" value={walkInForm.notes} onChange={(event) => setWalkInForm((form) => ({ ...form, notes: event.target.value }))} placeholder="Notes" rows={2} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900" />
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-[#E30613] px-3 py-2.5 text-[10px] font-black uppercase text-white disabled:opacity-50">{saving ? 'Creating…' : 'Create walk-in order'}</button>
          </form>
        )}
        {loading ? <p className="py-8 text-center text-xs text-zinc-400">Loading orders…</p> : orders.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-400">No Review Card requests yet.</p>
        ) : (
          <div className="max-h-[720px] space-y-2 overflow-y-auto">
            {orders.map((order) => (
              <button key={order.id} type="button" onClick={() => setSelectedId(order.id)} className={`w-full rounded-lg border p-3 text-left ${order.id === selectedId ? 'border-zinc-800 bg-zinc-50' : 'border-zinc-200 hover:bg-zinc-50'}`}>
                <span className="flex items-center justify-between gap-2">
                  <strong className="truncate text-xs text-zinc-900">{order.businessName}</strong>
                  <span className="rounded bg-zinc-100 px-1.5 py-1 text-[8px] font-black uppercase text-zinc-600">{STATUS_LABELS[order.status]}</span>
                </span>
                <span className="mt-1 block text-[10px] font-semibold text-zinc-500">{order.id} · {order.quantity} cards · {order.source === 'WALK_IN' ? 'Walk-in' : 'Online'}</span>
                <span className="mt-1 block text-[10px] text-zinc-500">{new Date(order.createdAt).toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        {selectedOrder ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{selectedOrder.id} · {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <h2 className="mt-1 text-xl font-black text-zinc-900">{selectedOrder.businessName}</h2>
                <p className="mt-1 text-xs font-semibold text-zinc-500">{selectedOrder.quantity} cards requested · {selectedOrder.customerName} · {selectedOrder.phone}</p>
              </div>
              <select value={selectedOrder.status} onChange={(event) => void saveStatus(event.target.value as (typeof REVIEW_CARD_STATUS)[number])} disabled={saving} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-800">
                {REVIEW_CARD_STATUS.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
              </select>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <p><strong className="block text-[9px] uppercase text-zinc-400">WhatsApp</strong>{selectedOrder.whatsapp || selectedOrder.phone}</p>
              <p><strong className="block text-[9px] uppercase text-zinc-400">Email</strong>{selectedOrder.email || 'Not provided'}</p>
              <p className="sm:col-span-2"><strong className="block text-[9px] uppercase text-zinc-400">Delivery address</strong>{selectedOrder.deliveryAddress}</p>
              <p className="sm:col-span-2 break-all"><strong className="block text-[9px] uppercase text-zinc-400">Google review link encoded in QR</strong><a href={selectedOrder.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{selectedOrder.googleReviewUrl}</a></p>
              {selectedOrder.notes && <p className="sm:col-span-2"><strong className="block text-[9px] uppercase text-zinc-400">Customer request</strong>{selectedOrder.notes}</p>}
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.9fr)]">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sticker design · {REVIEW_CARD_STICKER_WIDTH_MM} × {REVIEW_CARD_STICKER_HEIGHT_MM} mm · {203} dpi</h3>
                <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-500">Shop sticker text
                  <input value={stickerText} onChange={(event) => setStickerText(event.target.value.slice(0, 80))} maxLength={80} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs normal-case text-zinc-900" />
                </label>
                <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-500">Sticker material
                  <select value={material} onChange={(event) => setMaterial(event.target.value as ReviewCardMaterial)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs normal-case text-zinc-900">
                    <option value="WHITE_PAPER">White paper (white background)</option>
                    <option value="TRANSPARENT">Transparent (no background ink)</option>
                  </select>
                </label>
                {selectedOrder.logoDataUrl && <p className="text-[10px] font-semibold text-zinc-500">Customer logo is embedded in the print artwork.</p>}
                <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-500">Admin notes
                  <textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} rows={3} maxLength={2000} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs normal-case text-zinc-900" />
                </label>
                <button type="button" disabled={saving || !previewSvg} onClick={() => void saveDesign()} className="rounded-lg bg-zinc-900 px-4 py-2.5 text-[10px] font-black uppercase text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save & approve sticker design'}</button>
              </div>
              <div className={`flex min-h-48 items-center justify-center rounded-xl border border-dashed border-zinc-300 p-5 ${material === 'WHITE_PAPER' ? 'bg-white' : 'bg-[linear-gradient(45deg,#f4f4f5_25%,transparent_25%),linear-gradient(-45deg,#f4f4f5_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f4f4f5_75%),linear-gradient(-45deg,transparent_75%,#f4f4f5_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]'}`}>
                {previewUrl ? <img src={previewUrl} alt={`Print preview for ${selectedOrder.businessName}`} className="h-auto w-full max-w-[380px] border border-zinc-200 shadow-sm" /> : <p className="text-xs text-red-600">{previewError || 'Sticker preview unavailable.'}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Print and audit history</h3>
              <p className="mt-1 text-[10px] leading-4 text-zinc-500">Sticker size is fixed at 50 × 30 mm. Browser printing opens a one-label-per-page print job; choose 100% / Actual Size and disable printer scaling.</p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <label className="text-[9px] font-black uppercase text-zinc-500">Copies
                  <input type="number" min="1" max={selectedOrder.quantity} value={copies} onChange={(event) => setCopies(event.target.value)} className="mt-1 block w-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900" />
                </label>
                <button type="button" onClick={() => downloadSvg(selectedOrder.approvedStickerSvg || previewSvg, '50x30mm')} disabled={!selectedOrder.approvedStickerSvg && !previewSvg} className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-[9px] font-black uppercase text-zinc-700 disabled:opacity-40">Download SVG</button>
                <button type="button" onClick={() => void recordPrint()} disabled={saving || !selectedOrder.approvedStickerSvg} className="rounded-lg bg-[#E30613] px-3 py-2.5 text-[9px] font-black uppercase text-white disabled:opacity-40">Record & print</button>
              </div>
              {selectedOrder.printRuns.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {selectedOrder.printRuns.slice().reverse().map((run) => (
                    <div key={run.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-3">
                      <p className="text-[10px] font-semibold text-zinc-600">{new Date(run.printedAt).toLocaleString()} · {run.copies} copies · {run.material === 'TRANSPARENT' ? 'Transparent' : 'White paper'}{run.reprintOf ? ' · Reprint' : ''}</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => downloadSvg(run.stickerSvg, `print-${run.id}`)} className="text-[9px] font-black uppercase text-zinc-600 underline">Download this print</button>
                        <button type="button" disabled={saving} onClick={() => void recordPrint(run)} className="text-[9px] font-black uppercase text-[#E30613] underline">Reprint</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="mt-3 text-[10px] text-zinc-500">No print runs recorded yet.</p>}
            </div>

            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
            <button type="button" onClick={() => void saveStatusAndNotes()} disabled={saving} className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-[10px] font-black uppercase text-zinc-700 disabled:opacity-50">Save status and notes</button>
          </div>
        ) : (
          <div className="flex min-h-60 items-center justify-center text-center text-xs text-zinc-400">{error || 'Select a Review Card request to manage its artwork and print history.'}</div>
        )}
      </section>
    </div>
  );
}
