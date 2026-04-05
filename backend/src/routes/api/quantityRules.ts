import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prismaClient.js';

const router = Router();

async function getStoreId(shopDomain: string): Promise<string> {
  const store = await prisma.store.upsert({
    where: { shopDomain },
    create: { shopDomain, accessToken: '' },
    update: {},
    select: { id: true },
  });
  return store.id;
}

// GET /api/quantity-rules
router.get('/', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const rules = await prisma.quantityRule.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ quantityRules: rules });
  } catch (error) {
    console.error('GET /quantity-rules error:', error);
    res.status(500).json({ error: 'Failed to fetch quantity rules' });
  }
});

// POST /api/quantity-rules
router.post('/', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const { shopifyProductId, shopifyVariantId, minQuantity, stepQuantity, maxQuantity } =
      req.body as {
        shopifyProductId?: string;
        shopifyVariantId?: string;
        minQuantity?: number;
        stepQuantity?: number;
        maxQuantity?: number | null;
      };

    if (!shopifyProductId?.trim()) {
      res.status(400).json({ error: 'shopifyProductId is required' });
      return;
    }

    const rule = await prisma.quantityRule.create({
      data: {
        storeId,
        shopifyProductId,
        shopifyVariantId: shopifyVariantId ?? null,
        minQuantity: minQuantity ?? 1,
        stepQuantity: stepQuantity ?? 1,
        maxQuantity: maxQuantity ?? null,
      },
    });

    res.status(201).json({ quantityRule: rule });
  } catch (error) {
    console.error('POST /quantity-rules error:', error);
    res.status(500).json({ error: 'Failed to create quantity rule' });
  }
});

// PUT /api/quantity-rules/quick-update
// Upserts a quantity rule for a specific product, used by the Price Editor.
router.put('/quick-update', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const { shopifyProductId, shopifyVariantId, minQuantity, stepQuantity, maxQuantity } =
      req.body as {
        shopifyProductId?: string;
        shopifyVariantId?: string | null;
        minQuantity?: number;
        stepQuantity?: number;
        maxQuantity?: number | null;
      };

    if (!shopifyProductId?.trim()) {
      res.status(400).json({ error: 'shopifyProductId is required' });
      return;
    }

    // Normalise to both numeric and GID forms so we find the existing record regardless of how it was stored
    const numericId = shopifyProductId.match(/\/(\d+)$/)?.[1] ?? shopifyProductId;
    const gidId = `gid://shopify/Product/${numericId}`;

    const existing = await prisma.quantityRule.findFirst({
      where: { storeId, shopifyProductId: { in: [shopifyProductId, numericId, gidId] }, shopifyVariantId: shopifyVariantId ?? null },
    });

    const rule = existing
      ? await prisma.quantityRule.update({
          where: { id: existing.id },
          data: {
            ...(minQuantity !== undefined && { minQuantity }),
            ...(stepQuantity !== undefined && { stepQuantity }),
            ...(maxQuantity !== undefined && { maxQuantity }),
            isActive: true,
          },
        })
      : await prisma.quantityRule.create({
          data: {
            storeId,
            shopifyProductId,
            shopifyVariantId: shopifyVariantId ?? null,
            minQuantity: minQuantity ?? 1,
            stepQuantity: stepQuantity ?? 1,
            maxQuantity: maxQuantity ?? null,
            isActive: true,
          },
        });

    res.json({ quantityRule: rule });
  } catch (error) {
    console.error('PUT /quantity-rules/quick-update error:', error);
    res.status(500).json({ error: 'Failed to upsert quantity rule' });
  }
});

// PUT /api/quantity-rules/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { id } = req.params;

    const existing = await prisma.quantityRule.findFirst({ where: { id, storeId } });
    if (!existing) {
      res.status(404).json({ error: 'Quantity rule not found' });
      return;
    }

    const { shopifyProductId, shopifyVariantId, minQuantity, stepQuantity, maxQuantity, isActive } =
      req.body as {
        shopifyProductId?: string;
        shopifyVariantId?: string | null;
        minQuantity?: number;
        stepQuantity?: number;
        maxQuantity?: number | null;
        isActive?: boolean;
      };

    const rule = await prisma.quantityRule.update({
      where: { id },
      data: {
        ...(shopifyProductId !== undefined && { shopifyProductId }),
        ...(shopifyVariantId !== undefined && { shopifyVariantId }),
        ...(minQuantity !== undefined && { minQuantity }),
        ...(stepQuantity !== undefined && { stepQuantity }),
        ...(maxQuantity !== undefined && { maxQuantity }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ quantityRule: rule });
  } catch (error) {
    console.error('PUT /quantity-rules/:id error:', error);
    res.status(500).json({ error: 'Failed to update quantity rule' });
  }
});

// DELETE /api/quantity-rules/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { id } = req.params;

    const existing = await prisma.quantityRule.findFirst({ where: { id, storeId } });
    if (!existing) {
      res.status(404).json({ error: 'Quantity rule not found' });
      return;
    }

    await prisma.quantityRule.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /quantity-rules/:id error:', error);
    res.status(500).json({ error: 'Failed to delete quantity rule' });
  }
});

export default router;
