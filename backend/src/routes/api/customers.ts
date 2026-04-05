import { Router, Request, Response } from 'express';
import { shopify } from '../../shopify.js';

const router = Router();

// GET /api/customers/search?query=<email or name>
// Searches Shopify customers via the Admin API and returns id + display info.
// Used in the admin UI to find customer GIDs before adding them to a group.
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
      customers: Array<{
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        orders_count: number;
        state: string;
      }>;
    }>({
      path: 'customers/search',
      query: { query: query.trim(), limit: '20', fields: 'id,first_name,last_name,email,orders_count,state' },
    });

    const customers = (response.body.customers || []).map((c) => ({
      // Expose both the numeric ID and the GID so the UI can use either.
      id: c.id,
      gid: `gid://shopify/Customer/${c.id}`,
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      ordersCount: c.orders_count,
      state: c.state,
    }));

    res.json({ customers });
  } catch (error) {
    console.error('GET /customers/search error:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
});

export default router;
