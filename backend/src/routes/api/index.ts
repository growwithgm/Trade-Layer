import { Router } from 'express';
import productsRouter from './products.js';
import customerGroupsRouter from './customerGroups.js';
import pricingRulesRouter from './pricingRules.js';
import quantityRulesRouter from './quantityRules.js';
import settingsRouter from './settings.js';

const router = Router();

router.use('/products', productsRouter);
router.use('/customer-groups', customerGroupsRouter);
router.use('/pricing-rules', pricingRulesRouter);
router.use('/quantity-rules', quantityRulesRouter);
router.use('/settings', settingsRouter);

export default router;
