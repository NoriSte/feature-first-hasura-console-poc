import { rest } from 'msw';



const simulatedEnvVars = {
  ceEnvVars: { consoleType: 'ce' },
  cloudEnvVars: { consoleType: 'cloud' },
  eeLiteWithLicenseEnvVars: { consoleType: 'eeLiteWithLicense' },
  eeLiteWithoutLicenseEnvVars: { consoleType: 'eeLiteWithoutLicense' },
};

export function setSimulateEnvVars(simulation: keyof typeof simulatedEnvVars) {
  // @ts-expect-error I'm simulating the global variable,I do nto care about type validation for the
  // sake of this POC
  window.__env = simulatedEnvVars[simulation];
}

const simulatedLuxEntitlements = {
  noLuxEntitlements: {},
  allLuxEntitlements: {
    DatadogIntegration: true,
    NeonDatabaseIntegration: true,
  },
};

export let simulateLuxEntitlements = simulatedLuxEntitlements.noLuxEntitlements;

export function setSimulateLuxEntitlements(
  simulation: keyof typeof simulatedLuxEntitlements
) {
  simulateLuxEntitlements = simulatedLuxEntitlements[simulation];
}



export const handlers = [
  rest.get('/lux-entitlements', (req, res, ctx) => {
    return res(ctx.json(simulateLuxEntitlements));
  })

];
