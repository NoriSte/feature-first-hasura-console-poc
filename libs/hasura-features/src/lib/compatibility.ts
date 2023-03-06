// --------------------------------------------------
// COMPATIBILITY
// --------------------------------------------------

import type {
  HasuraPlan,
  HasuraPlanState,
  LuxEntitlements,
  EELiteLicense,
  CliMode,
} from './store';

type EnabledOrNot = 'enabled' | 'disabled';
type RequiredOrNot = 'required' | 'notRequired';
type CliModeCompatibility = 'cliOnly' | 'serverOnly' | 'cliOrServer';

// Everything at the root is interpreted like an OR operator: {ce:'enabled', eeLiteWithLicense:'enabled'} means "enabled if ce OR eeLiteWithLicense".
// All the properties are required on purpose: because it's too easy to forget to add a check, especially when we add new conditions.
export type CompatibilityObject = {
  ce: EnabledOrNot;
  cliMode: CliModeCompatibility;

  // While the other checks act as an OR operator, the luxEntitlements acts as an AND operator to the 'cloud' check
  cloud: EnabledOrNot;
  selfHostedCloud: EnabledOrNot;
  luxEntitlements: {
    // If not specified, no entitlements are required. If they are specified, they act as an additional filter to 'cloud'
    NeonDatabaseIntegration: RequiredOrNot;
    DatadogIntegration: RequiredOrNot;
  };

  // While the other checks act as an OR operator, the eeLiteLicense acts as an AND operator to the 'eeLite' check
  eeLite: EnabledOrNot;
  eeLiteLicense: RequiredOrNot;
};

export type MatchingReason =
  | 'ce'
  | 'eeLite'
  | 'eeLiteLicense'
  | 'cloud'
  | 'selfHostedCloud'
  | 'cliMode'
  | 'luxEntitlements.NeonDatabaseIntegration'
  | 'luxEntitlements.DatadogIntegration';

// Theoretically the content of doMatch and doNotMatch could be inferred by the object compatibilityObject passed to the checkFeatureCompatibility function. This would allow auto completion only for the things requred by the developer
type ReturnValue = {
  status: EnabledOrNot;
  reasons: {
    doMatch: Partial<Record<MatchingReason, true>>;
    doNotMatch: Partial<Record<MatchingReason, true>>;
  };
  current: {
    hasuraPlan: HasuraPlanState['hasuraPlan'];
    eeLiteLicense: HasuraPlanState['eeLiteLicense'];
    luxEntitlements: HasuraPlanState['luxEntitlements'];
  };
};

export function checkFeatureCompatibility(
  currentState: {
    hasuraPlan: HasuraPlan;
    luxEntitlements: LuxEntitlements;
    eeLiteLicense: EELiteLicense;
    cliMode: CliMode;
  },
  compatibilityObject: CompatibilityObject
): ReturnValue {
  const current = {
    hasuraPlan: currentState.hasuraPlan,
    eeLiteLicense: currentState.eeLiteLicense,
    luxEntitlements: currentState.luxEntitlements,
    cliMode: currentState.cliMode,
  };

  const doMatch: Partial<Record<MatchingReason, true>> = {};
  const doNotMatch: Partial<Record<MatchingReason, true>> = {};

  let doNotAcceptCloud = false;
  let doNotAcceptSelfHostedCloud = false;
  let doNotAcceptEeLite = false;

  if (compatibilityObject.ce === 'enabled') {
    if (current.hasuraPlan.type === 'ce') doMatch.ce = true;
    else doNotMatch.ce = true;
  }

  if (compatibilityObject.eeLite === 'enabled') {
    if (current.hasuraPlan.type === 'eeLite') doMatch.eeLite = true;
    else doNotMatch.eeLite = true;
  }

  if (compatibilityObject.eeLiteLicense === 'required') {
    if (
      current.eeLiteLicense.status === 'active' ||
      current.eeLiteLicense.status === 'gracePeriod'
    ) {
      doMatch.eeLiteLicense = true;
    } else {
      doNotMatch.eeLiteLicense = true;
      doNotAcceptEeLite = true;
    }
  }

  if (compatibilityObject.cloud === 'enabled') {
    if (current.hasuraPlan.type === 'cloud') doMatch.cloud = true;
    else doNotMatch.cloud = true;
  }
  if (compatibilityObject.selfHostedCloud === 'enabled') {
    if (current.hasuraPlan.type === 'selfHostedCloud')
      doMatch.selfHostedCloud = true;
    else doNotMatch.selfHostedCloud = true;
  }

  if (
    compatibilityObject.luxEntitlements.NeonDatabaseIntegration === 'required'
  ) {
    if (current.luxEntitlements.NeonDatabaseIntegration) {
      doMatch['luxEntitlements.NeonDatabaseIntegration'] = true;
    } else {
      doNotMatch['luxEntitlements.NeonDatabaseIntegration'] = true;

      doNotAcceptCloud = true;
      doNotAcceptSelfHostedCloud = true;
    }
  }
  if (compatibilityObject.luxEntitlements.DatadogIntegration === 'required') {
    if (current.luxEntitlements.DatadogIntegration) {
      doMatch['luxEntitlements.DatadogIntegration'] = true;
    } else {
      doNotMatch['luxEntitlements.DatadogIntegration'] = true;

      doNotAcceptCloud = true;
      doNotAcceptSelfHostedCloud = true;
    }
  }

  switch (compatibilityObject.cliMode) {
    case 'cliOnly':
      if (current.cliMode === 'cli') doMatch.cliMode = true;
      else doNotMatch.cliMode = true;
      break;
    case 'serverOnly':
      if (current.cliMode === 'server') doMatch.cliMode = true;
      else doNotMatch.cliMode = true;
      break;
    case 'cliOrServer':
      doMatch.cliMode = true;
      break;
  }

  // If the cli/server mode is not compatible, this wins over all other checks
  const modeIsNotCompatible = doNotMatch.cliMode;

  // In some special cases, checking that doMatch contains at least one element is not enough
  if (
    doNotAcceptCloud ||
    doNotAcceptSelfHostedCloud ||
    doNotAcceptEeLite ||
    modeIsNotCompatible
  ) {
    return {
      status: 'disabled',
      reasons: {
        doMatch,
        doNotMatch,
      },
      current,
    };
  }

  // If the cli/server mode is compatible, but other checks are not, the feature is disabled
  const cliModeIsTheOnlyReasonToEnable =
    Object.keys(doMatch).length === 1 && doMatch.cliMode;
  const eeLiteLicenseInNotEeLitePlan =
    doMatch.eeLiteLicense && doNotMatch.eeLite;
  if (cliModeIsTheOnlyReasonToEnable || eeLiteLicenseInNotEeLitePlan)
    return {
      status: 'disabled',
      reasons: {
        doMatch,
        doNotMatch,
      },
      current,
    };

  // One match is enough to allow the feature
  if (Object.keys(doMatch).length) {
    return {
      status: 'enabled',
      reasons: {
        doMatch,
        doNotMatch,
      },
      current,
    };
  }

  return {
    status: 'disabled',
    reasons: {
      doMatch,
      doNotMatch,
    },
    current,
  };

  // Maybe we could get a warning in case of doMatch.length === 0 && doNotMatch.length === 0 because means an empty object has been passed
}
