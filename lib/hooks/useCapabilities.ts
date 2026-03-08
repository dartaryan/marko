"use client";

import { useCurrentUser } from "./useCurrentUser";
import {
  getCapabilitiesForTier,
  type TierCapabilities,
  type CapabilityTier,
} from "@/lib/auth/capabilities";

export function useCapabilities(): {
  capabilities: TierCapabilities;
  tier: CapabilityTier;
  isLoading: boolean;
} {
  const { user, isLoading } = useCurrentUser();

  const tier: CapabilityTier = user?.tier ?? "anonymous";
  const capabilities = getCapabilitiesForTier(tier);

  return { capabilities, tier, isLoading };
}
