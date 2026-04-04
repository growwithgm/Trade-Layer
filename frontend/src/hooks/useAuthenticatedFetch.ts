import { useAuthenticatedFetch as useAppBridgeFetch } from '@shopify/app-bridge-react';

// Wraps App Bridge's fetch so every request automatically includes
// an `Authorization: Bearer <session-token>` header.
// The backend validates this via shopify.validateAuthenticatedSession().
export function useAuthenticatedFetch() {
  return useAppBridgeFetch();
}
