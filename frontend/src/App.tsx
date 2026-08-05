import { AppRouting } from '@/routing/app-routing';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';

const { BASE_URL } = import.meta.env;

export function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <HelmetProvider>
        <QueryProvider>
          <LoadingBarContainer>
            <BrowserRouter basename={BASE_URL}>
              <AuthProvider>
                <Toaster />
                <AppRouting />
              </AuthProvider>
            </BrowserRouter>
          </LoadingBarContainer>
        </QueryProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}
