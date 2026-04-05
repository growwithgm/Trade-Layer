import { AppProvider as PolarisProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/index.js';

// App Bridge v4 no longer uses a <Provider> wrapper component.
// It initializes automatically via the CDN script tag in index.html
// (data-api-key="%VITE_SHOPIFY_API_KEY%") and exposes the global `shopify` object.
export default function App() {
  return (
    <PolarisProvider i18n={enTranslations}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </PolarisProvider>
  );
}
