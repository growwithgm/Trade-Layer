import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prismaClient.js';

const router = Router();

// ── ID helpers (mirrors storefront.ts) ────────────────────────────────────────
function toNumeric(id: string): string {
  const match = id.match(/\/(\d+)$/);
  return match ? match[1] : id;
}
function bothProductFormats(id: string): string[] {
  const numeric = toNumeric(id);
  const gid = `gid://shopify/Product/${numeric}`;
  return Array.from(new Set([id, numeric, gid]));
}

async function getStoreId(shopDomain: string): Promise<string> {
  const store = await prisma.store.upsert({
    where: { shopDomain },
    create: { shopDomain, accessToken: '' },
    update: {},
    select: { id: true },
  });
  return store.id;
}

// GET /api/pricing-rules
router.get('/', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const rules = await prisma.pricingRule.findMany({
      where: { storeId },
      include: { customerGroup: { select: { id: true, name: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ pricingRules: rules });
  } catch (error) {
    console.error('GET /pricing-rules error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

// POST /api/pricing-rules
router.post('/', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const {
      customerGroupId,
      shopifyCustomerId,
      shopifyProductId,
      shopifyVariantId,
      ruleType,
      value,
      priority,
    } = req.body as {
      customerGroupId?: string;
      shopifyCustomerId?: string;
      shopifyProductId?: string;
      shopifyVariantId?: string;
      ruleType?: string;
      value?: number;
      priority?: number;
    };

    if (!ruleType || !['percentage_discount', 'fixed_price'].includes(ruleType)) {
      res.status(400).json({ error: 'ruleType must be "percentage_discount" or "fixed_price"' });
      return;
    }
    if (value === undefined || value === null) {
      res.status(400).json({ error: 'value is required' });
      return;
    }

    const rule = await prisma.pricingRule.create({
      data: {
        storeId,
        customerGroupId: customerGroupId ?? null,
        shopifyCustomerId: shopifyCustomerId ?? null,
        shopifyProductId: shopifyProductId ?? null,
        shopifyVariantId: shopifyVariantId ?? null,
        ruleType,
        value,
        priority: priority ?? 0,
      },
    });

    res.status(201).json({ pricingRule: rule });
  } catch (error) {
    console.error('POST /pricing-rules error:', error);
    res.status(500).json({ error: 'Failed to create pricing rule' });
  }
});

// GET /api/pricing-rules/by-product?shopifyProductId=xxx
// Returns all product-specific pricing rules for the Price Editor.
router.get('/by-product', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { shopifyProductId } = req.query as { shopifyProductId?: string };

    if (!shopifyProductId) {
      res.status(400).json({ error: 'shopifyProductId is required' });
      return;
    }

    const productFormats = bothProductFormats(shopifyProductId);

    const rules = await prisma.pricingRule.findMany({
      where: {
        storeId,
        shopifyProductId: { in: productFormats },
      },
      include: { customerGroup: { select: { id: true, name: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ pricingRules: rules });
  } catch (error) {
    console.error('GET /pricing-rules/by-product error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing rules by product' });
  }
});

// PUT /api/pricing-rules/quick-update
// Upserts a pricing rule for a specific product + group combination.
router.put('/quick-update', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const { shopifyProductId, shopifyVariantId, customerGroupId, ruleType, value } = req.body as {
      shopifyProductId?: string;
      shopifyVariantId?: string;
      customerGroupId?: string | null;
      ruleType?: string;
      value?: number;
    };

    if (!shopifyProductId || !ruleType || value === undefined || value === null) {
      res.status(400).json({ error: 'shopifyProductId, ruleType, and value are required' });
      return;
    }
    if (!['percentage_discount', 'fixed_price'].includes(ruleType)) {
      res.status(400).json({ error: 'ruleType must be "percentage_discount" or "fixed_price"' });
      return;
    }

    const productFormats = bothProductFormats(shopifyProductId);
    const numericValue = parseFloat(String(value));

    // Find existing rule for this product + group combination
    const existing = await prisma.pricingRule.findFirst({
      where: {
        storeId,
        customerGroupId: customerGroupId ?? null,
        shopifyProductId: { in: productFormats },
        shopifyVariantId: shopifyVariantId ?? null,
      },
    });

    let rule;
    if (existing) {
      rule = await prisma.pricingRule.update({
        where: { id: existing.id },
        data: { ruleType, value: numericValue, isActive: true },
      });
    } else {
      rule = await prisma.pricingRule.create({
        data: {
          storeId,
          customerGroupId: customerGroupId ?? null,
          shopifyProductId,
          shopifyVariantId: shopifyVariantId ?? null,
          ruleType,
          value: numericValue,
          isActive: true,
          priority: 0,
        },
      });
    }

    res.json({ pricingRule: rule });
  } catch (error) {
    console.error('PUT /pricing-rules/quick-update error:', error);
    res.status(500).json({ error: 'Failed to upsert pricing rule' });
  }
});

// PUT /api/pricing-rules/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { id } = req.params;

    const existing = await prisma.pricingRule.findFirst({ where: { id, storeId } });
    if (!existing) {
      res.status(404).json({ error: 'Pricing rule not found' });
      return;
    }

    const { ruleType, value, isActive, priority, customerGroupId, shopifyCustomerId, shopifyProductId, shopifyVariantId } =
      req.body as {
        ruleType?: string;
        value?: number;
        isActive?: boolean;
        priority?: number;
        customerGroupId?: string | null;
        shopifyCustomerId?: string | null;
        shopifyProductId?: string | null;
        shopifyVariantId?: string | null;
      };

    if (ruleType && !['percentage_discount', 'fixed_price'].includes(ruleType)) {
      res.status(400).json({ error: 'ruleType must be "percentage_discount" or "fixed_price"' });
      return;
    }

    const rule = await prisma.pricingRule.update({
      where: { id },
      data: {
        ...(ruleType !== undefined && { ruleType }),
        ...(value !== undefined && { value }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority }),
        ...(customerGroupId !== undefined && { customerGroupId }),
        ...(shopifyCustomerId !== undefined && { shopifyCustomerId }),
        ...(shopifyProductId !== undefined && { shopifyProductId }),
        ...(shopifyVariantId !== undefined && { shopifyVariantId }),
      },
    });

    res.json({ pricingRule: rule });
  } catch (error) {
    console.error('PUT /pricing-rules/:id error:', error);
    res.status(500).json({ error: 'Failed to update pricing rule' });
  }
});

// DELETE /api/pricing-rules/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { id } = req.params;

    const existing = await prisma.pricingRule.findFirst({ where: { id, storeId } });
    if (!existing) {
      res.status(404).json({ error: 'Pricing rule not found' });
      return;
    }

    await prisma.pricingRule.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /pricing-rules/:id error:', error);
    res.status(500).json({ error: 'Failed to delete pricing rule' });
  }
});

export default router;
