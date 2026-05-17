'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { LanguageProvider } from './LanguageContext';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds - matches race data refresh
            refetchInterval: 30 * 1000, // Poll every 30 seconds
            refetchOnWindowFocus: true,
            retry: 2,
          },
        },
      })
  );

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </LanguageProvider>
  );
}