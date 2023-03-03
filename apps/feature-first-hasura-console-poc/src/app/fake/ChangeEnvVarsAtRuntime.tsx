import { useConsoleInfoStore } from '@feature-first-hasura-console-poc/hasura-features';
import { useReducer } from 'react';
import App from '../app';
import {
  setSimulateEnvVars,
  setSimulateLuxEntitlements,
  setSimulateEeTrialLicense,
} from './mock';
import {
  useRefetchEELiteLicense,
  useRefetchLuxEntitlements,
} from '../useLoadHasuraPlan';

// Fakely allow to reload the app with a different window.__env object and also to change the
// server mock.
export function ChangeEnvVarsAtRuntime() {
  const [key, forceRender] = useReducer((s) => s + 1, 0);

  const consoleType = useConsoleInfoStore(
    (state) => state.serverEnvVars.consoleType
  );

  const refetchLuxEntitlements = useRefetchLuxEntitlements();
  const refetchEELiteLicense = useRefetchEELiteLicense();

  function simulateConsoleType(consoleType: string) {
    // @ts-expect-error I do not care about type validation for the sake of this POC
    setSimulateEnvVars(consoleType);
    forceRender();
  }
  function simulateLuxEntitlements(luxEntitlements: string) {
    setSimulateLuxEntitlements(luxEntitlements);
    refetchLuxEntitlements();
  }
  function simulateEeTrialLicense(simulation: string) {
    setSimulateEeTrialLicense(simulation);
    refetchEELiteLicense();
  }

  return (
    <div>
      <div style={{ background: 'silver' }}>
        <h3>Simulate changing the env vars</h3>
        <p>
          With this panel, you can simulate reloading the app using a different
          window.__env preset.
        </p>
        <button
          onClick={() => {
            simulateConsoleType('ce');
          }}
        >
          Reload app with CE env vars
        </button>{' '}
        -
        <button
          onClick={() => {
            simulateConsoleType('eeLite');
          }}
        >
          Reload app with EE Lite
        </button>{' '}
        -
        <button
          onClick={() => {
            simulateConsoleType('cloud');
          }}
        >
          Reload app with Cloud env vars
        </button>
        -
        <button
          onClick={() => {
            simulateConsoleType('selfHostedCloud');
          }}
        >
          Reload app with self-hosted Cloud env vars
        </button>
        <br />
        <br />
        <button
          disabled={consoleType !== 'cloud'}
          onClick={() => {
            simulateLuxEntitlements('noLuxEntitlements');
          }}
        >
          Set no lux entitlements and force reloading them
        </button>{' '}
        -
        <button
          disabled={consoleType !== 'cloud'}
          onClick={() => {
            simulateLuxEntitlements('allLuxEntitlements');
          }}
        >
          Set lux entitlements and force reloading them
        </button>
        <br />
        <br />
        <button
          disabled={consoleType !== 'pro-lite'}
          onClick={() => {
            simulateEeTrialLicense('active');
          }}
        >
          Set active EE trial license
        </button>{' '}
        -
        <button
          disabled={consoleType !== 'pro-lite'}
          onClick={() => {
            simulateEeTrialLicense('expired');
          }}
        >
          Set active EE trial license
        </button>
        <br />
        <br />
      </div>

      <App key={key} />
    </div>
  );
}
