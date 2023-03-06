import { useConsoleInfoStore } from '@feature-first-hasura-console-poc/hasura-features';
import { Neon } from './features/Neon';
import { Prometheus } from './features/Prometheus';

export function Console() {
  const state = useConsoleInfoStore((state) => state);

  return (
    <>
      <br />
      <br />
      <br />
      <Prometheus />
      <br />
      <br />
      <br />
      <Neon />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <p>Current content of the store</p>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  );
}
