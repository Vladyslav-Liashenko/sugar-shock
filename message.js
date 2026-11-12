import { api, db } from 'sdk';
import { payments } from '../schema.js';
import { PACKS, text, GAME_LINK, SUPPORT } from '../lib/packs.js';

export default async function (message) {
  const T = text(message.from && message.from.language_code);

  // 1. Successful Stars payment: record it, the game credits it via claimPurchases
  const sp = message.successful_payment;
  if (sp) {
    let p = -1;
    try { p = JSON.parse(sp.invoice_payload).p; } catch (e) {}
    const pack = PACKS[p] || { stars: sp.total_amount };
    await db.insert(payments).values({
      chargeId: sp.telegram_payment_charge_id,
      userId: message.from.id,
      pack: p,
      stars: sp.total_amount,
      coins: pack.coins || 0,
      gems: pack.gems || 0,
    }).onConflictDoNothing({ target: payments.chargeId }).run();
    await api.sendMessage({ chat_id: message.chat.id, text: T.thanks });
    return;
  }

  const cmd = (message.text || '').split(/[\s@]/)[0];
  if (cmd === '/start') {
    await api.sendMessage({
      chat_id: message.chat.id,
      text: T.start,
      reply_markup: { inline_keyboard: [[{ text: T.play, url: GAME_LINK }]] },
    });
  } else if (cmd === '/paysupport') {
    await api.sendMessage({ chat_id: message.chat.id, text: T.support + SUPPORT });
  }
}
