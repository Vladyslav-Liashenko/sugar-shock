import { db } from 'sdk';
import { and, eq } from 'sdk/db';
import { payments } from '../schema.js';

// Returns paid but not yet credited purchases of the current player and marks them credited in one statement.
export default async function (input, ctx) {
  const userId = ctx.initData.user.id;
  const rows = await db.update(payments)
    .set({ credited: true })
    .where(and(eq(payments.userId, userId), eq(payments.credited, false)))
    .returning()
    .run();
  return { items: (rows || []).map(r => ({ pack: r.pack, coins: r.coins, gems: r.gems })) };
}
