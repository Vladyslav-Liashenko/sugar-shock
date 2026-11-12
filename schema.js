import { table, integer, text, boolean, sql, index } from 'sdk/db';

// Every successful Stars payment. The game claims uncredited rows to add coins / stars.
export const payments = table('payments', {
  id:       integer('id').primaryKey({ autoIncrement: true }),
  chargeId: text('charge_id').notNull().unique(),
  userId:   integer('user_id').notNull(),
  pack:     integer('pack').notNull(),
  stars:    integer('stars').notNull(),
  coins:    integer('coins').notNull().default(0),
  gems:     integer('gems').notNull().default(0),
  credited: boolean('credited').notNull().default(false),
  created:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  byUser: index('idx_payments_user').on(t.userId, t.credited),
}));
