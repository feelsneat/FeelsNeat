# FeelsNeat Ecommerce Shop and CMS Production Workflow

This guide explains how the FeelsNeat ecommerce shop works, how a newly found product becomes a live product on the website, how the CMS/admin area fits into the flow, and what must be configured before pushing the shop to production.

## What Each System Does

FeelsNeat CMS is the source of truth for the storefront. If a product should appear on `feelsneat.com/shop`, it must exist as a FeelsNeat product record with title, slug, SKU, price, images, stock, category, collection, and status.

Cashfree is only the payment gateway. Adding something in Cashfree does not add a product to the FeelsNeat website. Cashfree receives payment orders from FeelsNeat, collects payment, and sends payment status back through the webhook.

AliShipping is the supplier and fulfillment side. Adding or finding a product in AliShipping does not automatically make it live on the FeelsNeat website unless we build a real supplier catalog sync. For now, FeelsNeat still needs its own product record that points to the AliShipping supplier SKU.

Cloudflare KV is the production storage layer. The ecommerce database is stored in the KV binding `FEELSNEAT_CMS_KV` under the key `ecommerce_db`.

The local JSON database and seeded demo products are development-only. In production, if the KV key does not exist yet, the shop starts with an empty product catalog. A product becomes visible only after an administrator creates it in Shop CMS and sets its status to `ACTIVE`.

## Public Shop Routes

The customer-facing ecommerce routes are:

- `/shop`: product listing and filters.
- `/shop/product/[slug]`: product detail page.
- `/cart`: customer cart.
- `/checkout`: customer checkout.
- `/shop/order-confirmation/[orderId]`: post-order confirmation page.
- `/track`: customer order tracking page.

The top navigation should point customers to `/shop`. The `Track Order` button belongs inside the shopping experience, not the main homepage hero.

## Admin and API Routes

CMS/admin page:

- `/admin`
- Sidebar: `Ecommerce Shop` -> `Shop CMS`

Public ecommerce APIs:

- `GET /api/ecommerce/products`
- `POST /api/ecommerce/cart/validate`
- `POST /api/ecommerce/orders`
- `GET /api/ecommerce/track`

Admin ecommerce API:

- `GET /api/ecommerce/admin`
- `POST /api/ecommerce/admin`

Payment webhook:

- `POST /api/webhooks/cashfree`

## Full Workflow: Listing a New Product

Use this workflow when you find a new product and want to sell it on the FeelsNeat website.

### Affiliate Product Workflow

Affiliate products do not create FeelsNeat orders. The partner site owns checkout, payment, shipping, returns, and customer support.

1. Research and approve the product.
2. Generate the tracked partner URL from the affiliate program.
3. Open `/admin` -> `Ecommerce Shop` -> `Shop CMS`.
4. Choose `+ Affiliate product`.
5. Enter the title, SKU, reference price, image, partner, platform, affiliate URL, CTA, commission estimate, and disclosure.
6. Save as `DRAFT` and review `/shop/product/[slug]`.
7. Set the product to `ACTIVE` only after the link and disclosure are verified.

The site records outbound clicks and displays estimated affiliate reference value. It must not treat clicks as confirmed sales or commission earnings. Confirmed conversions and payouts must be reconciled from the partner dashboard or a future partner report import.

Affiliate products bypass the FeelsNeat cart and checkout. They do not require Cashfree or AliShipping credentials.

### Dropship Product Workflow

Dropship products require Cashfree for prepaid payment and a live/manual AliShipping fulfillment process before they should be activated.

### 1. Evaluate the Product

Before adding anything to the site, collect the product basics:

- product name
- supplier name
- supplier SKU
- supplier product URL
- supplier cost
- available stock
- product images
- product description
- size, color, or other variants
- weight and dimensions
- shipping availability to India or your target region
- expected delivery timeline
- return/replacement restrictions

Do not publish the product yet. First confirm that the product can be fulfilled reliably.

### 2. Decide the Inventory Source

Choose one of these values:

- `OWNED`: FeelsNeat holds the stock or handles fulfillment directly.
- `SUPPLIER`: a supplier such as AliShipping fulfills the product.

If the product is coming from AliShipping, use `SUPPLIER`.

