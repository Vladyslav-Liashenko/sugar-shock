// Candy Shock ⚡ payments worker (Cloudflare Workers)
//
// Variables to set in Cloudflare (Settings → Variables and Secrets):
//   BOT_TOKEN       secret  token from @BotFather
//   WEBHOOK_SECRET  secret  any random string, used to check that updates come from Telegram
//   APP_URL         text    address of the game, e.g. https://sugar-shock.netlify.app
//   SUPPORT         text    contact for payment questions, e.g. @your_username
//
// Packs must match PACKS in index.html (Telegram Stars price → coins or in-game stars).
const PACKS = [
  { stars: 50,  coins: 120 },
  { stars: 150, coins: 400 },
  { stars: 400, coins: 1200 },
  { stars: 25,  gems: 10 },
  { stars: 75,  gems: 35 },
  { stars: 200, gems: 100 },
];

const TEXT = {
  uk: { title: '{c} монет', titleG: '{g} ігрових зірок', descG: 'Ігрові зірки для Candy Shock ⚡: нові дошки, фони та обмін на монети.', desc: 'Монети для гри Candy Shock ⚡: бустери та додаткові ходи.',
        start: 'Привіт! Candy Shock ⚡ це солодкий match-3, де цукерки б’є струмом. Натисни кнопку, щоб грати.',
        play: '🍬 Грати', thanks: 'Дякуємо за покупку! Покупка вже у грі ⚡', support: 'Питання щодо оплати? Напишіть: {s}' },
  ru: { title: '{c} монет', titleG: '{g} игровых звёзд', descG: 'Игровые звёзды для Candy Shock ⚡: новые доски, фоны и обмен на монеты.', desc: 'Монеты для игры Candy Shock ⚡: бустеры и дополнительные ходы.',
        start: 'Привет! Candy Shock ⚡ это сладкий match-3, где конфеты бьёт током. Нажми кнопку, чтобы играть.',
        play: '🍬 Играть', thanks: 'Спасибо за покупку! Покупка уже в игре ⚡', support: 'Вопрос по оплате? Напишите: {s}' },
  en: { title: '{c} coins', titleG: '{g} game stars', descG: 'Game stars for Candy Shock ⚡: new boards, backgrounds and swaps for coins.', desc: 'Coins for Candy Shock ⚡: boosters and extra moves.',
        start: 'Hi! Candy Shock ⚡ is a sweet match-3 where candies get zapped. Tap the button to play.',
        play: '🍬 Play', thanks: 'Thanks for your purchase! Your purchase is already in the game ⚡', support: 'Payment question? Contact: {s}' },
};
const pickLang = code => (code || '').startsWith('uk') ? 'uk' : (code || '').startsWith('ru') ? 'ru' : 'en';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method === 'POST' && url.pathname === '/invoice') return createInvoice(req, env);
    if (req.method === 'POST' && url.pathname === '/webhook') return handleUpdate(req, env);
    return new Response('Candy Shock payments: OK');
  },
};

async function api(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return r.json();
}

// ---------- the game asks for an invoice ----------
async function createInvoice(req, env) {
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad request' }, 400); }
  const user = await verifyInitData(body.initData, env.BOT_TOKEN);
  if (!user) return json({ error: 'unauthorized' }, 403);
  const pack = PACKS[body.pack];
  if (!pack) return json({ error: 'unknown pack' }, 400);

  const T = TEXT[pickLang(user.language_code)];
  const title = pack.coins ? T.title.replace('{c}', pack.coins) : T.titleG.replace('{g}', pack.gems);
  const res = await api(env, 'createInvoiceLink', {
    title,
    description: pack.coins ? T.desc : T.descG,
    payload: JSON.stringify({ u: user.id, p: body.pack, t: Date.now() }),
    provider_token: '',          // empty for Telegram Stars
    currency: 'XTR',             // Telegram Stars
    prices: [{ label: title, amount: pack.stars }],
  });
  if (!res.ok) return json({ error: 'telegram error' }, 502);
  return json({ link: res.result });
}

// ---------- updates from Telegram ----------
async function handleUpdate(req, env) {
  if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
  const u = await req.json();

  // Telegram asks to confirm the order before charging (must answer within 10 seconds)
  if (u.pre_checkout_query) {
    const q = u.pre_checkout_query;
    let ok = false;
    try {
      const p = JSON.parse(q.invoice_payload);
      ok = q.currency === 'XTR' && !!PACKS[p.p] && PACKS[p.p].stars === q.total_amount && p.u === q.from.id;
    } catch {}
    await api(env, 'answerPreCheckoutQuery', ok
      ? { pre_checkout_query_id: q.id, ok: true }
      : { pre_checkout_query_id: q.id, ok: false, error_message: 'Order is not valid, please try again.' });
  }

  const m = u.message;
  if (m) {
    const T = TEXT[pickLang(m.from && m.from.language_code)];
    const text = m.text || '';
    if (m.successful_payment) {
      await api(env, 'sendMessage', { chat_id: m.chat.id, text: T.thanks });
    } else if (text.startsWith('/start')) {
      await api(env, 'sendMessage', {
        chat_id: m.chat.id, text: T.start,
        reply_markup: { inline_keyboard: [[{ text: T.play, web_app: { url: env.APP_URL } }]] },
      });
    } else if (text.startsWith('/paysupport')) {
      await api(env, 'sendMessage', { chat_id: m.chat.id, text: T.support.replace('{s}', env.SUPPORT || '') });
    }
  }
  return new Response('ok');
}

// ---------- check that the request really comes from this player in Telegram ----------
async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? new TextEncoder().encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data)));
}
const toHex = b => [...b].map(x => x.toString(16).padStart(2, '0')).join('');

async function verifyInitData(initData, token) {
  if (!initData || typeof initData !== 'string') return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const check = [...params.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = await hmac('WebAppData', token);
  if (toHex(await hmac(secret, check)) !== hash) return null;
  if (Date.now() / 1000 - Number(params.get('auth_date') || 0) > 86400) return null;
  try { return JSON.parse(params.get('user') || 'null'); } catch { return null; }
}
