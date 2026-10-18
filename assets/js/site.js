(function () {
  var root = document.documentElement;

  // Theme toggle: cycles system -> dark -> light -> system
  var btn = document.getElementById('theme-toggle');
  function label() {
    var t = root.getAttribute('data-theme');
    if (btn) btn.textContent = t === 'dark' ? 'Dark' : t === 'light' ? 'Light' : 'Auto';
  }
  if (btn) {
    label();
    btn.addEventListener('click', function () {
      var t = root.getAttribute('data-theme');
      var next = t === 'dark' ? 'light' : t === 'light' ? null : 'dark';
      if (next) root.setAttribute('data-theme', next); else root.removeAttribute('data-theme');
      try { if (next) localStorage.setItem('theme', next); else localStorage.removeItem('theme'); } catch (e) {}
      label();
    });
  }

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.getElementById(b.getAttribute('data-copy'));
      if (!el) return;
      var orig = b.textContent;
      function done(msg) { b.textContent = msg; setTimeout(function () { b.textContent = orig; }, 1600); }
      function select() {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected');
      }
      try { navigator.clipboard.writeText(el.textContent.trim()).then(function () { done('Copied'); }, select); }
      catch (e) { select(); }
    });
  });

  // Search + tag filters (blog, reading notes, gallery)
  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var list = scope.nextElementSibling;
    while (list && !list.hasAttribute('data-list')) list = list.nextElementSibling;
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-item]'));
    var search = scope.querySelector('[data-search]');
    var count = scope.querySelector('[data-count]');
    var buttons = scope.querySelectorAll('[data-tag]');
    var tag = '';
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      items.forEach(function (it) {
        var okTag = !tag || (' ' + it.getAttribute('data-tags') + ' ').indexOf(' ' + tag + ' ') > -1;
        var okText = !q || (it.getAttribute('data-text') || '').indexOf(q) > -1;
        it.hidden = !(okTag && okText);
        if (!it.hidden) shown++;
      });
      if (count) count.textContent = shown + ' of ' + items.length;
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        tag = b.getAttribute('data-tag');
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    apply();
  });

  // Gallery lightbox: arrows, keyboard (left/right/Esc) and swipe move between photos.
  var dlg = document.getElementById('lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var img = document.getElementById('lb-img'), cap = document.getElementById('lb-cap'),
        count = document.getElementById('lb-count'), list = [], cur = 0;
    // Only photos currently visible (respects gallery filters), in page order.
    function visible() {
      return Array.prototype.filter.call(document.querySelectorAll('[data-lightbox]'), function (b) {
        return b.offsetParent !== null;
      });
    }
    function show(i) {
      var n = list.length; if (!n) return;
      cur = (i + n) % n;
      var b = list[cur], c = b.getAttribute('data-caption') || '';
      img.src = b.getAttribute('data-lightbox'); img.alt = c; cap.textContent = c;
      count.textContent = n > 1 ? (cur + 1) + ' / ' + n : '';
      dlg.classList.toggle('single', n < 2);
      // Preload neighbours so moving feels instant.
      if (n > 1) [cur + 1, cur - 1].forEach(function (k) { new Image().src = list[(k + n) % n].getAttribute('data-lightbox'); });
    }
    document.querySelectorAll('[data-lightbox]').forEach(function (b) {
      b.addEventListener('click', function () {
        list = visible(); if (list.indexOf(b) < 0) list = [b];
        show(list.indexOf(b)); dlg.showModal();
      });
    });
    document.getElementById('lb-prev').addEventListener('click', function () { show(cur - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(cur + 1); });
    document.getElementById('lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    });
    var x0 = null, y0 = null;
    dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1));
    });
  }

  // ---------- Background: Bacillus chains, cocci and natural-product ring scaffolds ----------
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function capsule(x, L, w) {
    var r = w / 2; x.beginPath(); x.moveTo(r, -r); x.lineTo(L - r, -r);
    x.arc(L - r, 0, r, -Math.PI / 2, Math.PI / 2); x.lineTo(r, r); x.arc(r, 0, r, Math.PI / 2, Math.PI * 1.5); x.closePath();
  }
  var lastW = 0;
  function drawBg(force) {
    var c = document.getElementById('bg'); if (!c || !c.getContext) return;
    var W = window.innerWidth, H = Math.max(window.innerHeight, (screen && screen.height) || 0);
    if (!force && W === lastW) return; lastW = W;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = W * dpr; c.height = H * dpr; c.style.height = H + 'px';
    var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    var cs = getComputedStyle(root), v = function (n) { return cs.getPropertyValue(n).trim(); };
    var ink = v('--bg-ink'), ink2 = v('--bg-ink-2'), bg = v('--bg'), A = parseFloat(v('--bg-alpha')) || .13;
    var r = rng(hash(location.pathname));
    var n = Math.round(W * H / 24000) + 8;
    x.lineJoin = 'round'; x.lineCap = 'round'; x.lineWidth = 1.4;
    for (var i = 0; i < n; i++) {
      var px = r() * W, py = r() * H, t = r();
      x.globalAlpha = A * (0.55 + r() * 0.7);
      x.strokeStyle = ink;
      if (t < 0.5) {                       // Bacillus: rods in a short chain, some with endospores
        var a = r() * Math.PI * 2, k = 2 + Math.floor(r() * 4), w = 11 + r() * 3;
        for (var j = 0; j < k; j++) {
          var L = 30 + r() * 22;
          x.save(); x.translate(px, py); x.rotate(a);
          capsule(x, L, w); x.fillStyle = ink2; x.globalAlpha *= 0.5; x.fill(); x.globalAlpha /= 0.5; x.stroke();
          if (r() < 0.3) {
            var sx = r() < 0.5 ? L - w * 0.85 : L / 2;
            x.beginPath(); x.ellipse(sx, 0, w * 0.5, w * 0.3, 0, 0, Math.PI * 2); x.fillStyle = bg; x.fill(); x.stroke();
          }
          x.restore();
          px += Math.cos(a) * (L + 2.5); py += Math.sin(a) * (L + 2.5); a += (r() - 0.5) * 0.4;
        }
      } else if (t < 0.68) {               // cocci in a grape-like cluster
        var m = 4 + Math.floor(r() * 5);
        for (var q = 0; q < m; q++) {
          x.beginPath(); x.arc(px + (r() - 0.5) * 26, py + (r() - 0.5) * 26, 5.5 + r() * 2, 0, Math.PI * 2);
          x.fillStyle = ink2; x.globalAlpha *= 0.5; x.fill(); x.globalAlpha /= 0.5; x.stroke();
        }
      } else {                             // fused six-membered rings, as in polyketide scaffolds
        var s = 13 + r() * 7, rings = 1 + Math.floor(r() * 3), ang = r() * Math.PI;
        x.save(); x.translate(px, py); x.rotate(ang);
        var verts = [];
        for (var h = 0; h < rings; h++) {
          var cx = h * s * Math.sqrt(3), pts = [];
          for (var e = 0; e < 6; e++) { var th = (-90 + 60 * e) * Math.PI / 180; pts.push([cx + s * Math.cos(th), s * Math.sin(th)]); }
          x.beginPath(); pts.forEach(function (p, idx) { idx ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); }); x.closePath(); x.stroke();
          if (h === 0) for (var b = 0; b < 6; b += 2) {   // inner lines marking alternating double bonds
            var p1 = pts[b], p2 = pts[(b + 1) % 6], f = 0.78;
            x.beginPath(); x.moveTo(cx + (p1[0] - cx) * f, p1[1] * f); x.lineTo(cx + (p2[0] - cx) * f, p2[1] * f); x.stroke();
          }
          verts = verts.concat(pts);
        }
        var subs = 1 + Math.floor(r() * 2), labels = ['OH', 'O', 'NH', 'OMe'];
        for (var u = 0; u < subs; u++) {
          var vv = verts[Math.floor(r() * verts.length)], ox = vv[0], oy = vv[1], dl = Math.hypot(ox, oy) || 1;
          var ex = ox + ox / dl * s * 0.9, ey = oy + oy / dl * s * 0.9;
          x.beginPath(); x.moveTo(ox, oy); x.lineTo(ex, ey); x.stroke();
          if (r() < 0.6) { x.fillStyle = ink; x.font = '9px "IBM Plex Mono", monospace'; x.fillText(labels[Math.floor(r() * labels.length)], ex + 2, ey + 3); }
        }
        x.restore();
      }
    }
    x.globalAlpha = 1;
  }
  drawBg(true);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { drawBg(false); }, 150); });
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { drawBg(true); }); } catch (e) {}
  if (btn) btn.addEventListener('click', function () { drawBg(true); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawBg(true); });

  // ---------- Plate menu ----------
  var menu = document.getElementById('plate-menu'), pbtn = document.getElementById('plate-btn');
  if (menu && pbtn && typeof menu.showModal === 'function') {
    pbtn.addEventListener('click', function () { menu.showModal(); });
    document.getElementById('plate-close').addEventListener('click', function () { menu.close(); });
    menu.addEventListener('click', function (e) { if (e.target === menu) menu.close(); });
  } else if (pbtn) { pbtn.hidden = true; }

  // ---------- Walking-microbe page transition ----------
  var walk = document.getElementById('walk'), wlabel = document.getElementById('walk-label');
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var noWalk = document.body.hasAttribute('data-no-walk') || reduce || !walk;
  if (root.classList.contains('arriving') && walk) {
    requestAnimationFrame(function () {
      walk.classList.add('leaving');
      setTimeout(function () { root.classList.remove('arriving'); walk.classList.remove('leaving'); }, 560);
    });
  }
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && walk) { walk.classList.remove('on', 'going', 'leaving'); root.classList.remove('arriving'); }
  });
  if (!noWalk) document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a'); if (!a) return;
    var href = a.getAttribute('href'); if (!href || a.getAttribute('target') || a.hasAttribute('download')) return;
    var url; try { url = new URL(href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (/\.(xml|pdf|jpe?g|png|gif|webp|zip)$/i.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    if (menu && menu.open) menu.close();
    var name = (a.getAttribute('data-title') || a.textContent || '').trim().replace(/\s+/g, ' ');
    if (name.length > 42) name = name.slice(0, 40) + '…';
    if (wlabel) wlabel.textContent = name ? 'Subculturing to ' + name : 'Subculturing';
    walk.classList.remove('leaving'); walk.classList.add('on', 'going');
    try { sessionStorage.setItem('walk', '1'); } catch (err) {}
    setTimeout(function () { location.href = url.href; }, 600);
  });
})();