### 3. Create the FeelsNeat Product Record

The product must be added to the FeelsNeat CMS/database. Required fields:

- `id`: internal product ID, usually like `prod-modern-wireless-lamp`.
- `slug`: public URL slug, such as `modern-wireless-table-lamp`.
- `title`: customer-facing product name.
- `shortDescription`: short listing text.
- `description`: full product page description.
- `categoryId`: category assignment.
- `collectionIds`: one or more collections.
- `sku`: FeelsNeat internal SKU, such as `FN-LAMP-001`.
- `sellingPrice`: customer price in INR.
- `compareAtPrice`: optional crossed-out reference price.
- `costPrice`: supplier/internal cost for margin calculation.
- `images`: public image URLs.
- `status`: start as `DRAFT`.
- `stockQuantity`: current sellable stock.
- `inventorySource`: `OWNED` or `SUPPLIER`.
- `taxIncluded`: normally `true`.

For supplier-fulfilled products, also add supplier mapping:

- `supplierId`: for AliShipping this is currently `sup-alishipping`.
- `supplierMapping.supplierSku`: the AliShipping SKU.
- `supplierMapping.supplierCost`: supplier cost in INR.
- `supplierMapping.supplierStock`: supplier stock.
- `supplierMapping.lastStockSync`: timestamp or `null`.
- `supplierMapping.fulfillmentEnabled`: `true` when ready for fulfillment.
- `supplierMapping.syncStatus`: `SYNCED`, `PENDING`, or `ERROR`.

### 4. Add Variants When Needed

If the product has options such as color or size, set:

- `hasVariants`: `true`
- `variants`: array of variant records

Each variant needs:

- variant ID
- variant SKU
- variant title
- attributes, such as `{ "Color": "Black" }`
- selling price
- cost price
- stock quantity
- supplier SKU, if different from the parent product
- active status

The checkout uses the selected variant to calculate price, stock, SKU, and supplier information.

### 5. Assign Category and Collection

Categories are used for shop filtering. Collections are used for merchandising groups like new arrivals, best sellers, or under a price point.

Current seed examples include:

- Home & Living
- Lighting
- Desk Setup
- Storage & Trays
- New Arrivals
- Best Sellers
- Trending
- Under ₹999

If the product does not fit an existing category or collection, create one through the admin API or future product editor UI before publishing.

### 6. Review the Product Page

Open:

```text
/shop/product/[slug]
```

Check:

- product title
- price
- images
- description
- variants
- stock state
- add-to-cart behavior
- mobile layout

Keep the product as `DRAFT` until this review is complete.

### 7. Publish the Product

Set:

```text
status = ACTIVE
```

Only `ACTIVE` products are intended to appear in the shop.

If a product should be hidden later, use:

- `DRAFT`: still being prepared.
- `UNPUBLISHED`: temporarily hidden.
- `ARCHIVED`: retired product.

## Production Catalog Rules

- `DRAFT`, `UNPUBLISHED`, and `ARCHIVED` products are hidden from the public shop.
- Only CMS-managed products stored in production KV are shown in production.
- `src/lib/ecommerce-db-dev.json` is not synchronized to production.
- Never copy placeholder/demo affiliate URLs into the production catalog.
- Verify every partner URL, disclosure, price label, and merchant name before publishing.

## Current Admin Page Behavior

The `/admin` page currently exposes a lightweight `Shop CMS` view. It shows:

- products
- ecommerce orders
- order count
- paid revenue
- product count
- pending payment count
- selected product details
- selected order details
- customer/payment/fulfillment state
- order item snapshots
- tracking link

The backend admin API supports more actions than the visible UI currently exposes.

Supported backend admin actions:

- `save_product`
- `duplicate_product`
- `delete_product`
- `import_supplier_product`
- `save_category`
- `delete_category`
- `save_collection`
- `delete_collection`
- `update_order_status`
- `add_order_note`
- `retry_fulfillment`
- `save_discount`
- `delete_discount`
- `save_settings`

Important production note: the visible admin page is currently a monitoring/detail view. For comfortable day-to-day production use, the next product work should add full CMS forms for creating/editing products, categories, collections, discounts, and fulfillment updates.

