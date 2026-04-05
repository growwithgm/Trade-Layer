import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prismaClient.js';

// These endpoints are called by the theme extension (storefront) — no Shopify session auth.
// CORS is applied in app.ts.
const router = Router();

// ── ID normalisation helpers ───────────────────────────────────────────────────
function toNumeric(id: string): string {
  const match = id.match(/\/(\d+)$/);
  return match ? match[1] : id;
}

function toGid(type: 'Product' | 'ProductVariant' | 'Customer', id: string): string {
  if (id.startsWith('gid://')) return id;
  return `gid://shopify/${type}/${id}`;
}

function bothFormats(type: 'Product' | 'ProductVariant' | 'Customer', id: string): string[] {
  const numeric = toNumeric(id);
  const gid = toGid(type, numeric);
  return Array.from(new Set([id, numeric, gid]));
}

// ── Fetch customer tags from Shopify Admin API ─────────────────────────────────
async function fetchCustomerTags(shopDomain: string, accessToken: string, customerId: string): Promise<string[]> {
  const numericId = toNumeric(customerId);
  try {
    const resp = await fetch(
      `https://${shopDomain}/admin/api/2024-01/customers/${numericId}.json`,
      { headers: { 'X-Shopify-Access-Token': accessToken } }
    );
    if (!resp.ok) return [];
    const data = await resp.json() as { customer?: { tags?: string } };
    return (data.customer?.tags || '')
      .split(',')
      .map((t: string) => t.trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

// ── Debug / health endpoint ────────────────────────────────────────────────────
router.get('/test', async (req: Request, res: Response) => {
  try {
    const { shopDomain, shopifyCustomerId, shopifyProductId } = req.query as Record<string, string>;

    const store = shopDomain
      ? await prisma.store.findUnique({ where: { shopDomain }, select: { id: true, shopDomain: true, accessToken: true } })
      : null;

    let memberships: { customerGroupId: string }[] = [];
    let allMembers: { shopifyCustomerId: string }[] = [];
    let customerTags: string[] = [];
    let tagMatchedGroups: { id: string; name: string; shopifyTag: string | null }[] = [];

    if (store && shopifyCustomerId) {
      const customerVariants = bothFormats('Customer', shopifyCustomerId);
      memberships = await prisma.customerGroupMember.findMany({
        where: { shopifyCustomerId: { in: customerVariants } },
        select: { customerGroupId: true },
      });
      allMembers = await prisma.customerGroupMember.findMany({
        select: { shopifyCustomerId: true },
        take: 20,
      });

      // Tag-based lookup
      if (store.accessToken) {
        customerTags = await fetchCustomerTags(shopDomain, store.accessToken, shopifyCustomerId);
        if (customerTags.length > 0) {
          tagMatchedGroups = await prisma.customerGroup.findMany({
            where: { storeId: store.id, isActive: true, shopifyTag: { in: customerTags } },
            select: { id: true, name: true, shopifyTag: true },
          });
        }
      }
    }

    let pricingRules: object[] = [];
    if (store) {
      pricingRules = await prisma.pricingRule.findMany({
        where: { storeId: store.id },
        select: { id: true, customerGroupId: true, shopifyProductId: true, ruleType: true, value: true, isActive: true },
      });
    }

    res.json({
      ok: true,
      received: { shopDomain, shopifyCustomerId, shopifyProductId },
      store: store ?? 'NOT FOUND',
      customerIdVariants: shopifyCustomerId ? bothFormats('Customer', shopifyCustomerId) : [],
      memberships,
      allMembersInDB: allMembers,
      customerTags,
      tagMatchedGroups,
      pricingRulesForStore: pricingRules,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── GET /api/storefront/pricing ────────────────────────────────────────────────
router.get('/pricing', async (req: Request, res: Response) => {
  try {
    const { shopDomain, shopifyCustomerId, shopifyProductId, shopifyVariantId } = req.query as Record<string, string>;

    if (!shopDomain || !shopifyProductId) {
      res.status(400).json({ error: 'shopDomain and shopifyProductId are required' });
      return;
    }

    const store = await prisma.store.findUnique({ where: { shopDomain }, select: { id: true, accessToken: true } });
    if (!store) {
      res.json({ rule: null, debug: 'store not found' });
      return;
    }

    // ── 1. Manual group membership lookup ──────────────────────────────────────
    let groupIds: string[] = [];
    if (shopifyCustomerId) {
      const customerVariants = bothFormats('Customer', shopifyCustomerId);
      const memberships = await prisma.customerGroupMember.findMany({
        where: { shopifyCustomerId: { in: customerVariants } },
        select: { customerGroupId: true },
      });
      groupIds = memberships.map((m) => m.customerGroupId);
    }

    // ── 2. Tag-based fallback — fetch customer tags if no manual membership ────
    if (groupIds.length === 0 && shopifyCustomerId && store.accessToken) {
      const customerTags = await fetchCustomerTags(shopDomain, store.accessToken, shopifyCustomerId);
      if (customerTags.length > 0) {
        const tagGroups = await prisma.customerGroup.findMany({
          where: { storeId: store.id, isActive: true, shopifyTag: { in: customerTags } },
          select: { id: true },
        });
        groupIds = tagGroups.map((g) => g.id);
      }
    }

    // ── 3. Find pricing rule candidates ────────────────────────────────────────
    const productVariants = bothFormats('Product', shopifyProductId);
    const variantVariants = shopifyVariantId ? bothFormats('ProductVariant', shopifyVariantId) : [];

    const candidates = await prisma.pricingRule.findMany({
      where: {
        storeId: store.id,
        isActive: true,
        OR: [
          ...(variantVariants.length ? [{ shopifyVariantId: { in: variantVariants } }] : []),
          { shopifyVariantId: null, shopifyProductId: { in: productVariants } },
          { shopifyVariantId: null, shopifyProductId: null },
        ],
      },
      orderBy: [{ priority: 'desc' }],
    });

    // ── 4. Pick best rule: customer-specific > group > store-wide ──────────────
    const customerVariants = shopifyCustomerId ? bothFormats('Customer', shopifyCustomerId) : [];
    const rule =
      candidates.find((r) => r.shopifyCustomerId && customerVariants.includes(r.shopifyCustomerId)) ??
      candidates.find((r) => r.customerGroupId && groupIds.includes(r.customerGroupId)) ??
      candidates.find((r) => !r.shopifyCustomerId && !r.customerGroupId) ??
      null;

    res.json({ rule });
  } catch (error) {
    console.error('GET /storefront/pricing error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// ── GET /api/storefront/quantity ───────────────────────────────────────────────
router.get('/quantity', async (req: Request, res: Response) => {
  try {
    const { shopDomain, shopifyProductId, shopifyVariantId } = req.query as Record<string, string>;

    if (!shopDomain || !shopifyProductId) {
      res.status(400).json({ error: 'shopDomain and shopifyProductId are required' });
      return;
    }

    const store = await prisma.store.findUnique({ where: { shopDomain }, select: { id: true } });
    if (!store) { res.json({ rule: null }); return; }

    const productVariants = bothFormats('Product', shopifyProductId);
    const variantVariants = shopifyVariantId ? bothFormats('ProductVariant', shopifyVariantId) : [];

    const rule = await prisma.quantityRule.findFirst({
      where: {
        storeId: store.id,
        isActive: true,
        OR: [
          ...(variantVariants.length ? [{ shopifyVariantId: { in: variantVariants } }] : []),
          { shopifyVariantId: null, shopifyProductId: { in: productVariants } },
        ],
      },
      orderBy: { shopifyVariantId: 'desc' },
    });

    res.json({ rule });
  } catch (error) {
    console.error('GET /storefront/quantity error:', error);
    res.status(500).json({ error: 'Failed to fetch quantity rule' });
  }
});

// ── POST /api/storefront/cart/validate ────────────────────────────────────────
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
    if (!store) { res.json({ valid: true, errors: [] }); return; }

    const errors: Array<{ shopifyProductId: string; shopifyVariantId?: string; message: string }> = [];

    for (const item of lineItems) {
      const productVariants = bothFormats('Product', item.shopifyProductId);
      const variantVariants = item.shopifyVariantId ? bothFormats('ProductVariant', item.shopifyVariantId) : [];

      const rule = await prisma.quantityRule.findFirst({
        where: {
          storeId: store.id,
          isActive: true,
          OR: [
            ...(variantVariants.length ? [{ shopifyVariantId: { in: variantVariants } }] : []),
            { shopifyVariantId: null, shopifyProductId: { in: productVariants } },
          ],
        },
        orderBy: { shopifyVariantId: 'desc' },
      });

      if (!rule) continue;

      if (item.quantity < rule.minQuantity) {
        errors.push({ shopifyProductId: item.shopifyProductId, shopifyVariantId: item.shopifyVariantId, message: `Minimum order quantity is ${rule.minQuantity}` });
      } else if (rule.maxQuantity !== null && item.quantity > rule.maxQuantity) {
        errors.push({ shopifyProductId: item.shopifyProductId, shopifyVariantId: item.shopifyVariantId, message: `Maximum order quantity is ${rule.maxQuantity}` });
      } else if (rule.stepQuantity > 1 && (item.quantity - rule.minQuantity) % rule.stepQuantity !== 0) {
        errors.push({ shopifyProductId: item.shopifyProductId, shopifyVariantId: item.shopifyVariantId, message: `Quantity must be in multiples of ${rule.stepQuantity} starting from ${rule.minQuantity}` });
      }
    }

    res.json({ valid: errors.length === 0, errors });
  } catch (error) {
    console.error('POST /storefront/cart/validate error:', error);
    res.status(500).json({ error: 'Failed to validate cart' });
  }
});

export default router;
