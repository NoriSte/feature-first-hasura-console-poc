import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChangeEnvVarsAtRuntime } from './app/fake/ChangeEnvVarsAtRuntime';

export const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChangeEnvVarsAtRuntime />
    </QueryClientProvider>
  </StrictMode>
);
