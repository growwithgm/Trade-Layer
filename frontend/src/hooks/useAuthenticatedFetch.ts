import { useAppBridge } from '@shopify/app-bridge-react';

// App Bridge v4: useAppBridge() returns the global `shopify` object.
// shopify.idToken() returns a Promise<string> with the session JWT,
// which the backend validates via shopify.validateAuthenticatedSession().
export function useAuthenticatedFetch() {
  const shopify = useAppBridge();

  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = await shopify.idToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };
}
