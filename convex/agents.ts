import { query } from "./_generated/server";

export const list = query(async (ctx) => {
  return await ctx.db.query("agents").collect();
});

export const byId = query(async (ctx, { agentId }: { agentId: string }) => {
  return await ctx.db
    .query("agents")
    .withIndex("by_agentId", (q) => q.eq("agentId", agentId))
    .unique();
});
