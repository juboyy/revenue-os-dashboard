import { query } from "./_generated/server";

export const list = query(async (ctx) => {
  return await ctx.db.query("interactions").order("desc").take(50);
});

export const standups = query(async (ctx) => {
  return await ctx.db.query("standupMessages").order("desc").take(20);
});
