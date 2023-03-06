import { useIsFeatureEnabled } from '@feature-first-hasura-console-poc/hasura-features';

export function Prometheus() {
  const result = useIsFeatureEnabled('prometheus');

  // ENABLED
  if (result.status === 'enabled') {
    return (
      <div style={{ background: 'yellow' }}>✅ PROMETHEUS is enabled!</div>
    );
  }

  // DISABLED
  if (result.reasons.doNotMatch.eeLite) {
    if (result.current.hasuraPlan.type === 'ce')
      return (
        <div style={{ background: 'yellow' }}>
          ❌ PROMETHEUS is not enabled in CE!
        </div>
      );
  }
  if (result.reasons.doNotMatch.eeLite) {
    if (result.current.eeLiteLicense.status === 'expired')
      return (
        <div style={{ background: 'yellow' }}>
          ❌ PROMETHEUS requires an active EE license
        </div>
      );
  }
  if (result.reasons.doNotMatch.eeLite) {
    if (result.current.hasuraPlan.type === 'cloud')
      return (
        <div style={{ background: 'yellow' }}>
          ❌ Look at feature XXX instead of using PROMETHEUS! You are in cloud
          and you do not need it!
        </div>
      );
    if (result.current.hasuraPlan.type === 'selfHostedCloud')
      return (
        <div style={{ background: 'yellow' }}>
          ❌ Look at feature XXX instead of using PROMETHEUS! You are in
          self-hosted and you do not need it!
        </div>
      );
  }

  if (result.reasons.doNotMatch.eeLiteLicense)
    return (
      <div style={{ background: 'yellow' }}>
        ❌ PROMETHEUS requires an active license!
      </div>
    );

  return <div style={{ background: 'yellow' }}>No Prometheus, I'm sorry</div>;
}
