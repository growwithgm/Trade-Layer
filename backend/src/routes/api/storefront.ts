import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prismaClient.js';

// These endpoints are called by the theme extension (storefront) and are
// NOT protected by Shopify session auth — the shop is identified by the
// shopDomain query param instead.
const router = Router();

// GET /api/storefront/pricing?shopDomain=xxx&shopifyCustomerId=yyy&shopifyProductId=zzz
// Returns the best applicable pricing rule for a customer+product combo.
// Priority: variant-level > product-level; customer-specific > group > store-wide.
router.get('/pricing', async (req: Request, res: Response) => {
  try {
    const { shopDomain, shopifyCustomerId, shopifyProductId, shopifyVariantId } = req.query as {
      shopDomain?: string;
      shopifyCustomerId?: string;
      shopifyProductId?: string;
      shopifyVariantId?: string;
    };

    if (!shopDomain || !shopifyProductId) {
      res.status(400).json({ error: 'shopDomain and shopifyProductId are required' });
      return;
    }

    const store = await prisma.store.findUnique({ where: { shopDomain }, select: { id: true } });
    if (!store) {
      res.json({ rule: null });
      return;
    }

    // Find customer's groups if a customerId was provided.
    let groupIds: string[] = [];
    if (shopifyCustomerId) {
      const memberships = await prisma.customerGroupMember.findMany({
        where: { shopifyCustomerId },
        select: { customerGroupId: true },
      });
      groupIds = memberships.map((m) => m.customerGroupId);
    }

    // Fetch all active rules for this store+product combo, highest priority first.
    const candidates = await prisma.pricingRule.findMany({
      where: {
        storeId: store.id,
        isActive: true,
        OR: [
          { shopifyVariantId: shopifyVariantId ?? null },
          { shopifyVariantId: null, shopifyProductId },
          { shopifyVariantId: null, shopifyProductId: null },
        ],
      },
      orderBy: [{ priority: 'desc' }],
    });

    // Pick best rule: customer-specific first, then group, then store-wide.
    const rule =
      candidates.find((r) => r.shopifyCustomerId === shopifyCustomerId) ??
      candidates.find((r) => r.customerGroupId && groupIds.includes(r.customerGroupId)) ??
      candidates.find((r) => !r.shopifyCustomerId && !r.customerGroupId) ??
      null;

    res.json({ rule });
  } catch (error) {
    console.error('GET /storefront/pricing error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// POST /api/storefront/cart/validate
// Validates cart line items against quantity rules.
// Body: { shopDomain: string, lineItems: [{ shopifyVariantId, shopifyProductId, quantity }] }
// Returns: { valid: boolean, errors: [{ variantId, message }] }
router.post('/cart/validate', async (req: Request, res: Response) => {
  try {
    const { shopDomain, lineItems } = req.body as {
      shopDomain?: string;
      lineItems?: Array<{ shopifyVariantId?: string; shopifyProductId: string; quantity: number }>;
    };

    if (!shopDomain || !Array.isArray(lineItems)) {
      res.status(400).json({ error: 'shopDomain and lineItems are required' });
      return;
    }

    const store = await prisma.store.findUnique({ where: { shopDomain }, select: { id: true } });
    if (!store) {
      res.json({ valid: true, errors: [] });
      return;
    }

    const errors: Array<{ shopifyProductId: string; shopifyVariantId?: string; message: string }> = [];

    for (const item of lineItems) {
      const rule = await prisma.quantityRule.findFirst({
        where: {
          storeId: store.id,
          isActive: true,
          OR: [
            { shopifyVariantId: item.shopifyVariantId ?? null },
            { shopifyVariantId: null, shopifyProductId: item.shopifyProductId },
          ],
        },
        orderBy: { shopifyVariantId: 'desc' }, // variant-level takes precedence
      });

      if (!rule) continue;

      if (item.quantity < rule.minQuantity) {
        errors.push({
          shopifyProductId: item.shopifyProductId,
          shopifyVariantId: item.shopifyVariantId,
          message: `Minimum order quantity is ${rule.minQuantity}`,
        });
      } else if (rule.maxQuantity !== null && item.quantity > rule.maxQuantity) {
        errors.push({
          shopifyProductId: item.shopifyProductId,
          shopifyVariantId: item.shopifyVariantId,
          message: `Maximum order quantity is ${rule.maxQuantity}`,
        });
      } else if (rule.stepQuantity > 1 && (item.quantity - rule.minQuantity) % rule.stepQuantity !== 0) {
        errors.push({
          shopifyProductId: item.shopifyProductId,
          shopifyVariantId: item.shopifyVariantId,
          message: `Quantity must be in multiples of ${rule.stepQuantity} starting from ${rule.minQuantity}`,
        });
      }
    }

    res.json({ valid: errors.length === 0, errors });
  } catch (error) {
    console.error('POST /storefront/cart/validate error:', error);
    res.status(500).json({ error: 'Failed to validate cart' });
  }
});

export default router;
