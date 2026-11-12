import { api, EndpointError } from 'sdk';
import { PACKS, text } from '../lib/packs.js';

// Called by the game: Telegram.WebApp.Serverless.call('createInvoice', { pack })
export default async function (input, ctx) {
  const user = ctx.initData.user;
  const i = Number(input && input.pack);
  const p = PACKS[i];
  if (!Number.isInteger(i) || !p) throw new EndpointError('Unknown pack', { code: 'BAD_PACK' });
  const T = text(user.language_code);
  const title = p.coins ? T.coins.replace('{n}', p.coins) : T.gems.replace('{n}', p.gems);
  const link = await api.createInvoiceLink({
    title,
    description: T.desc,
    payload: JSON.stringify({ p: i, u: user.id }),
    currency: 'XTR',
    prices: [{ label: title, amount: p.stars }],
  });
  return { link };
}
