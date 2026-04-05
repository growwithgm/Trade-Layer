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

// GET /api/settings
router.get('/', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const settings = await prisma.shopSettings.upsert({
      where: { storeId },
      create: { storeId },
      update: {},
    });

    res.json({ settings });
  } catch (error) {
    console.error('GET /settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const { loginBasedPricing, hidePriceForGuests, hidePriceMessage, quickOrderEnabled } =
      req.body as {
        loginBasedPricing?: boolean;
        hidePriceForGuests?: boolean;
        hidePriceMessage?: string | null;
        quickOrderEnabled?: boolean;
      };

    const settings = await prisma.shopSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        ...(loginBasedPricing !== undefined && { loginBasedPricing }),
        ...(hidePriceForGuests !== undefined && { hidePriceForGuests }),
        ...(hidePriceMessage !== undefined && { hidePriceMessage }),
        ...(quickOrderEnabled !== undefined && { quickOrderEnabled }),
      },
      update: {
        ...(loginBasedPricing !== undefined && { loginBasedPricing }),
        ...(hidePriceForGuests !== undefined && { hidePriceForGuests }),
        ...(hidePriceMessage !== undefined && { hidePriceMessage }),
        ...(quickOrderEnabled !== undefined && { quickOrderEnabled }),
      },
    });

    res.json({ settings });
  } catch (error) {
    console.error('PUT /settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
