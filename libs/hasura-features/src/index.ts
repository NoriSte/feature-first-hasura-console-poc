export * from './lib/reactApi';

export type {
  HasuraPlan,
  ServerEnvVars,
  HasuraPlanState,
  EeTrialLicensePayload,
  LuxEntitlementsPayload,
} from './lib/store';

export type { MatchingReason } from './lib/compatibility';

export {
  resetState,
  useHasuraPlan,
  setServerEnvVars,
  setEeLiteLicense,
  useEeLiteLicense,
  setLuxEntitlements,
  useLuxEntitlements,

  // TODO: temporary exported for the sake of the POC
  useConsoleInfoStore,
} from './lib/store';

export { checkFeatureCompatibility } from './lib/compatibility';
