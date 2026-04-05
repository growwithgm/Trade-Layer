import { Router, Request, Response } from 'express';
import { shopify } from '../../shopify.js';

const router = Router();

// GET /api/products
// Returns the first page of products from the merchant's store.
router.get('/', async (req: Request, res: Response) => {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Rest({ session });

    const response = await client.get<{ products: unknown[] }>({
      path: 'products',
      query: { limit: '50', fields: 'id,title,status,variants,images' },
    });

    res.json({ products: response.body.products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/search?query=xxx
// Searches products by title for the Price Editor.
router.get('/search', async (req: Request, res: Response) => {
  try {
    const session = res.locals.shopify.session;
    const { query } = req.query as { query?: string };

    if (!query?.trim()) {
      res.status(400).json({ error: 'query param is required' });
      return;
    }

    const client = new shopify.api.clients.Rest({ session });

    const response = await client.get<{
      products: Array<{
        id: number;
        title: string;
        handle: string;
        images: Array<{ src: string }>;
        variants: Array<{ id: number; title: string; price: string; sku: string }>;
      }>;
    }>({
      path: 'products',
      query: { title: query.trim(), limit: '20', fields: 'id,title,handle,images,variants' },
    });

    const products = (response.body.products || []).map((p) => ({
      id: p.id,
      gid: `gid://shopify/Product/${p.id}`,
      title: p.title,
      handle: p.handle,
      image: p.images?.[0]?.src ?? null,
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        gid: `gid://shopify/ProductVariant/${v.id}`,
        title: v.title,
        price: v.price,
        sku: v.sku,
      })),
    }));

    res.json({ products });
  } catch (error) {
    console.error('GET /products/search error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

export default router;
