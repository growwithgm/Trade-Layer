/**
 * TradeLayer B2B Pricing & Quantity Enforcement
 * Reads data attributes from #tradelayer-root and fetches live pricing
 * from the TradeLayer backend API.
 */
(function () {
  'use strict';

  var API_BASE = 'https://trade-layer.onrender.com';

  function init() {
    var root = document.getElementById('tradelayer-root');
    if (!root) return;

    var shopDomain     = root.dataset.shopDomain    || '';
    var productId      = root.dataset.productId     || '';  // numeric, e.g. "8894191829218"
    var variantId      = root.dataset.variantId     || '';
    var customerId     = root.dataset.customerId    || '';  // numeric, e.g. "12345678"
    var loggedIn       = root.dataset.customerLoggedIn === 'true';
    var loginRequired  = root.dataset.loginRequired === 'true';
    var loginUrl       = root.dataset.loginUrl      || '/account/login';
    var hidePriceMsg   = root.dataset.hidePriceMessage || 'Login to see wholesale prices';
    var originalPrice  = parseFloat(root.dataset.originalPrice || '0') / 100;
    var currency       = root.dataset.currency      || '$';

    // Guest + login enforcement → show prompt, done.
    if (!loggedIn && loginRequired) {
      showLoginPrompt(root, hidePriceMsg, loginUrl);
      return;
    }

    // Guest + no enforcement → hide block entirely.
    if (!loggedIn) {
      root.style.display = 'none';
      return;
    }

    // Logged-in customer → fetch pricing and quantity rules concurrently.
    setLoading(root, true);

    var pricingUrl  = API_BASE + '/api/storefront/pricing'
      + '?shopDomain='           + encodeURIComponent(shopDomain)
      + '&shopifyCustomerId='    + encodeURIComponent(customerId)
      + '&shopifyProductId='     + encodeURIComponent(productId)
      + (variantId ? '&shopifyVariantId=' + encodeURIComponent(variantId) : '');

    var quantityUrl = API_BASE + '/api/storefront/quantity'
      + '?shopDomain='           + encodeURIComponent(shopDomain)
      + '&shopifyProductId='     + encodeURIComponent(productId)
      + (variantId ? '&shopifyVariantId=' + encodeURIComponent(variantId) : '');

    Promise.all([
      fetch(pricingUrl).then(function (r) { return r.json(); }),
      fetch(quantityUrl).then(function (r) { return r.json(); }),
    ]).then(function (results) {
      setLoading(root, false);
      renderPrice(root, results[0].rule, originalPrice, currency);
      renderQuantityNotices(results[1].rule);
      attachQtyWatcher(results[1].rule);
    }).catch(function (err) {
      console.warn('[TradeLayer] API error:', err);
      setLoading(root, false);
      // Fail silently — customer sees normal theme price
    });

    // Re-run on variant switch.
    document.addEventListener('variant:change', function (e) {
      var v = e.detail && e.detail.variant;
      if (!v) return;
      var newVariantId    = String(v.id);
      var newOriginalPrice = v.price / 100;

      setLoading(root, true);

      var pu = API_BASE + '/api/storefront/pricing'
        + '?shopDomain='        + encodeURIComponent(shopDomain)
        + '&shopifyCustomerId=' + encodeURIComponent(customerId)
        + '&shopifyProductId='  + encodeURIComponent(productId)
        + '&shopifyVariantId='  + encodeURIComponent(newVariantId);

      var qu = API_BASE + '/api/storefront/quantity'
        + '?shopDomain='        + encodeURIComponent(shopDomain)
        + '&shopifyProductId='  + encodeURIComponent(productId)
        + '&shopifyVariantId='  + encodeURIComponent(newVariantId);

      Promise.all([
        fetch(pu).then(function (r) { return r.json(); }),
        fetch(qu).then(function (r) { return r.json(); }),
      ]).then(function (results) {
        setLoading(root, false);
        renderPrice(root, results[0].rule, newOriginalPrice, currency);
        renderQuantityNotices(results[1].rule);
        attachQtyWatcher(results[1].rule);
      }).catch(function () { setLoading(root, false); });
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function setLoading(root, on) {
    var el = root.querySelector('.tradelayer-loading');
    if (!el && on) {
      el = document.createElement('div');
      el.className = 'tradelayer-loading';
      el.textContent = 'Loading your price\u2026';
      root.appendChild(el);
    } else if (el && !on) {
      el.remove();
    }
  }

  function fmt(currency, n) {
    return currency + n.toFixed(2);
  }

  function showLoginPrompt(root, msg, loginUrl) {
    root.innerHTML =
      '<div class="tradelayer-login-prompt">' +
        '<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style="color:#008060" aria-hidden="true">' +
          '<path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 4a3 3 0 110 6 3 3 0 010-6zm0 14a8 8 0 01-6.27-3.034C4.427 13.337 7.027 12 10 12s5.573 1.337 6.27 2.966A8 8 0 0110 18z"/>' +
        '</svg>' +
        '<span>' + msg + ' &mdash; <a href="' + loginUrl + '">Log in</a></span>' +
      '</div>';
  }

  function renderPrice(root, rule, originalPrice, currency) {
    // Remove previous price block if any.
    var old = root.querySelector('.tradelayer-price-block');
    if (old) old.remove();

    if (!rule) return; // no rule → block stays empty, theme shows its own price

    var b2bPrice;
    if (rule.ruleType === 'percentage_discount') {
      b2bPrice = originalPrice * (1 - parseFloat(rule.value) / 100);
    } else {
      // fixed_price
      b2bPrice = parseFloat(rule.value);
    }

    var savings    = originalPrice - b2bPrice;
    var savingsPct = Math.round((savings / originalPrice) * 100);

    var block = document.createElement('div');
    block.className = 'tradelayer-price-block';
    block.innerHTML =
      '<div style="margin-bottom:6px;"><span class="tradelayer-badge">Wholesale Price</span></div>' +
      '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">' +
        '<span class="tradelayer-b2b-price">' + fmt(currency, b2bPrice) + '</span>' +
        '<span class="tradelayer-original-price">RRP ' + fmt(currency, originalPrice) + '</span>' +
        (savings > 0.005
          ? '<span class="tradelayer-savings">You save ' + fmt(currency, savings) + ' (' + savingsPct + '%)</span>'
          : '') +
      '</div>';

    root.insertBefore(block, root.firstChild);
  }

  function renderQuantityNotices(rule) {
    var noticesEl = document.getElementById('tradelayer-qty-notices');
    if (!noticesEl) return;

    if (!rule) {
      noticesEl.style.display = 'none';
      noticesEl.innerHTML = '';
      return;
    }

    var icon = '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/></svg> ';
    var notices = [];

    if (rule.minQuantity > 1)
      notices.push(icon + 'Minimum order: <strong>' + rule.minQuantity + '</strong> units');
    if (rule.stepQuantity > 1)
      notices.push(icon + 'Must be ordered in multiples of <strong>' + rule.stepQuantity + '</strong>');
    if (rule.maxQuantity)
      notices.push(icon + 'Maximum order: <strong>' + rule.maxQuantity + '</strong> units');

    if (!notices.length) {
      noticesEl.style.display = 'none';
      return;
    }

    noticesEl.innerHTML = notices.map(function (n) {
      return '<div class="tradelayer-notice">' + n + '</div>';
    }).join('');
    noticesEl.style.display = '';
  }

  function attachQtyWatcher(rule) {
    if (!rule) return;

    var min  = rule.minQuantity  || 1;
    var step = rule.stepQuantity || 1;
    var max  = rule.maxQuantity  || null;

    var qtyInput = document.querySelector(
      '[name="quantity"], .quantity__input, input[data-quantity-input], #Quantity'
    );
    if (!qtyInput) return;

    qtyInput.setAttribute('min', String(min));
    qtyInput.setAttribute('step', String(step));
    if (max) qtyInput.setAttribute('max', String(max));
    if (!qtyInput.value || parseInt(qtyInput.value) < min) qtyInput.value = String(min);

    function validate() {
      var qty    = parseInt(qtyInput.value) || 0;
      var errEl  = document.getElementById('tradelayer-qty-error');
      var addBtn = document.querySelector('[name="add"], .product-form__submit, button[data-add-to-cart]');
      var msg    = '';

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
      if (addBtn) addBtn.disabled = !!msg;
    }

    qtyInput.addEventListener('change', validate);
    qtyInput.addEventListener('input', validate);
    validate();
  }

  // Boot when DOM ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
