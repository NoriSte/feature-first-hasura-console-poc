import type { ReactElement } from 'react';

import { checkFeatureCompatibility } from './compatibility';
import { useConsoleInfoStore } from './store';
import { features } from './features';

type Feature = keyof typeof features;

export function useIsFeatureEnabled(featureName: Feature) {
  const state = useConsoleInfoStore.getState();

  const compatibilityObject = features[featureName];

  return checkFeatureCompatibility(
    {
      hasuraPlan: state.hasuraPlan,
      luxEntitlements: state.luxEntitlements,
      eeLiteLicense: state.eeLiteLicense,
      cliMode: state.mode,
    },
    compatibilityObject
  );
}

export function IsFeatureEnabled(props: {
  feature: Feature;
  ifDisabled?: (result: ReturnType<typeof useIsFeatureEnabled>) => ReactElement;
  children: ReactElement;
}) {
  const { feature: featureName, children, ifDisabled } = props;
  const result = useIsFeatureEnabled(featureName);

  if (result.status === 'enabled') {
    return children;
  }

  return ifDisabled?.(result) ?? null;
}