## Current Product Addition Options

### Option A: Manual Database/CMS Product Entry

Use this when you already have product data and images.

1. Create a new product object in the ecommerce database.
2. Start with `status: DRAFT`.
3. Add supplier mapping if supplier fulfilled.
4. Confirm page rendering.
5. Set status to `ACTIVE`.

In local development this data is stored in:

```text
src/lib/ecommerce-db-dev.json
```

In production this data is stored in Cloudflare KV under:

```text
FEELSNEAT_CMS_KV -> ecommerce_db

Saving from Shop CMS writes to this production KV record when the admin session and KV binding are configured. It does not sync the local development JSON file to production.
```

### Option B: Supplier Catalog Import

The admin API has an `import_supplier_product` action. It takes a supplier catalog item and creates a FeelsNeat product from it.

Important behavior:

- imported products are created as `DRAFT`
- generated FeelsNeat SKU is created automatically
- supplier SKU and supplier cost are copied into supplier mapping
- product still needs admin review before publishing

This is the right workflow once AliShipping supplier catalog data is available inside the FeelsNeat ecommerce database.

### Option C: Future AliShipping Live Catalog Sync

This is not live yet. When official AliShipping API documentation is available, implement catalog and inventory sync so the system can:

1. Fetch supplier catalog items from AliShipping.
2. Store them as supplier catalog items.
3. Let admin import chosen items into FeelsNeat products.
4. Keep supplier stock updated.
5. Prevent checkout when supplier stock is no longer available.

## Order Creation Workflow

When a customer checks out:

1. The frontend sends cart items, customer details, address, and payment method to `POST /api/ecommerce/orders`.
2. The server loads the ecommerce database.
3. The server finds each product by `productId`.
4. If a variant was selected, the server uses variant price, SKU, supplier SKU, and stock.
5. The server validates stock.
6. The server recalculates subtotal, discount, shipping, COD fee, and total.
7. The server creates an item snapshot for the order.
8. The server creates an order ID like `FN-10001`.
9. The order is saved.
10. The customer is redirected to the confirmation page.

The item snapshot is important. Later product edits do not change what the customer bought. The order keeps the exact title, SKU, quantity, price, supplier SKU, and supplier cost from checkout time.

## Payment Workflow

### COD Orders

For Cash on Delivery:

1. Order is created immediately.
2. `orderStatus` becomes `CONFIRMED`.
3. `paymentStatus` remains `PENDING`.
4. `fulfillmentStatus` becomes `PENDING`.
5. Team collects payment manually at delivery.
6. Admin updates order/payment status after payment is collected.

### Prepaid Orders

For online payment:

1. Order starts as `PENDING_PAYMENT`.
2. FeelsNeat creates a Cashfree payment order if credentials are configured.
3. Customer pays through Cashfree.
4. Cashfree sends a webhook to `/api/webhooks/cashfree`.
5. The webhook verifies signature.
6. On success, order becomes `CONFIRMED` and `PAID`.
7. The system attempts fulfillment creation.

## Cashfree Production Setup

Set these production environment variables:

```bash
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
CASHFREE_ENVIRONMENT=TEST
```

Use `TEST` first. Move to `PRODUCTION` only after sandbox payment verification.

Cashfree dashboard setup:

1. Create/open the Cashfree merchant account.
2. Enable Payment Gateway.
3. Copy Client ID and Client Secret.
4. Add those values to the production environment.
5. Configure webhook URL:

```text
https://your-domain.com/api/webhooks/cashfree
```

6. Enable payment success and payment failed webhook events.
7. Run a sandbox prepaid order.
8. Confirm webhook changes the order to `PAID` and `CONFIRMED`.
9. Confirm failed payment changes the order to `PAYMENT_FAILED`.
10. Switch to live credentials and `CASHFREE_ENVIRONMENT=PRODUCTION`.

Cashfree does not manage FeelsNeat products. It only receives order/payment requests from FeelsNeat.

## AliShipping Production Setup

Current status:

- AliShipping provider boundary exists.
- Environment variable detection exists.
- Real endpoint calls are not implemented because official API documentation is not in the codebase.

Set these only after receiving official AliShipping credentials:

