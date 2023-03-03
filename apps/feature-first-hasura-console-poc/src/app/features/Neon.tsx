import { IsFeatureEnabled } from '@feature-first-hasura-console-poc/hasura-features';

export function Neon() {
  return (
    <IsFeatureEnabled
      feature="neon"
      ifDisabled={(result) => {
        if (result.current.hasuraPlan.type === 'selfHostedCloud')
          return (
            <div style={{ background: 'yellow' }}>
              ❌ NEON is not available in self-hosted cloud!
            </div>
          );

        return (
          <div style={{ background: 'yellow' }}>
            ❌ NEON is available in cloud only!
          </div>
        );
      }}
    >
      <div style={{ background: 'yellow' }}>✅ NEON is enabled!</div>
    </IsFeatureEnabled>
  );
}
