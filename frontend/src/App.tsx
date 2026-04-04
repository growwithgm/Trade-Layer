import { AppProvider as PolarisProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/index.js';

// App Bridge reads `host` from the URL query string (?host=<base64-encoded-admin-url>).
// The backend injects this when it redirects to the embedded app after OAuth.
function getAppBridgeConfig() {
  const params = new URLSearchParams(window.location.search);
  return {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY as string,
    host: params.get('host') ?? '',
    forceRedirect: true, // redirect to /auth if the session token is invalid
  };
}

export default function App() {
  return (
    <AppBridgeProvider config={getAppBridgeConfig()}>
      <PolarisProvider i18n={enTranslations}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PolarisProvider>
    </AppBridgeProvider>
  );
}
