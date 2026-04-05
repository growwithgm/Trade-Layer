/**
 * TradeLayer B2B Pricing & Quantity Rules
 * Fetches live pricing and quantity data from the TradeLayer backend API
 * and updates the product page UI for logged-in B2B customers.
 */
(function () {
  'use strict';

  var API_BASE = 'https://trade-layer.onrender.com';

  function init() {
    var root = document.getElementById('tradelayer-root');
    if (!root) return;

    var shopDomain    = root.dataset.shopDomain;
    var customerId    = root.dataset.customerId;   // empty string if guest
    var productId     = root.dataset.productId;
    var variantId     = root.dataset.variantId;
    var originalPrice = parseFloat(root.dataset.originalPrice) / 100; // Shopify stores cents
    var loginUrl      = root.dataset.loginUrl || '/account/login';
    var currency      = root.dataset.currency || '$';
    var loginRequired = root.dataset.loginRequired === 'true';

    // Guest + login-based pricing enforced → show login prompt only.
    if (!customerId && loginRequired) {
      renderLoginPrompt(root, loginUrl);
      return;
    }

    // Guest + not enforced → nothing to show.
    if (!customerId) {
      root.innerHTML = '';
      return;
    }

    // Logged-in customer → fetch pricing + quantity rules concurrently.
    root.innerHTML = '<div class="tradelayer-loading">Loading your price\u2026</div>';

    var pricingParams = new URLSearchParams({ shopDomain: shopDomain, shopifyCustomerId: customerId, shopifyProductId: productId });
    if (variantId) pricingParams.set('shopifyVariantId', variantId);

    var quantityParams = new URLSearchParams({ shopDomain: shopDomain, shopifyProductId: productId });
    if (variantId) quantityParams.set('shopifyVariantId', variantId);

    Promise.all([
      fetch(API_BASE + '/api/storefront/pricing?' + pricingParams.toString()).then(function (r) { return r.json(); }),
      fetch(API_BASE + '/api/storefront/quantity?' + quantityParams.toString()).then(function (r) { return r.json(); }),
    ]).then(function (results) {
      var pricingData  = results[0];
      var quantityData = results[1];
      renderPricing(root, pricingData.rule, originalPrice, currency);
      renderQuantityNotices(root, quantityData.rule);
      attachQuantityWatcher(quantityData.rule);
    }).catch(function (err) {
      console.warn('[TradeLayer] Failed to load B2B data:', err);
      root.innerHTML = '';
    });

    // Re-fetch on variant change (themes dispatch this event).
    document.addEventListener('variant:change', function (e) {
      var detail = e.detail || {};
      var variant = detail.variant;
      if (!variant) return;

      var newVariantId    = String(variant.id);
      var newVariantGid   = 'gid://shopify/ProductVariant/' + newVariantId;
      var newOriginalPrice = variant.price / 100;

      root.innerHTML = '<div class="tradelayer-loading">Loading your price\u2026</div>';

      var pp = new URLSearchParams({ shopDomain: shopDomain, shopifyCustomerId: customerId, shopifyProductId: productId, shopifyVariantId: newVariantGid });
      var qp = new URLSearchParams({ shopDomain: shopDomain, shopifyProductId: productId, shopifyVariantId: newVariantGid });

      Promise.all([
        fetch(API_BASE + '/api/storefront/pricing?' + pp.toString()).then(function (r) { return r.json(); }),
        fetch(API_BASE + '/api/storefront/quantity?' + qp.toString()).then(function (r) { return r.json(); }),
      ]).then(function (results) {
        renderPricing(root, results[0].rule, newOriginalPrice, currency);
        renderQuantityNotices(root, results[1].rule);
        attachQuantityWatcher(results[1].rule);
      }).catch(function () { root.innerHTML = ''; });
    });
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  function renderLoginPrompt(root, loginUrl) {
    root.innerHTML =
      '<div class="tradelayer-login-prompt">' +
        '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style="color:#008060" aria-hidden="true">' +
          '<path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 4a3 3 0 110 6 3 3 0 010-6zm0 14a8 8 0 01-6.27-3.034C4.427 13.337 7.027 12 10 12s5.573 1.337 6.27 2.966A8 8 0 0110 18z"/>' +
        '</svg>' +
        '<span>Login to see wholesale prices &mdash; <a href="' + loginUrl + '">Log in</a></span>' +
      '</div>';
  }

  function fmt(currency, n) {
    return currency + n.toFixed(2);
  }

  function renderPricing(root, rule, originalPrice, currency) {
    // Clear previous price block.
    var old = root.querySelector('.tradelayer-price-block');
    if (old) old.remove();

    if (!rule) {
      // No rule — clear loading state and show nothing extra.
      var loading = root.querySelector('.tradelayer-loading');
      if (loading) loading.remove();
      return;
    }

    var b2bPrice;
    if (rule.ruleType === 'percentage_discount') {
      b2bPrice = originalPrice * (1 - parseFloat(rule.value) / 100);
    } else {
      b2bPrice = parseFloat(rule.value);
    }

    var savings = originalPrice - b2bPrice;
    var savingsPct = Math.round((savings / originalPrice) * 100);

    var block = document.createElement('div');
    block.className = 'tradelayer-price-block';
    block.innerHTML =
      '<div style="margin-bottom:6px;">' +
        '<span class="tradelayer-badge">Wholesale Price</span>' +
      '</div>' +
      '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">' +
        '<span class="tradelayer-b2b-price">' + fmt(currency, b2bPrice) + '</span>' +
        '<span class="tradelayer-original-price">RRP ' + fmt(currency, originalPrice) + '</span>' +
        (savings > 0.005 ? '<span class="tradelayer-savings">You save ' + fmt(currency, savings) + ' (' + savingsPct + '%)</span>' : '') +
      '</div>';

    // Remove loading indicator, insert price block.
    var loading = root.querySelector('.tradelayer-loading');
    if (loading) loading.remove();
    root.insertBefore(block, root.firstChild);
  }

  function renderQuantityNotices(root, rule) {
    // Remove previous notices and error div.
    var old = root.querySelector('.tradelayer-rules');
    if (old) old.remove();
    var oldErr = document.getElementById('tradelayer-qty-error');
    if (oldErr) oldErr.remove();

    if (!rule) return;

    var icon = '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/></svg>';
    var notices = [];

    if (rule.minQuantity > 1) {
      notices.push(icon + ' Minimum order: <strong>' + rule.minQuantity + '</strong> units');
    }
    if (rule.stepQuantity > 1) {
      notices.push(icon + ' Must be ordered in multiples of <strong>' + rule.stepQuantity + '</strong>');
    }
    if (rule.maxQuantity) {
      notices.push(icon + ' Maximum order: <strong>' + rule.maxQuantity + '</strong> units');
    }

    if (!notices.length) return;

    var rulesEl = document.createElement('div');
    rulesEl.className = 'tradelayer-rules';
    rulesEl.innerHTML = notices.map(function (n) {
      return '<div class="tradelayer-notice">' + n + '</div>';
    }).join('');
    root.appendChild(rulesEl);

    var errEl = document.createElement('div');
    errEl.className = 'tradelayer-qty-error';
    errEl.id = 'tradelayer-qty-error';
    root.appendChild(errEl);
  }

  function attachQuantityWatcher(rule) {
    var qtyInput = document.querySelector('[name="quantity"], .quantity__input, input[data-quantity-input], #Quantity');
    if (!qtyInput || !rule) return;

    var min  = rule.minQuantity  || 1;
    var step = rule.stepQuantity || 1;
    var max  = rule.maxQuantity  || null;

    qtyInput.setAttribute('min', min);
    qtyInput.setAttribute('step', step);
    if (max) qtyInput.setAttribute('max', max);

    // Snap to minimum if current value is too low.
    if (!qtyInput.value || parseInt(qtyInput.value) < min) {
      qtyInput.value = min;
    }

    function validate() {
      var qty = parseInt(qtyInput.value) || 0;
      var errEl = document.getElementById('tradelayer-qty-error');
      var msg = '';

      if (qty < min) {
        msg = 'Minimum quantity is ' + min;
      } else if (max && qty > max) {
        msg = 'Maximum quantity is ' + max;
      } else if (step > 1 && (qty - min) % step !== 0) {
        msg = 'Quantity must be in multiples of ' + step + ' (starting from ' + min + ')';
      }

      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.toggle('visible', !!msg);
      }

      // Block add-to-cart when quantity is invalid.
      var addBtn = document.querySelector('[name="add"], .product-form__submit, button[data-add-to-cart]');
      if (addBtn) addBtn.disabled = !!msg;
    }

    qtyInput.addEventListener('change', validate);
    qtyInput.addEventListener('input', validate);
    validate();
  }

  // Boot.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
