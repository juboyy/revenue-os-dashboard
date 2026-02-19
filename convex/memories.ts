import { query } from "./_generated/server";

export const list = query(async (ctx) => {
  return await ctx.db.query("memories").collect();
});

export const edges = query(async (ctx) => {
  return await ctx.db.query("memoryEdges").collect();
});
