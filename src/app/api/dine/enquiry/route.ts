import { NextRequest, NextResponse } from 'next/server';
import { DineEnquiry, loadDineDb, randomId, saveDineDb } from '@/lib/dine';

export const runtime = 'edge';

function asText(value: any) {
  return String(value || '').trim();
}

function asPositiveNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const restaurantName = asText(body.restaurant_name);
  const location = asText(body.location);
  const contactPerson = asText(body.contact_person);
  const phone = asText(body.phone);
  const whatsapp = asText(body.whatsapp);
  const tableCount = asPositiveNumber(body.table_count);

  if (!restaurantName || !location || !contactPerson || !phone || !whatsapp || tableCount < 1) {
    return NextResponse.json(
      { error: 'Restaurant name, location, contact person, phone, WhatsApp, and number of tables are required.' },
      { status: 400 }
    );
  }

  const email = asText(body.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const phoneRegex = /^[6-9]\d{9}$|^[+]\d{1,4}\d{9,10}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, '')) || !phoneRegex.test(whatsapp.replace(/[\s-]/g, ''))) {
    return NextResponse.json({ error: 'Please enter valid phone and WhatsApp numbers.' }, { status: 400 });
  }

  const db = await loadDineDb(req.url);
  const now = new Date().toISOString();
  const enquiry: DineEnquiry = {
    enquiry_id: randomId('FN-DINE', 6),
    restaurant_name: restaurantName,
    location,
    contact_person: contactPerson,
    phone,
    whatsapp,
    email,
    table_count: tableCount,
    table_naming: ['standard', 'custom', 'not_decided'].includes(body.table_naming) ? body.table_naming : 'standard',
    qr_stands_required: asPositiveNumber(body.qr_stands_required, tableCount),
    payment_preference: ['pay_at_restaurant', 'online_payment', 'not_decided'].includes(body.payment_preference) ? body.payment_preference : 'pay_at_restaurant',
    menu_attachment: body.menu_attachment?.name && body.menu_attachment?.data
      ? {
          name: asText(body.menu_attachment.name),
          type: asText(body.menu_attachment.type),
          data: String(body.menu_attachment.data),
        }
      : null,
    additional_requirements: asText(body.additional_requirements),
    status: 'NEW',
    created_at: now,
    updated_at: now,
  };

  db.enquiries.unshift(enquiry);
  await saveDineDb(req.url, db);

  return NextResponse.json({ success: true, enquiryId: enquiry.enquiry_id });
}
