window.TL_PAGES = [
  {file:'index.html', label:'Home', icon:'home', group:'main'},
  {file:'activity.html', label:'Activity', icon:'shopping-cart', group:'main'},
  {file:'price-lists.html', label:'Price Lists', icon:'list', group:'pricing'},
  {file:'price-editor.html', label:'Price Editor', icon:'badge-dollar-sign', group:'pricing'},
  {file:'discounts.html', label:'Discounts', icon:'percent', group:'pricing'},
  {file:'customer-groups.html', label:'Customer Groups', icon:'users', group:'main'},
  {file:'sales-agents.html', label:'Sales Agents', icon:'globe', group:'main'},
  {file:'quick-order.html', label:'Quick Order', icon:'scan-search', group:'orders'},
  {file:'companies.html', label:'Companies', icon:'building-2', group:'orders'},
  {file:'company-users.html', label:'Company Users', icon:'user-round-cog', group:'orders'},
  {file:'approvals.html', label:'Approvals', icon:'badge-check', group:'orders'},
  {file:'quotes.html', label:'Quotes', icon:'file-text', group:'orders'},
  {file:'finance.html', label:'Finance', icon:'wallet', group:'orders'},
  {file:'analytics.html', label:'Analytics', icon:'bar-chart-3', group:'orders'},
  {file:'integrations.html', label:'Integrations', icon:'link-2', group:'main'},
  {file:'catalog-visibility.html', label:'Catalog Visibility', icon:'eye', group:'settings'},
  {file:'login-rules.html', label:'Login Rules', icon:'shield-check', group:'settings'},
  {file:'contracts.html', label:'Contracts', icon:'file-badge', group:'settings'},
  {file:'settings.html', label:'Settings', icon:'settings', group:'settings'}
];

// ── Query-string helpers ───────────────────────────────────────────────────────

function getQueryString() {
  return window.location.search || '';
}

function getNavQS() {
  var p = new URLSearchParams(window.location.search);
  var parts = [];
  if (p.get('shop')) parts.push('shop=' + encodeURIComponent(p.get('shop')));
  if (p.get('host')) parts.push('host=' + encodeURIComponent(p.get('host')));
  return parts.length ? '?' + parts.join('&') : '';
}

// ── Navigation ─────────────────────────────────────────────────────────────────
// In a Shopify embedded app the page lives in an iframe.
// We must never navigate the iframe to admin.shopify.com (blocked by its CSP).
// Strategy:
//   1. Fetch the target page HTML.
//   2. Swap out the .main content area in-place (no full reload needed).
//   3. Re-run lucide + any page-level initPage() defined by the target page.
//   4. On any failure fall back to a same-origin full navigation that keeps
//      shop+host params so the auth middleware doesn't redirect to Shopify admin.

function navigateTo(page) {
  var qs = getQueryString();
  var targetUrl = window.location.origin + '/' + page + qs;

  // Show a lightweight loading indicator
  var spinner = document.createElement('div');
  spinner.id = '_nav_spinner';
  spinner.style.cssText = 'position:fixed;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#5c59f2,#818cf8);z-index:9999;animation:nav-bar 1s ease infinite alternate';
  document.body.appendChild(spinner);

  fetch(targetUrl, { credentials: 'same-origin' })
    .then(function(r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    })
    .then(function(html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var newMain = doc.querySelector('.main');
      var currentMain = document.querySelector('.main');

      if (!newMain || !currentMain) { throw new Error('no .main'); }

      // Swap content
      currentMain.innerHTML = newMain.innerHTML;

      // Update browser URL without full reload
      history.pushState({ page: page }, '', targetUrl);

      // Update page title
      if (doc.title) document.title = doc.title;

      // Re-activate active sidebar link
      var current = page;
      document.querySelectorAll('.nav-item, .nav-sub-item').forEach(function(el) {
        el.classList.remove('active');
      });
      document.querySelectorAll('[data-nav="' + current + '"]').forEach(function(el) {
        el.classList.add('active');
      });

      // Execute inline scripts from the new page
      newMain.querySelectorAll('script').forEach(function(s) {
        var ns = document.createElement('script');
        ns.textContent = s.textContent;
        document.body.appendChild(ns);
        document.body.removeChild(ns);
      });

      // Re-create icons
      if (window.lucide) lucide.createIcons();

      // Call page-level init if defined
      if (typeof window.initPage === 'function') {
        window.initPage();
        window.initPage = undefined; // reset for next navigation
      }
    })
    .catch(function() {
      // Fallback: same-origin navigation — keeps shop+host params so
      // auth middleware does NOT redirect through admin.shopify.com
      window.location.assign(targetUrl);
    })
    .finally(function() {
      var s = document.getElementById('_nav_spinner');
      if (s) s.remove();
    });
}

