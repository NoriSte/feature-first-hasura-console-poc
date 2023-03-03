import type {
  HasuraPlan,
  ServerEnvVars,
  EeTrialLicensePayload,
  LuxEntitlementsPayload,
} from '@feature-first-hasura-console-poc/hasura-features';
import { setupWorker, rest } from 'msw';

// --------------------------------------------
// SERVER ENV VARS (window.__env)
// --------------------------------------------
const simulatedEnvVars: Record<HasuraPlan['type'], ServerEnvVars> = {
  ce: { consoleType: 'oss' },
  cloud: { consoleType: 'cloud' },
  eeLite: { consoleType: 'pro-lite' },
  selfHostedCloud: { consoleType: 'pro' },
};

// @ts-expect-error I'm simulating the global variable,I do nto care about type validation for the
// sake of this POC
window.__env = simulatedEnvVars.ce;

export function setSimulateEnvVars(simulation: keyof typeof simulatedEnvVars) {
  // @ts-expect-error I'm simulating the global variable,I do nto care about type validation for the
  // sake of this POC
  window.__env = simulatedEnvVars[simulation];
}

// --------------------------------------------
// LUX ENTITLEMENTS
// --------------------------------------------
const simulatedLuxEntitlements: Record<string, LuxEntitlementsPayload> = {
  noLuxEntitlements: {
    DatadogIntegration: false,
    NeonDatabaseIntegration: false,
  },
  allLuxEntitlements: {
    DatadogIntegration: true,
    NeonDatabaseIntegration: true,
  },
};

let simulateLuxEntitlements = simulatedLuxEntitlements.noLuxEntitlements;

export function setSimulateLuxEntitlements(
  simulation: keyof typeof simulatedLuxEntitlements
) {
  simulateLuxEntitlements = simulatedLuxEntitlements[simulation];
}

// --------------------------------------------
// EE LITE LICENSE
// --------------------------------------------
const oneDay = 24 * 60 * 60 * 1000;
const simulatedEeTrialLicense: Record<string, EeTrialLicensePayload> = {
  none: {
    type: 'trial',
    state: 'none',
  },
  active: {
    type: 'trial',
    state: 'active',
    expiry_at: Date.now() + oneDay,
  },
  expired: {
    type: 'trial',
    state: 'expired',
    expiry_at: Date.now() - oneDay - oneDay,
    grace_at: Date.now() - oneDay,
  },
};

let simulateEeTrialLicense = simulatedEeTrialLicense.none;

export function setSimulateEeTrialLicense(
  simulation: keyof typeof simulatedEeTrialLicense
) {
  simulateEeTrialLicense = simulatedEeTrialLicense[simulation];
}

// --------------------------------------------
// WORKER
// --------------------------------------------
const worker = setupWorker(
  rest.get('/lux-entitlements', (req, res, ctx) => {
    return res(ctx.delay(), ctx.json(simulateLuxEntitlements));
  }),
  rest.get('/ee-trials', (req, res, ctx) => {
    return res(ctx.delay(), ctx.json(simulateEeTrialLicense));
  })
);

worker.start();
