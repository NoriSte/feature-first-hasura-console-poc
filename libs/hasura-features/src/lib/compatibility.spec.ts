import produce from 'immer';
import { useConsoleInfoStore } from './store';

import type { CompatibilityObject } from './compatibility';
import { checkFeatureCompatibility } from './compatibility';

export const defaultCompatibilityObject: CompatibilityObject = {
  ce: 'disabled',
  cliMode: 'cliOrServer',

  cloud: 'disabled',
  selfHostedCloud: 'disabled',
  luxEntitlements: {
    NeonDatabaseIntegration: 'notRequired',
    DatadogIntegration: 'notRequired',
  },

  // While the other checks act as an OR operator, the eeLiteLicense acts as an AND operator to the 'eeLite' check
  eeLite: 'disabled',
  eeLiteLicense: 'notRequired',
};

describe('isFeatureEnabled', () => {
  afterEach(() => {
    useConsoleInfoStore.getState().resetState();
  });
  it('When passed with the env vars of the CE Console, and the feature is enabled only in the CE Console, then return `enabled`', () => {
    useConsoleInfoStore.getState().setServerEnvVars({
      mode: 'server',
      consoleType: 'oss',
    });

    const compatibilityObject = produce(defaultCompatibilityObject, (draft) => {
      draft.ce = 'enabled';
    });

    const state = useConsoleInfoStore.getState();
    const currentState = {
      hasuraPlan: state.hasuraPlan,
      luxEntitlements: state.luxEntitlements,
      eeLiteLicense: state.eeLiteLicense,
      cliMode: state.mode,
    };
    expect(checkFeatureCompatibility(currentState, compatibilityObject))
      .toMatchInlineSnapshot(`
      {
        "current": {
          "cliMode": "server",
          "eeLiteLicense": {
            "status": "none",
          },
          "hasuraPlan": {
            "type": "ce",
          },
          "luxEntitlements": {
            "DatadogIntegration": false,
            "NeonDatabaseIntegration": false,
          },
        },
        "reasons": {
          "doMatch": {
            "ce": true,
            "cliMode": true,
          },
          "doNotMatch": {},
        },
        "status": "enabled",
      }
    `);
  });

  it('When passed with the env vars of the CE Console, and the feature is enabled only in the EE Console, then return `disabled`', () => {
    useConsoleInfoStore.getState().setServerEnvVars({
      mode: 'server',
      consoleType: 'oss',
    });

    const compatibilityObject = produce(defaultCompatibilityObject, (draft) => {
      draft.eeLite = 'enabled';
    });

    const state = useConsoleInfoStore.getState();
    const currentState = {
      hasuraPlan: state.hasuraPlan,
      luxEntitlements: state.luxEntitlements,
      eeLiteLicense: state.eeLiteLicense,
      cliMode: state.mode,
    };
    expect(checkFeatureCompatibility(currentState, compatibilityObject))
      .toMatchInlineSnapshot(`
      {
        "current": {
          "cliMode": "server",
          "eeLiteLicense": {
            "status": "none",
          },
          "hasuraPlan": {
            "type": "ce",
          },
          "luxEntitlements": {
            "DatadogIntegration": false,
            "NeonDatabaseIntegration": false,
          },
        },
        "reasons": {
          "doMatch": {
            "cliMode": true,
          },
          "doNotMatch": {
            "eeLite": true,
          },
        },
        "status": "disabled",
      }
    `);
  });

  it('When passed with the env vars of the CE Console, and the feature is enabled both in the CE Console and EE Lite Console, then return `enabled`', () => {
    useConsoleInfoStore.getState().setServerEnvVars({
      mode: 'server',
      consoleType: 'oss',
    });

    const compatibilityObject = produce(defaultCompatibilityObject, (draft) => {
      draft.ce = 'enabled';
      draft.eeLite = 'enabled';
    });

    const state = useConsoleInfoStore.getState();
    const currentState = {
      hasuraPlan: state.hasuraPlan,
      luxEntitlements: state.luxEntitlements,
      eeLiteLicense: state.eeLiteLicense,
      cliMode: state.mode,
    };
    expect(checkFeatureCompatibility(currentState, compatibilityObject))
      .toMatchInlineSnapshot(`
      {
        "current": {
          "cliMode": "server",
          "eeLiteLicense": {
            "status": "none",
          },
          "hasuraPlan": {
            "type": "ce",
          },
          "luxEntitlements": {
            "DatadogIntegration": false,
            "NeonDatabaseIntegration": false,
          },
        },
        "reasons": {
          "doMatch": {
            "ce": true,
            "cliMode": true,
          },
          "doNotMatch": {
            "eeLite": true,
          },
        },
        "status": "enabled",
      }
    `);
  });

  describe('Entitlements check', () => {
    it('When passed with the env vars of the CE Console, and the feature is enabled only in the Cloud Console, then return `disabled', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cloud = 'enabled';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
            },
            "doNotMatch": {
              "cloud": true,
            },
          },
          "status": "disabled",
        }
      `);
    });

    it('When passed with the env vars of the Cloud Console, and the feature is enabled only in the Cloud Console, then return `enabled', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'cloud',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cloud = 'enabled';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "cloud",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
              "cloud": true,
            },
            "doNotMatch": {},
          },
          "status": "enabled",
        }
      `);
    });

    it('When passed with the env vars of the Cloud Console without any Lux entitlement, and the feature requires the Neon Lux entitlement, then return `disabled', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'cloud',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cloud = 'enabled';
          draft.luxEntitlements.NeonDatabaseIntegration = 'required';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "cloud",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
              "cloud": true,
            },
            "doNotMatch": {
              "luxEntitlements.NeonDatabaseIntegration": true,
            },
          },
          "status": "disabled",
        }
      `);
    });

    it('When passed with the env vars of the Cloud Console with the Neon Lux entitlement, and the feature requires the Neon Lux entitlement, then return `enabled', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'cloud',
      });
      useConsoleInfoStore.getState().setLuxEntitlements({
        NeonDatabaseIntegration: true,
        DatadogIntegration: false,
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cloud = 'enabled';
          draft.luxEntitlements.NeonDatabaseIntegration = 'required';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "cloud",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": true,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
              "cloud": true,
              "luxEntitlements.NeonDatabaseIntegration": true,
            },
            "doNotMatch": {},
          },
          "status": "enabled",
        }
      `);
    });

    it('When passed with the env vars of the Cloud Console with the DataDog Lux entitlement, and the feature requires the Neon Lux entitlement, then return `disabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'cloud',
      });
      useConsoleInfoStore.getState().setLuxEntitlements({
        NeonDatabaseIntegration: false,
        DatadogIntegration: true,
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cloud = 'enabled';
          draft.luxEntitlements.NeonDatabaseIntegration = 'required';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "cloud",
            },
            "luxEntitlements": {
              "DatadogIntegration": true,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
              "cloud": true,
            },
            "doNotMatch": {
              "luxEntitlements.NeonDatabaseIntegration": true,
            },
          },
          "status": "disabled",
        }
      `);
    });

    it('When passed with the env vars of the Cloud Console with all the Lux entitlement, and the feature requires the Neon Lux entitlement, then return `enabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'cloud',
      });
      useConsoleInfoStore.getState().setLuxEntitlements({
        NeonDatabaseIntegration: true,
        DatadogIntegration: true,
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cloud = 'enabled';
          draft.luxEntitlements.NeonDatabaseIntegration = 'required';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "cloud",
            },
            "luxEntitlements": {
              "DatadogIntegration": true,
              "NeonDatabaseIntegration": true,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
              "cloud": true,
              "luxEntitlements.NeonDatabaseIntegration": true,
            },
            "doNotMatch": {},
          },
          "status": "enabled",
        }
      `);
    });

    it('When passed with the env vars of the Cloud Console with all the Lux entitlements, and the feature requires all the Lux entitlement, then return `enabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'cloud',
      });
      useConsoleInfoStore.getState().setLuxEntitlements({
        NeonDatabaseIntegration: true,
        DatadogIntegration: true,
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cloud = 'enabled';
          draft.luxEntitlements.DatadogIntegration = 'required';
          draft.luxEntitlements.NeonDatabaseIntegration = 'required';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "cloud",
            },
            "luxEntitlements": {
              "DatadogIntegration": true,
              "NeonDatabaseIntegration": true,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
              "cloud": true,
              "luxEntitlements.DatadogIntegration": true,
              "luxEntitlements.NeonDatabaseIntegration": true,
            },
            "doNotMatch": {},
          },
          "status": "enabled",
        }
      `);
    });

    it('When passed with the env vars of the Cloud Console without Lux entitlements, and the feature requires the Neon Lux entitlement, then return `disabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'cloud',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cloud = 'enabled';
          draft.luxEntitlements.NeonDatabaseIntegration = 'required';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "cloud",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
              "cloud": true,
            },
            "doNotMatch": {
              "luxEntitlements.NeonDatabaseIntegration": true,
            },
          },
          "status": "disabled",
        }
      `);
    });
  });

  describe('CLI mode check', () => {
    it('When passed with the env vars of the CE Console in server mode, and the feature is enabled only with the server mode, then return `enabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.ce = 'enabled';
          draft.cliMode = 'serverOnly';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "ce": true,
              "cliMode": true,
            },
            "doNotMatch": {},
          },
          "status": "enabled",
        }
      `);
    });

    it('When passed with the env vars of the CE Console in CLI mode, and the feature is enabled only with the server mode, then return `disabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'cli',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cliMode = 'serverOnly';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "cli",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {},
            "doNotMatch": {
              "cliMode": true,
            },
          },
          "status": "disabled",
        }
      `);
    });

    it('When passed with the env vars of the CE Console in CLI mode, and the feature is enabled in both server and CLI mode, then return `enabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'cli',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.ce = 'enabled';
          draft.cliMode = 'cliOrServer';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "cli",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "ce": true,
              "cliMode": true,
            },
            "doNotMatch": {},
          },
          "status": "enabled",
        }
      `);
    });

    it('When passed with the env vars of the CE Console in CLI mode, and the feature is enabled only with the CLI mode, then return `enabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'cli',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.ce = 'enabled';
          draft.cliMode = 'cliOnly';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "cli",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "ce": true,
              "cliMode": true,
            },
            "doNotMatch": {},
          },
          "status": "enabled",
        }
      `);
    });

    it('When passed with the env vars of the CE Console in server mode, and the feature is enabled only in CLI mode, then return `disabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.ce = 'enabled';
          draft.cliMode = 'cliOnly';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "ce": true,
            },
            "doNotMatch": {
              "cliMode": true,
            },
          },
          "status": "disabled",
        }
      `);
    });

    it('When passed with the env vars of the CE Console in server mode, and the feature is enabled in CLI and server, then return `enabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.ce = 'enabled';
          draft.cliMode = 'cliOrServer';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "ce": true,
              "cliMode": true,
            },
            "doNotMatch": {},
          },
          "status": "enabled",
        }
      `);
    });

    it('When passed with the env vars of the CE Console in server mode, and the feature is enabled in EE Lite in CLI and server mode, then return `disabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.eeLite = 'enabled';
          draft.cliMode = 'cliOrServer';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
            },
            "doNotMatch": {
              "eeLite": true,
            },
          },
          "status": "disabled",
        }
      `);
    });

    it('When passed with the env vars of the CE Console in server mode, and the feature only requires the CLI mode without specifying the Hasura plan type, then return `disabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'cli',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.cliMode = 'cliOnly';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };

      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "cli",
            "eeLiteLicense": {
              "status": "none",
            },
            "hasuraPlan": {
              "type": "ce",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
            },
            "doNotMatch": {},
          },
          "status": "disabled",
        }
      `);
    });
  });

  describe('Edge/impossible cases to stress the function', () => {
    it('When passed with the env vars of the CE Console, and the feature is enabled in CE mode and requires some Lux entitlements, then return `disabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'oss',
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.ce = 'enabled';
          draft.luxEntitlements.DatadogIntegration = 'required';
          draft.luxEntitlements.NeonDatabaseIntegration = 'required';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
      {
        "current": {
          "cliMode": "server",
          "eeLiteLicense": {
            "status": "none",
          },
          "hasuraPlan": {
            "type": "ce",
          },
          "luxEntitlements": {
            "DatadogIntegration": false,
            "NeonDatabaseIntegration": false,
          },
        },
        "reasons": {
          "doMatch": {
            "ce": true,
            "cliMode": true,
          },
          "doNotMatch": {
            "luxEntitlements.DatadogIntegration": true,
            "luxEntitlements.NeonDatabaseIntegration": true,
          },
        },
        "status": "disabled",
      }
    `);
    });

    it('When passed with the env vars of the Cloud Console and with an active EE Lite license, and the feature is enabled when there is an active EE Lite license, then return `disabled`', () => {
      useConsoleInfoStore.getState().setServerEnvVars({
        mode: 'server',
        consoleType: 'cloud',
      });

      useConsoleInfoStore.getState().setEeLiteLicense({
        type: 'trial',
        state: 'active',
        expiry_at: 0,
      });

      const compatibilityObject = produce(
        defaultCompatibilityObject,
        (draft) => {
          draft.eeLite = 'enabled';
          draft.eeLiteLicense = 'required';
        }
      );

      const state = useConsoleInfoStore.getState();
      const currentState = {
        hasuraPlan: state.hasuraPlan,
        luxEntitlements: state.luxEntitlements,
        eeLiteLicense: state.eeLiteLicense,
        cliMode: state.mode,
      };
      expect(checkFeatureCompatibility(currentState, compatibilityObject))
        .toMatchInlineSnapshot(`
        {
          "current": {
            "cliMode": "server",
            "eeLiteLicense": {
              "expirationDate": 0,
              "status": "active",
            },
            "hasuraPlan": {
              "type": "cloud",
            },
            "luxEntitlements": {
              "DatadogIntegration": false,
              "NeonDatabaseIntegration": false,
            },
          },
          "reasons": {
            "doMatch": {
              "cliMode": true,
              "eeLiteLicense": true,
            },
            "doNotMatch": {
              "eeLite": true,
            },
          },
          "status": "disabled",
        }
      `);
    });
  });
});
