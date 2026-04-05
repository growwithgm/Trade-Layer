export function generateAppHTML(apiKey: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TradeLayer</title>
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" data-api-key="${apiKey}"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f1f2f4;
      color: #202223;
      padding: 24px;
    }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 26px; font-weight: 700; color: #202223; }
    .page-subtitle { font-size: 14px; color: #6d7175; margin-top: 4px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 20px 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .card-icon { font-size: 28px; margin-bottom: 12px; }
    .card-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
    .card-count { font-size: 28px; font-weight: 700; color: #008060; margin-bottom: 6px; }
    .card-desc { font-size: 13px; color: #6d7175; line-height: 1.5; }
    .badge {
      display: inline-block;
      background: #e4f5f0;
      color: #008060;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 99px;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="page-header">
    <div class="page-title">TradeLayer</div>
    <div class="page-subtitle">B2B Wholesale Engine for Shopify</div>
  </div>
  <div class="grid">
    <div class="card">
      <div class="card-icon">💰</div>
      <div class="card-title">Pricing Rules</div>
      <div class="card-count">0</div>
      <div class="card-desc">Set percentage discounts or fixed prices per customer group, product, or variant.</div>
      <span class="badge">Active</span>
    </div>
    <div class="card">
      <div class="card-icon">📦</div>
      <div class="card-title">Quantity Rules</div>
      <div class="card-count">0</div>
      <div class="card-desc">Define minimum order quantities, step increments, and maximum limits per product.</div>
      <span class="badge">Active</span>
    </div>
    <div class="card">
      <div class="card-icon">👥</div>
      <div class="card-title">Customer Groups</div>
      <div class="card-count">0</div>
      <div class="card-desc">Organise wholesale buyers into groups and apply pricing rules to each group.</div>
      <span class="badge">Active</span>
    </div>
    <div class="card">
      <div class="card-icon">⚡</div>
      <div class="card-title">Quick Order</div>
      <div class="card-count">—</div>
      <div class="card-desc">Let B2B customers add multiple SKUs to cart at once using a fast order form.</div>
      <span class="badge">Coming soon</span>
    </div>
  </div>
</body>
</html>`;
}
