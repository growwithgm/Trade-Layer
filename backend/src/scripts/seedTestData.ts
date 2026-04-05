/**
 * Seed script — creates test data for end-to-end B2B flow testing.
 *
 * Usage:
 *   npx tsx src/scripts/seedTestData.ts
 *   (or)
 *   npx ts-node --esm src/scripts/seedTestData.ts
 *
 * Prerequisites:
 *   - backend/.env must exist with DATABASE_URL
 *   - Replace SHOP_DOMAIN and TEST_PRODUCT_ID below with real values
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// ── Configure these before running ──────────────────────────────────────────
const SHOP_DOMAIN = 'your-store.myshopify.com';       // replace with real store domain
const TEST_PRODUCT_ID = 'gid://shopify/Product/123';  // replace with a real product GID
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding test data for:', SHOP_DOMAIN);

  // 1. Upsert the Store record.
  const store = await prisma.store.upsert({
    where: { shopDomain: SHOP_DOMAIN },
    create: { shopDomain: SHOP_DOMAIN, accessToken: '' },
    update: {},
  });
  console.log('✓ Store:', store.id);

  // 2. Create "Wholesale Buyers" customer group.
  const existingGroup = await prisma.customerGroup.findFirst({
    where: { storeId: store.id, name: 'Wholesale Buyers' },
  });
  const group = existingGroup ?? await prisma.customerGroup.create({
    data: {
      storeId: store.id,
      name: 'Wholesale Buyers',
      description: 'Test wholesale customer group with 20% discount on all products',
      isActive: true,
    },
  });
  console.log('✓ Customer Group:', group.id, `(${group.name})`);

  // 3. Create 20% discount pricing rule for the group (all products).
  const existingPricing = await prisma.pricingRule.findFirst({
    where: { storeId: store.id, customerGroupId: group.id, ruleType: 'percentage_discount' },
  });
  const pricingRule = existingPricing ?? await prisma.pricingRule.create({
    data: {
      storeId: store.id,
      customerGroupId: group.id,
      ruleType: 'percentage_discount',
      value: 20,        // 20% off
      isActive: true,
      priority: 10,
      // shopifyProductId: null → applies to ALL products
    },
  });
  console.log('✓ Pricing Rule:', pricingRule.id, `(${pricingRule.value}% discount for group)`);

  // 4. Create quantity rule for the test product: MOQ=6, step=6.
  const existingQty = await prisma.quantityRule.findFirst({
    where: { storeId: store.id, shopifyProductId: TEST_PRODUCT_ID },
  });
  const quantityRule = existingQty ?? await prisma.quantityRule.create({
    data: {
      storeId: store.id,
      shopifyProductId: TEST_PRODUCT_ID,
      minQuantity: 6,
      stepQuantity: 6,
      maxQuantity: null,
      isActive: true,
    },
  });
  console.log('✓ Quantity Rule:', quantityRule.id, `(MOQ=6, step=6 for ${TEST_PRODUCT_ID})`);

  // 5. Upsert shop settings.
  await prisma.shopSettings.upsert({
    where: { storeId: store.id },
    create: {
      storeId: store.id,
      loginBasedPricing: true,
      hidePriceForGuests: true,
      hidePriceMessage: 'Login to see wholesale prices',
      quickOrderEnabled: false,
    },
    update: {},
  });
  console.log('✓ Shop Settings upserted (loginBasedPricing: true)');

  console.log('\n✅ Seed complete!');
  console.log('\nNext steps:');
  console.log('  1. Use GET /api/customers/search?query=<email> to find a customer ID');
  console.log('  2. Use POST /api/customer-groups/:id/members to add them to "Wholesale Buyers"');
  console.log('  3. Log in as that customer on the storefront — wholesale prices will appear');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
