# Candy Shock ⚡ on Telegram Serverless

The game (public/index.html), the payment logic and the database all run on Telegram.

- `public/index.html` — the game, hosted by Telegram at https://app<id>.tgcloud.ai/
- `tgcloud/endpoints/createInvoice.js` — creates a Telegram Stars invoice for a pack
- `tgcloud/endpoints/claimPurchases.js` — gives the game the paid but not yet credited purchases
- `tgcloud/handlers/pre_checkout_query.js` — confirms the order within 10 seconds
- `tgcloud/handlers/message.js` — saves successful payments, answers /start and /paysupport
- `tgcloud/schema.js` — the `payments` table
- `tgcloud/lib/packs.js` — pack prices (must match PACKS in public/index.html), texts, support contact

Deploy: `npx tgcloud push` then `npx tgcloud migrate` (first time, and after schema changes).
