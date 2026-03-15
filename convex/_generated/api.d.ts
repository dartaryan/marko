/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as abuse from "../abuse.js";
import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_stripe from "../lib/stripe.js";
import type * as lib_tierLimits from "../lib/tierLimits.js";
import type * as modelRouter from "../modelRouter.js";
import type * as prompts from "../prompts.js";
import type * as receipts from "../receipts.js";
import type * as stripe from "../stripe.js";
import type * as subscriptionActions from "../subscriptionActions.js";
import type * as subscriptions from "../subscriptions.js";
import type * as sumit from "../sumit.js";
import type * as usage from "../usage.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  abuse: typeof abuse;
  ai: typeof ai;
  analytics: typeof analytics;
  crons: typeof crons;
  http: typeof http;
  "lib/authorization": typeof lib_authorization;
  "lib/stripe": typeof lib_stripe;
  "lib/tierLimits": typeof lib_tierLimits;
  modelRouter: typeof modelRouter;
  prompts: typeof prompts;
  receipts: typeof receipts;
  stripe: typeof stripe;
  subscriptionActions: typeof subscriptionActions;
  subscriptions: typeof subscriptions;
  sumit: typeof sumit;
  usage: typeof usage;
  users: typeof users;
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
