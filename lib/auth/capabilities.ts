import type { UserTier } from "@/types/user";

export interface TierCapabilities {
  canUseAi: boolean;
  canUseSonnet: boolean;
  canUseOpus: boolean;
  hasAiLimit: boolean;
  maxMonthlyAiCalls: number | null; // null = unlimited
  maxDailyOpusCalls: number | null; // null = N/A or unlimited
}

export type CapabilityTier = UserTier | "anonymous";

const ANONYMOUS_CAPABILITIES: TierCapabilities = {
  canUseAi: false,
  canUseSonnet: false,
  canUseOpus: false,
  hasAiLimit: false,
  maxMonthlyAiCalls: null,
  maxDailyOpusCalls: null,
};

const FREE_CAPABILITIES: TierCapabilities = {
  canUseAi: true,
  canUseSonnet: true,
  canUseOpus: false,
  hasAiLimit: true,
  maxMonthlyAiCalls: 10, // TODO: finalize limits in Epic 6
  maxDailyOpusCalls: null,
};

const PAID_CAPABILITIES: TierCapabilities = {
  canUseAi: true,
  canUseSonnet: true,
  canUseOpus: true,
  hasAiLimit: false,
  maxMonthlyAiCalls: null,
  maxDailyOpusCalls: 5, // TODO: finalize limits in Epic 6
};

export const TIER_CAPABILITIES: Record<CapabilityTier, TierCapabilities> = {
  anonymous: ANONYMOUS_CAPABILITIES,
  free: FREE_CAPABILITIES,
  paid: PAID_CAPABILITIES,
};

export function getCapabilitiesForTier(tier: CapabilityTier): TierCapabilities {
  return TIER_CAPABILITIES[tier];
}
