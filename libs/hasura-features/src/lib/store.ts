import { create } from 'zustand';

// --------------------------------------------------
// SERVER RESPONSES
// --------------------------------------------------

// A simplified version of the EE trial license and store it
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

// A simplified version of the Lux entitlements and store them
export type LuxEntitlementsPayload = {
  DatadogIntegration: boolean;
  NeonDatabaseIntegration: boolean;
};

export type CliMode = 'server' | 'cli';

// --------------------------------------------------
// STATE
// --------------------------------------------------

export interface HasuraPlanState {
  // A parsed version of the env vars
  hasuraPlan: HasuraPlan;

  // The original window.__env object
  serverEnvVars: ServerEnvVars;

  luxEntitlements: LuxEntitlements;

  eeLiteLicense: EELiteLicense;

  mode: CliMode;
}

export type ServerEnvVars = {
  consoleType: 'oss' | 'pro-lite' | 'cloud' | 'pro';
  mode: CliMode;
};

export type HasuraPlan = {
  type: 'ce' | 'eeLite' | 'cloud' | 'selfHostedCloud';
};

// A simplified version (for the sake of this POC) of the Lux Entitlements
export type LuxEntitlements = {
  NeonDatabaseIntegration: boolean;
  DatadogIntegration: boolean;
};

// A simplified version (for the sake of this POC) of the EE Lite license
export type EELiteLicense =
  | {
      status: 'none';
    }
  | {
      status: 'active';
      expirationDate: number;
    }
  | {
      status: 'gracePeriod' | 'expired';
      expirationDate: number;
      gracePeriodExpirationDate: number;
    };

export const defaultState: HasuraPlanState = {
  hasuraPlan: { type: 'ce' },
  serverEnvVars: { consoleType: 'oss', mode: 'server' },
  luxEntitlements: {
    NeonDatabaseIntegration: false,
    DatadogIntegration: false,
  },
  eeLiteLicense: {
    status: 'none',
  },
  mode: 'server',
};

type Setters = {
  resetState: () => void;
  setServerEnvVars: (serverEnvVars: ServerEnvVars) => void;
  setLuxEntitlements: (luxEntitlements: LuxEntitlements) => void;
  setEeLiteLicense: (eeLiteLicense: EeTrialLicensePayload) => void;
};
type Store = HasuraPlanState & Setters;

// --------------------------------------------------
// STORE
// --------------------------------------------------

/**
 * useConsoleInfoStore should not be used outside its lib. It's temporary exported for the sake of the POC
 * @deprecated
 */
export const useConsoleInfoStore = create<Store>((set) => ({
  ...defaultState,

  // Receives the original window.__env object and transforms it into a more convenient format
  setServerEnvVars: (serverEnvVars) =>
    set((prev) => {
      const nextHasuraPlanType =
        serverEnvVars.consoleType === 'oss'
          ? 'ce'
          : serverEnvVars.consoleType === 'pro-lite'
          ? 'eeLite'
          : serverEnvVars.consoleType === 'pro'
          ? 'selfHostedCloud'
          : serverEnvVars.consoleType === 'cloud'
          ? 'cloud'
          : 'unknown';

      if (nextHasuraPlanType === 'unknown') {
        // TODO: manage it softly in the real Console
        throw new Error('Unknown Hasura plan type');
      }

      return {
        ...prev,
        hasuraPlan: {
          type: nextHasuraPlanType,
        },
        serverEnvVars,
        mode: serverEnvVars.mode,
      };
    }),

  setLuxEntitlements: (luxEntitlements) =>
    set((prev) => {
      return {
        ...prev,
        luxEntitlements,
      };
    }),

  // Receives the original EE Lite license response from the server and transforms it into a more convenient format
  setEeLiteLicense: (eeLiteLicenseResponse: EeTrialLicensePayload) =>
    set((prev) => {
      // Disabled fo the sake of the POC where I need to play with the store
      // if (prev.hasuraPlan.type !== 'eeLite') {
      //   // TODO: manage it softly in the real Console
      //   throw new Error('Unexpected EE Lite license details');
      // }

      let eeLiteLicense: EELiteLicense;
      switch (eeLiteLicenseResponse.state) {
        case 'none':
          eeLiteLicense = { status: 'none' };
          break;

        case 'active':
          eeLiteLicense = {
            status: 'active',
            expirationDate: eeLiteLicenseResponse.expiry_at,
          };
          break;

        case 'expired':
          if (eeLiteLicenseResponse.grace_at > Date.now()) {
            eeLiteLicense = {
              status: 'gracePeriod',
              expirationDate: eeLiteLicenseResponse.expiry_at,
              gracePeriodExpirationDate: eeLiteLicenseResponse.grace_at,
            };
          } else {
            eeLiteLicense = {
              status: 'expired',
              expirationDate: eeLiteLicenseResponse.expiry_at,
              gracePeriodExpirationDate: eeLiteLicenseResponse.grace_at,
            };
          }
          break;
      }

      return {
        ...prev,
        eeLiteLicense,
      };
    }),

  resetState: () => {
    set({
      hasuraPlan: defaultState.hasuraPlan,
      serverEnvVars: defaultState.serverEnvVars,
      eeLiteLicense: defaultState.eeLiteLicense,
      luxEntitlements: defaultState.luxEntitlements,
    });
  },
}));

// --------------------------------------------------
// APIS
// --------------------------------------------------
export const resetState = useConsoleInfoStore.getState().resetState;
export const setServerEnvVars = useConsoleInfoStore.getState().setServerEnvVars;
export const setEeLiteLicense = useConsoleInfoStore.getState().setEeLiteLicense;
export const setLuxEntitlements =
  useConsoleInfoStore.getState().setLuxEntitlements;

// --------------------------------------------------
// REACT APIS
// --------------------------------------------------
export function useHasuraPlan() {
  return useConsoleInfoStore((state) => state.hasuraPlan);
}
export function useLuxEntitlements() {
  return useConsoleInfoStore((state) => state.luxEntitlements);
}
export function useEeLiteLicense() {
  return useConsoleInfoStore((state) => state.eeLiteLicense);
}
