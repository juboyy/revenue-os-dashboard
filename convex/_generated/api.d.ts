/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as collectors_memoryCollector from "../collectors/memoryCollector.js";
import type * as collectors_metricsCollector from "../collectors/metricsCollector.js";
import type * as collectors_sessionCollector from "../collectors/sessionCollector.js";
import type * as collectors_taskCollector from "../collectors/taskCollector.js";
import type * as content from "../content.js";
import type * as cronJobs from "../cronJobs.js";
import type * as finance from "../finance.js";
import type * as http from "../http.js";
import type * as interactions from "../interactions.js";
import type * as memories from "../memories.js";
import type * as metrics from "../metrics.js";
import type * as mutations_seed from "../mutations/seed.js";
import type * as tasks from "../tasks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  "collectors/memoryCollector": typeof collectors_memoryCollector;
  "collectors/metricsCollector": typeof collectors_metricsCollector;
  "collectors/sessionCollector": typeof collectors_sessionCollector;
  "collectors/taskCollector": typeof collectors_taskCollector;
  content: typeof content;
  cronJobs: typeof cronJobs;
  finance: typeof finance;
  http: typeof http;
  interactions: typeof interactions;
  memories: typeof memories;
  metrics: typeof metrics;
  "mutations/seed": typeof mutations_seed;
  tasks: typeof tasks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
