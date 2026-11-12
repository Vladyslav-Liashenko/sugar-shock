import { api } from 'sdk';
import { PACKS } from '../lib/packs.js';

// Telegram asks to confirm the order; must be answered within 10 seconds.
export default async function (q) {
  let ok = false;
  try {
    const { p, u } = JSON.parse(q.invoice_payload);
    const pack = PACKS[p];
    ok = !!pack && q.currency === 'XTR' && q.total_amount === pack.stars && u === q.from.id;
  } catch (e) {}
  await api.answerPreCheckoutQuery(ok
    ? { pre_checkout_query_id: q.id, ok: true }
    : { pre_checkout_query_id: q.id, ok: false, error_message: 'Order check failed. Please try again.' });
}
