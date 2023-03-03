// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { Console } from './Console';

import './fake/mock';

import { useLoadHasuraPlan } from './useLoadHasuraPlan';

export function App() {
  // Initial load every dynamic stuff required to identify the Hasura plan
  const status = useLoadHasuraPlan(
    // @ts-expect-error I do not care about type validation for the sake of this POC
    window.__env
  );

  switch (status) {
    case 'loading':
      return <div>Loading...</div>;
    case 'unknown':
      return <div>Unknown...</div>;
    case 'error':
      return <div>Error</div>;
    case 'success':
      return <Console />;
  }
}

export default App;
