import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prismaClient.js';

const router = Router();

// Resolve the Store.id for the authenticated shop, creating the record if needed.
async function getStoreId(shopDomain: string): Promise<string> {
  const store = await prisma.store.upsert({
    where: { shopDomain },
    create: { shopDomain, accessToken: '' },
    update: {},
    select: { id: true },
  });
  return store.id;
}

// GET /api/customer-groups
router.get('/', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);

    const groups = await prisma.customerGroup.findMany({
      where: { storeId },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ customerGroups: groups });
  } catch (error) {
    console.error('GET /customer-groups error:', error);
    res.status(500).json({ error: 'Failed to fetch customer groups' });
  }
});

// POST /api/customer-groups
router.post('/', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { name, description } = req.body as { name?: string; description?: string };

    if (!name?.trim()) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const group = await prisma.customerGroup.create({
      data: { storeId, name: name.trim(), description: description?.trim() ?? null },
    });

    res.status(201).json({ customerGroup: group });
  } catch (error) {
    console.error('POST /customer-groups error:', error);
    res.status(500).json({ error: 'Failed to create customer group' });
  }
});

// PUT /api/customer-groups/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { id } = req.params;
    const { name, description, isActive } = req.body as {
      name?: string;
      description?: string;
      isActive?: boolean;
    };

    const existing = await prisma.customerGroup.findFirst({ where: { id, storeId } });
    if (!existing) {
      res.status(404).json({ error: 'Customer group not found' });
      return;
    }

    const group = await prisma.customerGroup.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ customerGroup: group });
  } catch (error) {
    console.error('PUT /customer-groups/:id error:', error);
    res.status(500).json({ error: 'Failed to update customer group' });
  }
});

// DELETE /api/customer-groups/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { id } = req.params;

    const existing = await prisma.customerGroup.findFirst({ where: { id, storeId } });
    if (!existing) {
      res.status(404).json({ error: 'Customer group not found' });
      return;
    }

    await prisma.customerGroup.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /customer-groups/:id error:', error);
    res.status(500).json({ error: 'Failed to delete customer group' });
  }
});

// POST /api/customer-groups/:id/members
router.post('/:id/members', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { id: customerGroupId } = req.params;
    const { shopifyCustomerId } = req.body as { shopifyCustomerId?: string };

    if (!shopifyCustomerId?.trim()) {
      res.status(400).json({ error: 'shopifyCustomerId is required' });
      return;
    }

    const group = await prisma.customerGroup.findFirst({ where: { id: customerGroupId, storeId } });
    if (!group) {
      res.status(404).json({ error: 'Customer group not found' });
      return;
    }

    const member = await prisma.customerGroupMember.upsert({
      where: { customerGroupId_shopifyCustomerId: { customerGroupId, shopifyCustomerId } },
      create: { customerGroupId, shopifyCustomerId },
      update: {},
    });

    res.status(201).json({ member });
  } catch (error) {
    console.error('POST /customer-groups/:id/members error:', error);
    res.status(500).json({ error: 'Failed to add member to group' });
  }
});

// DELETE /api/customer-groups/:id/members/:customerId
router.delete('/:id/members/:customerId', async (req: Request, res: Response) => {
  try {
    const shopDomain: string = res.locals.shopify.session.shop;
    const storeId = await getStoreId(shopDomain);
    const { id: customerGroupId, customerId: shopifyCustomerId } = req.params;

    const group = await prisma.customerGroup.findFirst({ where: { id: customerGroupId, storeId } });
    if (!group) {
      res.status(404).json({ error: 'Customer group not found' });
      return;
    }

    await prisma.customerGroupMember.deleteMany({ where: { customerGroupId, shopifyCustomerId } });
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /customer-groups/:id/members/:customerId error:', error);
    res.status(500).json({ error: 'Failed to remove member from group' });
  }
});

export default router;
