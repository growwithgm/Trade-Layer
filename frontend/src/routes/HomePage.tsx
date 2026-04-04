import { useState, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  Button,
  DataTable,
  Banner,
  Text,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch.js';

interface Product {
  id: number;
  title: string;
  status: string;
  variants: Array<{ price: string }>;
}

export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { products: Product[] };
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  const rows = products.map((p) => [
    p.id,
    p.title,
    p.status,
    p.variants[0]?.price ?? '—',
  ]);

  return (
    <Page title="Products">
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="critical" title="Error loading products">
              <Text as="p">{error}</Text>
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section>
          <Card>
            <Button onClick={loadProducts} loading={loading} variant="primary">
              Load Products
            </Button>
            {products.length > 0 && (
              <DataTable
                columnContentTypes={['numeric', 'text', 'text', 'numeric']}
                headings={['ID', 'Title', 'Status', 'Price']}
                rows={rows}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
