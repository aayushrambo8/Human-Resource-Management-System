import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthContextValue } from '@/lib/auth-context';

export interface HarnessOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Roles the simulated session carries. Defaults to ADMIN. */
  roles?: string[];
  email?: string;
}

/**
 * Renders a page with the two providers every dashboard route assumes:
 * React Query (with retries off so failures surface immediately) and the auth
 * context. `next/link` / `next/navigation` are stubbed per test file.
 */
export function renderWithProviders(ui: ReactElement, options: HarnessOptions = {}): RenderResult {
  const { roles = ['ADMIN'], email = 'admin@northstar.local', ...renderOptions } = options;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });

  const authValue: AuthContextValue = {
    email,
    roles,
    isAuthenticated: true,
    login: async () => {},
    logout: async () => {},
  };

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/** A Next.js link rendered as a plain anchor so jsdom can traverse it. */
export function stubNextLink() {
  return {
    default: ({
      href,
      children,
      ...rest
    }: {
      href: string;
      children: ReactNode;
      [key: string]: unknown;
    }) => (
      <a href={href} {...rest}>
        {children}
      </a>
    ),
  };
}
