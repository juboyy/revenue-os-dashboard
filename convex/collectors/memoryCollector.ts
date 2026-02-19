import { action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Mutation to upsert a memory by filePath + content hash
export const upsertMemory = internalMutation({
  args: {
    title: v.string(),
    content: v.string(),
    filePath: v.string(),
    agentId: v.optional(v.string()),
    category: v.string(),
    relevance: v.number(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Deduplicate by filePath + title
    const existing = await ctx.db
      .query("memories")
      .withIndex("by_filePath", (q) => q.eq("filePath", args.filePath))
      .collect();

    const match = existing.find((m) => m.title === args.title);

    if (match) {
      await ctx.db.patch(match._id, {
        content: args.content,
        relevance: args.relevance,
        tags: args.tags,
        retrievalCount: match.retrievalCount + 1,
      });
      return match._id;
    } else {
      return await ctx.db.insert("memories", {
        title: args.title,
        content: args.content,
        filePath: args.filePath,
        agentId: args.agentId,
        category: args.category,
        relevance: args.relevance,
        retrievalCount: 0,
        tags: args.tags,
        createdAt: Date.now(),
      });
    }
  },
});

// Action that ingests memories from markdown content
export const collectMemories = action({
  args: {
    filePath: v.string(),
    content: v.string(),
    agentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sections = parseMarkdownSections(args.content);
    let collected = 0;

    for (const section of sections) {
      const category = inferCategory(section.title, section.content);
      const tags = extractTags(section.content);
      const relevance = Math.min(1, 0.5 + section.content.length / 2000);

      await ctx.runMutation(internal.collectors.memoryCollector.upsertMemory, {
        title: section.title,
        content: section.content.slice(0, 2000),
        filePath: args.filePath,
        agentId: args.agentId,
        category,
        relevance,
        tags,
      });
      collected++;
    }

    return { collected, filePath: args.filePath, timestamp: Date.now() };
  },
});

interface Section {
  title: string;
  content: string;
}

function parseMarkdownSections(md: string): Section[] {
  const sections: Section[] = [];
  const lines = md.split("\n");
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headerMatch) {
      if (currentTitle && currentContent.length > 0) {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = headerMatch[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle && currentContent.length > 0) {
    sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  }

  // If no headers found, treat entire content as one section
  if (sections.length === 0 && md.trim().length > 0) {
    sections.push({ title: "Note", content: md.trim().slice(0, 2000) });
  }

  return sections;
}

function inferCategory(title: string, content: string): string {
  const text = (title + " " + content).toLowerCase();
  if (text.includes("decision") || text.includes("decided") || text.includes("chose")) return "decision";
  if (text.includes("prefer") || text.includes("always") || text.includes("never")) return "preference";
  if (text.includes("pattern") || text.includes("lesson") || text.includes("learned")) return "pattern";
  return "fact";
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  const words = content.toLowerCase();
  const tagMap: Record<string, string> = {
    "convex": "convex", "stripe": "stripe", "dashboard": "dashboard",
    "agent": "agents", "memory": "memory", "deploy": "deploy",
    "api": "api", "webhook": "webhook", "cron": "cron",
    "supabase": "supabase", "vercel": "vercel",
  };
  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (words.includes(keyword)) tags.push(tag);
  }
  return tags.slice(0, 5);
}
