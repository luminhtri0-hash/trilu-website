/**
 * TRÍ LỮ NIHONGO — PAYWALL SCRIPT
 *
 * Cách dùng (gắn vào bất kỳ trang content nào):
 *   <script src="/tai-lieu/_paywall/paywall.js"
 *           data-doc-id="tu-dien-gs-nvk"></script>
 *
 * Script sẽ:
 *  1. Load /tai-lieu/_paywall/content-config.json
 *  2. Đọc tier của user từ localStorage (`trilu_user_tier` = FREE | PLUS | PRO)
 *  3. So tier user vs tier yêu cầu — nếu đủ → hiện full
 *  4. Nếu không đủ → giữ N entry đầu (config.freeUnits), blur + overlay phần còn lại + show modal nâng cấp
 *
 * Anh có thể test bằng:
 *   localStorage.setItem('trilu_user_tier','PLUS')  // hoặc PRO / FREE
 *   location.reload()
 *
 * Hoặc dùng "DEV switch" ở góc phải bottom (sẽ tự ẩn nếu localStorage.trilu_dev = '0').
 */
(function () {
  'use strict';

  // ============ CONFIG ============
  var CFG_URL = '/tai-lieu/_paywall/content-config.json';
  var PRICING_URL = '/gia-goi.html';
  var LOGIN_URL = '/dang-nhap.html';
  var TIER_RANK = { FREE: 0, PLUS: 1, PRO: 2 };
  var BRAND_KANJI_LOCK = '限';

  // ============ HELPERS ============
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function getDocId() {
    var s = document.currentScript;
    if (s && s.dataset && s.dataset.docId) return s.dataset.docId;
    // fallback: from URL path
    var m = location.pathname.match(/\/tai-lieu\/[^/]+\/([^/]+)\.html/);
    return m ? m[1] : null;
  }

  function getUserTier() {
    try { return (localStorage.getItem('trilu_user_tier') || 'FREE').toUpperCase(); }
    catch (e) { return 'FREE'; }
  }
  function setUserTier(t) {
    try { localStorage.setItem('trilu_user_tier', t); } catch (e) {}
  }

  function hasAccess(userTier, requiredTier) {
    return (TIER_RANK[userTier] || 0) >= (TIER_RANK[requiredTier] || 0);
  }

  function loadConfig() {
    return fetch(CFG_URL, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('config fetch failed'); return r.json(); })
      .catch(function () {
        console.warn('[paywall] cannot load config — defaults to free');
        return { documents: {} };
      });
  }

  // ============ STYLES ============
  function injectCSS() {
    if (document.getElementById('paywall-style')) return;
    var css = document.createElement('style');
    css.id = 'paywall-style';
    css.textContent = [
      '.paywall-locked{position:relative}',
      '.paywall-veil{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(251,246,232,0)0%,rgba(251,246,232,.7)40%,rgba(251,246,232,.96)80%);z-index:5}',
      '.paywall-locked > *{filter:blur(6px);user-select:none}',
      '.paywall-callout{position:relative;margin:32px auto 48px;max-width:720px;padding:36px 32px;background:linear-gradient(180deg,#FBF6E8,#F2EDDE);border:1px solid #E0D5BC;border-top:3px solid #B89568;border-radius:6px;box-shadow:0 8px 40px rgba(27,58,107,.08);text-align:center;z-index:10}',
      '.paywall-kanji{font-family:"Shippori Mincho","Noto Serif JP",serif;font-size:96px;line-height:1;color:#8B3A2E;margin:0 0 12px}',
      '.paywall-eyebrow{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.2em;color:#666;text-transform:uppercase;margin-bottom:8px}',
      '.paywall-title{font-family:"Cormorant Garamond","Noto Serif JP",serif;font-style:italic;font-size:32px;line-height:1.25;color:#1B3A6B;margin:0 0 12px}',
      '.paywall-meta{font-size:14px;color:#555;margin-bottom:24px}',
      '.paywall-meta b{color:#B89568;font-weight:700;font-family:"JetBrains Mono",monospace}',
      '.paywall-benefits{text-align:left;display:inline-block;margin:0 auto 28px;padding:0;list-style:none}',
      '.paywall-benefits li{padding:6px 0;font-size:15px;color:#333}',
      '.paywall-benefits li::before{content:"✓ ";color:#B89568;font-weight:700;margin-right:8px}',
      '.paywall-cta{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:8px}',
      '.paywall-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;font-family:"Inter Tight",sans-serif;font-size:14px;font-weight:600;letter-spacing:.04em;border-radius:4px;text-decoration:none;cursor:pointer;border:none;transition:.2s}',
      '.paywall-btn-primary{background:#B89568;color:#FBF6E8}',
      '.paywall-btn-primary:hover{background:#9F7E55;transform:translateY(-1px)}',
      '.paywall-btn-ghost{background:transparent;color:#1B3A6B;border:1px solid #1B3A6B}',
      '.paywall-btn-ghost:hover{background:#1B3A6B;color:#FBF6E8}',
      '.paywall-foot{margin-top:20px;font-size:12px;color:#888;font-family:"JetBrains Mono",monospace}',
      '.paywall-foot a{color:#B89568;text-decoration:none;border-bottom:1px dashed #B89568}',
      '.paywall-banner{position:sticky;top:0;z-index:50;background:#1B3A6B;color:#FBF6E8;padding:10px 20px;text-align:center;font-size:13px;font-family:"Inter Tight",sans-serif;letter-spacing:.02em}',
      '.paywall-banner b{color:#E7C896}',
      '.paywall-banner a{color:#FBF6E8;border-bottom:1px solid #FBF6E8;text-decoration:none;margin-left:10px}',
      '.paywall-tier-pill{display:inline-block;padding:3px 10px;border-radius:99px;font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;font-weight:700}',
      '.paywall-tier-PLUS{background:#B89568;color:#fff}',
      '.paywall-tier-PRO{background:#8B3A2E;color:#fff}',
      '.paywall-tier-FREE{background:#E0D5BC;color:#555}',
      // DEV switch
      '#paywall-devswitch{position:fixed;bottom:14px;right:14px;z-index:9999;background:rgba(27,58,107,.92);color:#FBF6E8;padding:8px 12px;font-family:"JetBrains Mono",monospace;font-size:11px;border-radius:4px;border:1px solid #B89568;box-shadow:0 4px 12px rgba(0,0,0,.2)}',
      '#paywall-devswitch select{margin-left:6px;background:#FBF6E8;color:#1B3A6B;border:none;padding:3px 6px;font-family:inherit;font-size:11px;border-radius:3px}',
      '#paywall-devswitch button{margin-left:6px;background:transparent;color:#E7C896;border:none;cursor:pointer;font-size:14px}'
    ].join('\n');
    document.head.appendChild(css);
  }

  // ============ DEV SWITCH (góc phải) ============
  function injectDevSwitch() {
    try { if (localStorage.getItem('trilu_dev') === '0') return; } catch (e) {}
    var d = document.createElement('div');
    d.id = 'paywall-devswitch';
    var cur = getUserTier();
    d.innerHTML =
      '[DEV] Tier: <select>' +
        '<option value="FREE"' + (cur === 'FREE' ? ' selected' : '') + '>FREE</option>' +
        '<option value="PLUS"' + (cur === 'PLUS' ? ' selected' : '') + '>PLUS</option>' +
        '<option value="PRO"'  + (cur === 'PRO'  ? ' selected' : '') + '>PRO</option>' +
      '</select>' +
      '<button title="Tắt dev switch (set localStorage trilu_dev=0)">×</button>';
    document.body.appendChild(d);
    d.querySelector('select').addEventListener('change', function (e) {
      setUserTier(e.target.value);
      location.reload();
    });
    d.querySelector('button').addEventListener('click', function () {
      try { localStorage.setItem('trilu_dev', '0'); } catch (e) {}
      d.remove();
    });
  }

  // ============ APPLY PAYWALL ============
  function apply(doc, docConfig, userTier) {
    var sels = (docConfig.selector || 'tbody.word-group, section.lesson, tr').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var items = [];
    for (var i = 0; i < sels.length; i++) {
      var found = $$(sels[i]);
      if (found.length > items.length) items = found;
    }
    // Skip header rows in case selector is "tr"
    if (items.length && items[0].querySelector && items[0].querySelector('th')) {
      items = items.filter(function (n) { return !n.querySelector('th'); });
    }
    if (!items.length) {
      console.warn('[paywall] no items found for selector', sels);
      return;
    }

    var free = docConfig.freeUnits;
    var total = items.length;

    // -1 = unlimited free for the document
    if (free === -1 || hasAccess(userTier, docConfig.tier || 'PLUS')) {
      showBanner(docConfig, userTier, /*unlocked=*/true, total);
      return;
    }

    var showCount = Math.max(0, Math.min(free, total));
    var lockedFrom = showCount;

    // Build a "locked group" wrapper so we can blur it
    if (lockedFrom < total) {
      var parent = items[lockedFrom].parentNode;
      var wrap = document.createElement('div');
      wrap.className = 'paywall-locked';
      // For tbody/tr, we can't easily wrap in a div without breaking table — fall back to just hiding
      var isTableRow = items[lockedFrom].tagName === 'TR' || items[lockedFrom].tagName === 'TBODY';
      if (isTableRow) {
        // Just remove locked rows from view
        for (var k = lockedFrom; k < total; k++) {
          items[k].style.display = 'none';
        }
      } else {
        // Insert wrap before lockedFrom, then move locked items into wrap
        parent.insertBefore(wrap, items[lockedFrom]);
        for (var j = lockedFrom; j < total; j++) {
          wrap.appendChild(items[j]);
        }
        var veil = document.createElement('div');
        veil.className = 'paywall-veil';
        wrap.appendChild(veil);
      }
    }

    showBanner(docConfig, userTier, /*unlocked=*/false, total, showCount);
    showCallout(docConfig, userTier, total, showCount);
  }

  function showBanner(docConfig, userTier, unlocked, total, showCount) {
    var b = document.createElement('div');
    b.className = 'paywall-banner';
    if (unlocked) {
      b.innerHTML = '<span class="paywall-tier-pill paywall-tier-' + userTier + '">' + userTier + '</span> Đang xem đầy đủ <b>' + total + ' ' + (docConfig.unitLabel || 'mục') + '</b> · ' + docConfig.title;
    } else {
      b.innerHTML = 'Bạn đang xem bản miễn phí: <b>' + showCount + '/' + total + ' ' + (docConfig.unitLabel || 'mục') + '</b> · ' +
                    '<a href="' + PRICING_URL + '">Nâng cấp ' + (docConfig.tier || 'PLUS') + ' →</a>';
    }
    document.body.insertBefore(b, document.body.firstChild);
  }

  function showCallout(docConfig, userTier, total, showCount) {
    var c = document.createElement('div');
    c.className = 'paywall-callout';
    var tier = docConfig.tier || 'PLUS';
    var price = tier === 'PRO' ? '199.000đ / tháng' : '99.000đ / tháng';
    c.innerHTML =
      '<div class="paywall-kanji">' + BRAND_KANJI_LOCK + '</div>' +
      '<div class="paywall-eyebrow">PHẦN CÒN LẠI THUỘC GÓI <span class="paywall-tier-pill paywall-tier-' + tier + '">' + tier + '</span></div>' +
      '<div class="paywall-title">"Mỗi từ là một chiếc cổng — mở thêm để đi sâu hơn."</div>' +
      '<div class="paywall-meta">Bạn đã đọc <b>' + showCount + ' / ' + total + ' ' + (docConfig.unitLabel || 'mục') + '</b> miễn phí của <b>' + docConfig.title + '</b>.</div>' +
      '<ul class="paywall-benefits">' +
      '  <li>Mở khóa toàn bộ ' + total + ' ' + (docConfig.unitLabel || 'mục') + ' đã được biên soạn và hiệu đính</li>' +
      '  <li>Tải PDF gốc + audio (nếu có) để học offline</li>' +
      '  <li>Không quảng cáo, không giới hạn lượt tra cứu</li>' +
      '  <li>Truy cập toàn bộ thư viện ' + (tier === 'PRO' ? 'PRO (giáo án + lộ trình + 1-1)' : 'PLUS (từ điển + ngữ pháp + AI chấm)') + '</li>' +
      '</ul>' +
      '<div class="paywall-cta">' +
      '  <a class="paywall-btn paywall-btn-primary" href="' + PRICING_URL + '?plan=' + tier.toLowerCase() + '">Nâng cấp ' + tier + ' · ' + price + '</a>' +
      '  <a class="paywall-btn paywall-btn-ghost" href="' + LOGIN_URL + '">Đã có tài khoản? Đăng nhập</a>' +
      '</div>' +
      '<div class="paywall-foot">Đối tác truyền thông <a href="https://mazii.net" target="_blank" rel="noopener">Mazii Dictionary</a> · ' +
      'Hiệu đính bởi Lữ Minh Trí — JLPT N1 180/180</div>';

    // Place callout right after the visible content
    var insertTarget = $('main') || $('article') || $('.page-container') || document.body;
    insertTarget.appendChild(c);
  }

  // ============ BOOTSTRAP ============
  function boot() {
    var docId = getDocId();
    if (!docId) { console.warn('[paywall] no doc id'); return; }
    injectCSS();
    injectDevSwitch();
    loadConfig().then(function (cfg) {
      var docCfg = (cfg.documents || {})[docId];
      if (!docCfg) {
        console.warn('[paywall] no config for', docId);
        return;
      }
      apply(document, docCfg, getUserTier());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
