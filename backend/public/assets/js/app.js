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

// Returns ?shop=xxx&host=xxx from the current URL, or '' if neither is present.
function getNavQS() {
  const p = new URLSearchParams(window.location.search);
  const parts = [];
  if (p.get('shop')) parts.push('shop=' + encodeURIComponent(p.get('shop')));
  if (p.get('host')) parts.push('host=' + encodeURIComponent(p.get('host')));
  return parts.length ? '?' + parts.join('&') : '';
}

function renderSidebar(activeFile){
  const nav = document.getElementById('sidebar-nav');
  if(!nav) return;
  const qs = getNavQS();
  const mainItems = TL_PAGES.filter(p => p.group === 'main');
  const pricingItems = TL_PAGES.filter(p => p.group === 'pricing');
  const orderItems = TL_PAGES.filter(p => p.group === 'orders');
  const settingItems = TL_PAGES.filter(p => p.group === 'settings');

  function item(page, sub=false){
    const cls = sub ? 'nav-sub-item' : 'nav-item';
    const active = page.file === activeFile ? ' active' : '';
    const icon = sub ? '' : `<i data-lucide="${page.icon}" class="w-4 h-4"></i>`;
    return `<a href="${page.file}${qs}" class="${cls}${active}">${icon}<span>${page.label}</span></a>`;
  }

  nav.innerHTML = `
    ${mainItems.map(p => item(p)).join('')}
    <div class="nav-item active-group" style="margin-top:6px;color:var(--brand);background:transparent"><i data-lucide="circle-dollar-sign" class="w-4 h-4"></i><span>Pricing</span></div>
    <div class="nav-sub-wrap">${pricingItems.map(p => item(p,true)).join('')}</div>
    <div class="nav-section-title">Operations</div>
    ${orderItems.map(p => item(p)).join('')}
    <div class="nav-section-title">Controls</div>
    ${settingItems.map(p => item(p)).join('')}
    <div class="nav-section-title">Support</div>
    <a href="#${qs}" class="nav-item"><i data-lucide="user" class="w-4 h-4"></i><span>Account</span></a>
    <a href="#${qs}" class="nav-item"><i data-lucide="help-circle" class="w-4 h-4"></i><span>Help</span></a>
    <a href="#${qs}" class="nav-item"><i data-lucide="arrow-left-right" class="w-4 h-4"></i><span>Return to Shopify</span></a>
  `;
}

// After rendering any dynamic links, patch all local .html hrefs to carry shop+host.
function fixNavLinks() {
  const qs = getNavQS();
  if (!qs) return;
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.endsWith('.html') && !href.startsWith('http')) {
      link.setAttribute('href', href + qs);
    }
  });
}

function initCharts(){
  if(!window.Chart) return;
  document.querySelectorAll('[data-chart]').forEach((canvas) => {
    const type = canvas.dataset.chart;
    const ctx = canvas.getContext('2d');
    if(type === 'sales'){
      new Chart(ctx, {
        type:'line',
        data:{
          labels:['1','5','10','15','20','25','30'],
          datasets:[{label:'Sales', data:[4200,6200,5800,8900,7600,11200,12800], borderColor:'#5c59f2', backgroundColor:'rgba(92,89,242,.08)', pointBackgroundColor:'#5c59f2', fill:true, tension:.35, borderWidth:2}]
        },
        options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{grid:{color:'#f1f5f9'}, ticks:{color:'#94a3b8'}}, x:{grid:{display:false}, ticks:{color:'#94a3b8'}}}}
      });
    }
    if(type === 'quotes'){
      new Chart(ctx, {
        type:'bar',
        data:{
          labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
          datasets:[{data:[8,11,7,14,13,6,4], backgroundColor:'#5c59f2', borderRadius:8, maxBarThickness:28}]
        },
        options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{grid:{color:'#f1f5f9'}, ticks:{color:'#94a3b8'}}, x:{grid:{display:false}, ticks:{color:'#94a3b8'}}}}
      });
    }
    if(type === 'donut'){
      new Chart(ctx, {
        type:'doughnut',
        data:{labels:['Approved','Pending','Rejected'], datasets:[{data:[62,28,10], backgroundColor:['#10b981','#f59e0b','#ef4444'], borderWidth:0}]},
        options:{responsive:true, maintainAspectRatio:false, cutout:'72%', plugins:{legend:{position:'bottom', labels:{usePointStyle:true, boxWidth:8, color:'#64748b'}}}}
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const current = location.pathname.split('/').pop() || 'index.html';
  renderSidebar(current);
  fixNavLinks();
  if(window.lucide) lucide.createIcons();
  initCharts();
});