// Handle browser back/forward
window.addEventListener('popstate', function(e) {
  if (e.state && e.state.page) navigateTo(e.state.page);
});

// ── Sidebar ────────────────────────────────────────────────────────────────────

function renderSidebar(activeFile) {
  var nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  var mainItems    = TL_PAGES.filter(function(p){ return p.group === 'main'; });
  var pricingItems = TL_PAGES.filter(function(p){ return p.group === 'pricing'; });
  var orderItems   = TL_PAGES.filter(function(p){ return p.group === 'orders'; });
  var settingItems = TL_PAGES.filter(function(p){ return p.group === 'settings'; });

  function item(page, sub) {
    var cls    = sub ? 'nav-sub-item' : 'nav-item';
    var active = page.file === activeFile ? ' active' : '';
    var icon   = sub ? '' : '<i data-lucide="' + page.icon + '" class="w-4 h-4"></i>';
    return '<a href="#" data-nav="' + page.file + '" class="' + cls + active + '" onclick="event.preventDefault();navigateTo(\'' + page.file + '\')">'
      + icon + '<span>' + page.label + '</span></a>';
  }

  nav.innerHTML =
    mainItems.map(function(p){ return item(p, false); }).join('') +
    '<div class="nav-item active-group" style="margin-top:6px;color:var(--brand);background:transparent">' +
      '<i data-lucide="circle-dollar-sign" class="w-4 h-4"></i><span>Pricing</span></div>' +
    '<div class="nav-sub-wrap">' + pricingItems.map(function(p){ return item(p, true); }).join('') + '</div>' +
    '<div class="nav-section-title">Operations</div>' +
    orderItems.map(function(p){ return item(p, false); }).join('') +
    '<div class="nav-section-title">Controls</div>' +
    settingItems.map(function(p){ return item(p, false); }).join('') +
    '<div class="nav-section-title">Support</div>' +
    '<a href="#" class="nav-item" onclick="event.preventDefault()"><i data-lucide="user" class="w-4 h-4"></i><span>Account</span></a>' +
    '<a href="#" class="nav-item" onclick="event.preventDefault()"><i data-lucide="help-circle" class="w-4 h-4"></i><span>Help</span></a>' +
    '<a href="#" class="nav-item" onclick="event.preventDefault()"><i data-lucide="arrow-left-right" class="w-4 h-4"></i><span>Return to Shopify</span></a>';
}

// ── Charts ─────────────────────────────────────────────────────────────────────

function initCharts() {
  if (!window.Chart) return;
  document.querySelectorAll('[data-chart]').forEach(function(canvas) {
    var type = canvas.dataset.chart;
    var ctx  = canvas.getContext('2d');
    if (type === 'sales') {
      new Chart(ctx, {type:'line',data:{labels:['1','5','10','15','20','25','30'],datasets:[{label:'Sales',data:[4200,6200,5800,8900,7600,11200,12800],borderColor:'#5c59f2',backgroundColor:'rgba(92,89,242,.08)',pointBackgroundColor:'#5c59f2',fill:true,tension:.35,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f1f5f9'},ticks:{color:'#94a3b8'}},x:{grid:{display:false},ticks:{color:'#94a3b8'}}}}});
    }
    if (type === 'quotes') {
      new Chart(ctx, {type:'bar',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{data:[8,11,7,14,13,6,4],backgroundColor:'#5c59f2',borderRadius:8,maxBarThickness:28}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f1f5f9'},ticks:{color:'#94a3b8'}},x:{grid:{display:false},ticks:{color:'#94a3b8'}}}}});
    }
    if (type === 'donut') {
      new Chart(ctx, {type:'doughnut',data:{labels:['Approved','Pending','Rejected'],datasets:[{data:[62,28,10],backgroundColor:['#10b981','#f59e0b','#ef4444'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,color:'#64748b'}}}}});
    }
  });
}

// ── Bootstrap ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  var current = location.pathname.split('/').pop() || 'index.html';
  renderSidebar(current);
  if (window.lucide) lucide.createIcons();
  initCharts();
});