```bash
ALISHIPPING_API_KEY=your_alishipping_api_key
ALISHIPPING_API_SECRET=your_alishipping_api_secret
```

Then implement these methods in:

```text
src/lib/ecommerce/fulfillment/alishipping.ts
```

Required methods:

- `createFulfillmentOrder`
- `cancelFulfillmentOrder`
- `getFulfillmentStatus`
- `syncInventory`

AliShipping dashboard/manual setup:

1. Confirm supplier account is active.
2. Confirm supported shipping destinations.
3. Confirm SKU format used by AliShipping.
4. Confirm product availability and inventory behavior.
5. Confirm order creation API fields.
6. Confirm tracking API fields.
7. Confirm cancellation and return process.
8. Confirm whether COD is supported or only prepaid fulfillment.

Until the real API is implemented, fulfillment should be handled manually after order confirmation.

## Manual Fulfillment Workflow Before AliShipping API Is Live

For each confirmed order:

1. Open `/admin`.
2. Select `Ecommerce Shop` -> `Shop CMS`.
3. Open the order.
4. Copy customer name, phone, and shipping address.
5. Copy item SKU, supplier SKU, quantity, and variant.
6. Open AliShipping or supplier dashboard.
7. Create the supplier order manually.
8. Enter customer shipping address.
9. Choose courier/service level.
10. Save supplier order ID.
11. Copy tracking number and tracking URL.
12. Update FeelsNeat order status and shipment details through admin tooling.
13. Ask customer to use `/track` for status where available.

## Inventory Management Workflow

Current behavior:

- checkout validates requested quantity against FeelsNeat product or variant stock
- order stores product and supplier snapshot
- live AliShipping stock sync is not implemented yet

Manual stock workflow:

1. Check supplier stock before publishing.
2. Enter the sellable quantity in FeelsNeat product `stockQuantity`.
3. For variants, enter stock per variant.
4. Recheck supplier stock daily or before running ads.
5. If supplier stock falls to zero, set product to `UNPUBLISHED` or reduce stock to `0`.
6. If the supplier SKU changes, update supplier mapping before accepting new orders.

Future automated stock workflow:

1. Call AliShipping inventory API.
2. Match returned stock by supplier SKU.
3. Update `supplierMapping.supplierStock`.
4. Update FeelsNeat `stockQuantity`.
5. Set `lastStockSync`.
6. Set `syncStatus` to `SYNCED` or `ERROR`.
7. Hide unavailable products automatically if needed.

## Production Launch Checklist

Before pushing live:

1. Configure `AUTH_SECRET`.
2. Configure `FEELSNEAT_CMS_KV`.
3. Seed or migrate `ecommerce_db` into production KV.
4. Configure Cashfree sandbox credentials.
5. Configure Cashfree webhook URL.
6. Test prepaid success payment.
7. Test prepaid failed payment.
8. Test COD order.
9. Confirm `/admin` can read ecommerce orders.
10. Confirm `/track` can find a placed order.
11. Confirm `/shop`, product detail, cart, checkout, and confirmation pages work on mobile.
12. Confirm product images are stable public URLs.
13. Confirm product statuses are correct.
14. Confirm supplier SKU mapping exists for supplier-fulfilled products.
15. Confirm manual fulfillment process is ready if AliShipping API is not live.
16. Implement real AliShipping API before relying on automatic fulfillment.
17. Add full CMS product editor UI if non-technical product management is required.

## Recommended Next Build Tasks

For a production-ready operating system, the highest-value next tasks are:

1. Add visible product create/edit forms to `/admin`.
2. Add category and collection management forms.
3. Add discount management forms.
4. Add order status update controls.
5. Add shipment/tracking update controls.
6. Add a production KV seed/migration script.
7. Implement real AliShipping API calls after official docs are available.
8. Add inventory sync and low-stock warnings.
9. Add Cashfree live-mode verification checklist.

## Short Answer

If you find a new product, do not add it in Cashfree first. Add it to FeelsNeat CMS as a product. If AliShipping will fulfill it, map the AliShipping supplier SKU inside that FeelsNeat product. Cashfree only collects payment after a customer places an order. AliShipping only fulfills the order after the FeelsNeat order exists and has been confirmed.
