import type { CompatibilityObject } from './compatibility';

const prometheus: CompatibilityObject = {
  cliMode: 'cliOrServer',
  ce: 'disabled',

  cloud: 'disabled',
  selfHostedCloud: 'disabled',
  luxEntitlements: {
    NeonDatabaseIntegration: 'notRequired',
    DatadogIntegration: 'notRequired',
  },

  eeLite: 'enabled',
  eeLiteLicense: 'required',
};

const neon: CompatibilityObject = {
  ce: 'disabled',
  cliMode: 'cliOrServer',

  cloud: 'enabled',
  selfHostedCloud: 'disabled',
  luxEntitlements: {
    NeonDatabaseIntegration: 'required',
    DatadogIntegration: 'notRequired',
  },

  eeLite: 'disabled',
  eeLiteLicense: 'notRequired',
};

export const features: Record<string, CompatibilityObject> = {
  prometheus,
  neon,
};
