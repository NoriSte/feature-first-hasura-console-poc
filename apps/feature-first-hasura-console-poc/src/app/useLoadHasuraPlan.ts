import {
  HasuraPlan,
  ServerEnvVars,
  setLuxEntitlements,
  setServerEnvVars,
  useHasuraPlan,
  setEeLiteLicense,
} from '@feature-first-hasura-console-poc/hasura-features';
import { useQuery } from '@tanstack/react-query';
import { LuxEntitlementsPayload } from '@feature-first-hasura-console-poc/hasura-features';
import { useEffect } from 'react';
import { queryClient } from '../main';

// Simulate the initial load of everything needed to enable a feature or not
export function useLoadHasuraPlan(envVars: ServerEnvVars) {
  // Set the env vars in the store
  useEffect(() => {
    setServerEnvVars(envVars);
  }, [envVars]);

  const hasuraPlan = useHasuraPlan();

  const luxEntitlementsStatus = useFetchLuxEntitlements(hasuraPlan);
  const eeLiteLicenseStatus = useFetchEELiteLicense(hasuraPlan);

  const statuses = [luxEntitlementsStatus, eeLiteLicenseStatus];

  if (statuses.find((status) => status === 'loading')) return 'loading';
  if (statuses.find((status) => status === 'error')) return 'error';
  if (
    statuses.every((status) => status === 'success' || status === 'notNeeded')
  )
    return 'success';

  return 'unknown';
}

// Simulate fetching the Lux entitlements
function useFetchLuxEntitlements(hasuraPlan: HasuraPlan) {
  const isCloudConsole = hasuraPlan.type === 'cloud';

  const { status } = useQuery<LuxEntitlementsPayload>({
    queryKey: ['luxEntitlements'],
    queryFn: () => fetch('/lux-entitlements').then((res) => res.json()),
    onSuccess: setLuxEntitlements,
    enabled: isCloudConsole,
  });

  // Lux entitlements can only be load in Cloud. For all the other plans, the default values of the
  // store are fine (since they are conservative) and we don't need to fetch anything.
  if (!isCloudConsole) return 'notNeeded';

  return status;
}

// Can be used by anyone to refetch the lux entitlements
export function useRefetchLuxEntitlements() {
  return () => queryClient.invalidateQueries({ queryKey: ['luxEntitlements'] });
}

// Simulate fetching a simplified version of the EE trial license and store it
export type EeTrialLicensePayload = { type: 'trial' } & (
  | {
      state: 'none';
    }
  | {
      state: 'active';
      expiry_at: number;
    }
  | {
      state: 'expired';
      expiry_at: number;
      grace_at: number;
    }
);
function useFetchEELiteLicense(hasuraPlan: HasuraPlan) {
  const isEeConsole = hasuraPlan.type === 'eeLite';

  const { status } = useQuery<EeTrialLicensePayload>({
    queryKey: ['eeLiteLicense'],
    queryFn: () => fetch('/ee-trials').then((res) => res.json()),
    onSuccess: setEeLiteLicense,
    enabled: isEeConsole,
  });

  // EE Lite license can only be load in EE Lite. For all the other plans, the default values of the
  // store are fine (since they are conservative) and we don't need to fetch anything.
  if (!isEeConsole) return 'notNeeded';

  return status;
}

// Can be used by anyone to refetch the ee lite license
export function useRefetchEELiteLicense() {
  return () => queryClient.invalidateQueries({ queryKey: ['eeLiteLicense'] });
}
