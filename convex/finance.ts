import { query } from "./_generated/server";

export const bounties = query(async (ctx) => {
  return await ctx.db.query("bounties").collect();
});

export const transactions = query(async (ctx) => {
  return await ctx.db.query("transactions").order("desc").take(200);
});
