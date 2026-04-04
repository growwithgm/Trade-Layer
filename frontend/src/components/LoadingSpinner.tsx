import { Spinner, Box } from '@shopify/polaris';

interface LoadingSpinnerProps {
  accessibilityLabel?: string;
}

export function LoadingSpinner({ accessibilityLabel = 'Loading' }: LoadingSpinnerProps) {
  return (
    <Box padding="800" as="div">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Spinner accessibilityLabel={accessibilityLabel} size="large" />
      </div>
    </Box>
  );
}
