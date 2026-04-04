import { Router } from 'express';
import { shopify } from '../../shopify.js';
const router = Router();
// GET /api/products
// Returns the first page of products from the merchant's store.
router.get('/', async (req, res) => {
    try {
        const session = res.locals.shopify.session;
        const client = new shopify.api.clients.Rest({ session });
        const response = await client.get({
            path: 'products',
            query: { limit: '50', fields: 'id,title,status,variants,images' },
        });
        res.json({ products: response.body.products });
    }
    catch (error) {
        console.error('Failed to fetch products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
export default router;
//# sourceMappingURL=products.js.map