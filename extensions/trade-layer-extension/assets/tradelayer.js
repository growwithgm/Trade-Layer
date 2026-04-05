/**
 * TradeLayer B2B Pricing & Quantity Rules
 * Fetches pricing and quantity data from the TradeLayer backend and updates
 * the product page UI accordingly. Loaded by the b2b-pricing block.
 */
(function () {
  'use strict';

  const API_BASE = 'https://trade-layer.onrender.com';

  // Data injected by the Liquid block via data attributes on the wrapper element.
  // <div id="tradelayer-root"
  //      data-shop="{{ shop.domain }}"
  //      data-customer-id="{{ customer.id }}"
  //      data-product-id="{{ product.id }}"
  //      data-variant-id="{{ product.selected_or_first_available_variant.id }}"
  //      data-original-price="{{ product.selected_or_first_available_variant.price }}"
  //      data-login-url="/account/login"
  //      data-currency="{{ cart.currency.symbol }}">

  function init() {
    const root = document.getElementById('tradelayer-root');
    if (!root) return;

    const shopDomain      = root.dataset.shopDomain;
    const customerId      = root.dataset.customerId;   // empty string if guest
    const productId       = root.dataset.productId;
    const variantId       = root.dataset.variantId;
    const originalPrice   = parseFloat(root.dataset.originalPrice) / 100; // Shopify stores in cents
    const loginUrl        = root.dataset.loginUrl || '/account/login';
    const currency        = root.dataset.currency || '$';
    const loginRequired   = root.dataset.loginRequired === 'true';

    // Guest + login-based pricing on → show login prompt, skip API call.
    if (!customerId && loginRequired) {
      renderLoginPrompt(root, loginUrl);
      return;
    }

    // Guest + login not enforced → nothing to do.
    if (!customerId) {
      root.innerHTML = '';
      return;
    }

    // Logged-in customer → fetch both pricing and quantity rules.
    root.innerHTML = '<div class="tradelayer-loading">Loading your price\u2026</div>';

    Promise.all([
      fetchPricing(shopDomain, customerId, productId, variantId),
      fetchQuantityRule(shopDomain, productId, variantId),
    ]).then(([pricingRule, quantityRule]) => {
      renderPricing(root, pricingRule, originalPrice, currency);
      renderQuantityRules(root, quantityRule);
      attachQuantityWatcher(quantityRule);
    }).catch(function (err) {
      console.warn('[TradeLayer] Failed to load B2B data:', err);
      root.innerHTML = ''; // fail silently — show normal price
    });

    // Re-fetch when the variant changes (theme dispatches this event).
    document.addEventListener('variant:change', function (e) {
      const newVariantId = e.detail && e.detail.variant && e.detail.variant.id;
      if (!newVariantId) return;
      root.dataset.variantId = newVariantId;
      const newOriginalPrice = e.detail.variant.price / 100;
      root.innerHTML = '<div class="tradelayer-loading">Loading your price\u2026</div>';
      Promise.all([
        fetchPricing(shopDomain, customerId, productId, String(newVariantId)),
        fetchQuantityRule(shopDomain, productId, String(newVariantId)),
      ]).then(([pr, qr]) => {
        renderPricing(root, pr, newOriginalPrice, currency);
        renderQuantityRules(root, qr);
        attachQuantityWatcher(qr);
      }).catch(function () { root.innerHTML = ''; });
    });
  }

  // ── API calls ──────────────────────────────────────────────────────────────

  function fetchPricing(shopDomain, customerId, productId, variantId) {
    const params = new URLSearchParams({
      shopDomain,
      shopifyCustomerId: customerId,
      shopifyProductId: productId,
    });
    if (variantId) params.set('shopifyVariantId', variantId);
    return fetch(API_BASE + '/api/storefront/pricing?' + params.toString())
      .then(function (r) { return r.json(); })
      .then(function (d) { return d.rule || null; });
  }

  function fetchQuantityRule(shopDomain, productId, variantId) {
    const params = new URLSearchParams({
      shopDomain,
      shopifyProductId: productId,
    });
    if (variantId) params.set('shopifyVariantId', variantId);
    return fetch(API_BASE + '/api/storefront/pricing?' + params.toString())
      .then(function () {
        // Use the cart validate endpoint to discover quantity rules.
        // Simpler: call a dedicated GET endpoint we can add, but for now
        // we embed quantity data in the Liquid block and pass it via data attrs.
        return null;
      }).catch(function () { return null; });
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  function renderLoginPrompt(root, loginUrl) {
    root.innerHTML =
      '<div class="tradelayer-login-prompt">' +
        '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style="color:#008060"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 4a3 3 0 110 6 3 3 0 010-6zm0 14a8 8 0 01-6.27-3.034C4.427 13.337 7.027 12 10 12s5.573 1.337 6.27 2.966A8 8 0 0110 18z"/></svg>' +
        '<span>Login to see wholesale prices &mdash; <a href="' + loginUrl + '">Log in</a></span>' +
      '</div>';
  }

  function renderPricing(root, rule, originalPrice, currency) {
    // Remove any previous price block (keep rule notices below).
    const existing = root.querySelector('.tradelayer-price-block');
    if (existing) existing.remove();

    if (!rule) {
      root.innerHTML = '';
      return;
    }

    let b2bPrice;
    if (rule.ruleType === 'percentage_discount') {
      b2bPrice = originalPrice * (1 - parseFloat(rule.value) / 100);
    } else {
      b2bPrice = parseFloat(rule.value);
    }

    const savings = originalPrice - b2bPrice;
    const fmt = function (n) { return currency + n.toFixed(2); };

    const block = document.createElement('div');
    block.className = 'tradelayer-price-block';
    block.innerHTML =
      '<span class="tradelayer-badge">Wholesale Price</span>' +
      '<span class="tradelayer-b2b-price">' + fmt(b2bPrice) + '</span>' +
      '<span class="tradelayer-original-price">' + fmt(originalPrice) + '</span>' +
      (savings > 0.001 ? '<span class="tradelayer-savings">Save ' + fmt(savings) + '</span>' : '');

    root.insertBefore(block, root.firstChild);
  }

  function renderQuantityRules(root, quantityRule) {
    // Remove previous notices.
    const existing = root.querySelector('.tradelayer-rules');
    if (existing) existing.remove();
    const existingErr = root.querySelector('.tradelayer-qty-error');
    if (existingErr) existingErr.remove();

    // Quantity data comes from data attributes set by the Liquid block.
    const r = readQuantityData(root);
    if (!r) return;

    const notices = [];
    const icon = '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/></svg>';

    if (r.minQuantity > 1) {
      notices.push(icon + ' Minimum order: <strong>' + r.minQuantity + '</strong> units');
    }
    if (r.stepQuantity > 1) {
      notices.push(icon + ' Must be ordered in multiples of <strong>' + r.stepQuantity + '</strong>');
    }
    if (r.maxQuantity) {
      notices.push(icon + ' Maximum order: <strong>' + r.maxQuantity + '</strong> units');
    }

    if (!notices.length) return;

    const rulesEl = document.createElement('div');
    rulesEl.className = 'tradelayer-rules';
    rulesEl.innerHTML = notices.map(function (n) {
      return '<div class="tradelayer-notice">' + n + '</div>';
    }).join('');
    root.appendChild(rulesEl);

    // Error div for live validation.
    const errEl = document.createElement('div');
    errEl.className = 'tradelayer-qty-error';
    errEl.id = 'tradelayer-qty-error';
    root.appendChild(errEl);
  }

  function attachQuantityWatcher(quantityRule) {
    const r = readQuantityData(document.getElementById('tradelayer-root'));
    if (!r) return;

    // Find the quantity input — themes use various selectors.
    const qtyInput = document.querySelector(
      '[name="quantity"], .quantity__input, input[data-quantity-input], #Quantity'
    );
    if (!qtyInput) return;

    // Set min/step/max attributes directly on the input.
    if (r.minQuantity) qtyInput.setAttribute('min', r.minQuantity);
    if (r.stepQuantity) qtyInput.setAttribute('step', r.stepQuantity);
    if (r.maxQuantity) qtyInput.setAttribute('max', r.maxQuantity);
    if (!qtyInput.value || parseInt(qtyInput.value) < r.minQuantity) {
      qtyInput.value = r.minQuantity;
    }

    function validate() {
      const qty = parseInt(qtyInput.value) || 0;
      const errEl = document.getElementById('tradelayer-qty-error');
      if (!errEl) return;

      let msg = '';
      if (qty < r.minQuantity) {
        msg = 'Minimum quantity is ' + r.minQuantity;
      } else if (r.maxQuantity && qty > r.maxQuantity) {
        msg = 'Maximum quantity is ' + r.maxQuantity;
      } else if (r.stepQuantity > 1 && (qty - r.minQuantity) % r.stepQuantity !== 0) {
        msg = 'Quantity must be in multiples of ' + r.stepQuantity + ' (starting from ' + r.minQuantity + ')';
      }

      errEl.textContent = msg;
      errEl.classList.toggle('visible', !!msg);

      // Prevent add-to-cart if invalid.
      const addBtn = document.querySelector('[name="add"], .product-form__submit, button[data-add-to-cart]');
      if (addBtn) addBtn.disabled = !!msg;
    }

    qtyInput.addEventListener('change', validate);
    qtyInput.addEventListener('input', validate);
    validate(); // run on load
  }

  function readQuantityData(root) {
    if (!root) return null;
    const min  = parseInt(root.dataset.qtyMin);
    const step = parseInt(root.dataset.qtyStep);
    const max  = root.dataset.qtyMax ? parseInt(root.dataset.qtyMax) : null;
    if (!min && !step && !max) return null;
    return { minQuantity: min || 1, stepQuantity: step || 1, maxQuantity: max };
  }

  // Boot when DOM is ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
