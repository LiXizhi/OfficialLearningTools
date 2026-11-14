
(function () {
  'use strict';
  var root = document.documentElement;
  var PAGE = root.getAttribute('data-page') || 'page';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  root.classList.add('js');

  /* ---------- 本机保存（只存在这台电脑的浏览器里） ---------- */
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem('bumi-npl-h5:v1:' + PAGE + ':' + k) || 'null'); } catch (e) { return null; } },
    set: function (k, v) { try { v == null ? localStorage.removeItem('bumi-npl-h5:v1:' + PAGE + ':' + k) : localStorage.setItem('bumi-npl-h5:v1:' + PAGE + ':' + k, JSON.stringify(v)); } catch (e) {} }
  };
  var toastEl = $('.toast'), toastTimer;
  function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text; toastEl.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1800);
  }

  /* ---------- 画图格 ---------- */
  function setupSketch(box) {
    var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d'), drawing = false, dirty = false;
    var clear = document.createElement('button');
    clear.type = 'button'; clear.textContent = '擦掉'; clear.title = '清空这一格';
    box.appendChild(canvas); box.appendChild(clear);
    function fit(keep) {
      var r = box.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      var data = keep && dirty ? canvas.toDataURL() : null;
      canvas.width = Math.round(r.width * 2); canvas.height = Math.round(r.height * 2);
      ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1c2937';
      if (data) box.load(data);
    }
    function pos(e) { var r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height]; }
    canvas.addEventListener('pointerdown', function (e) { drawing = true; canvas.setPointerCapture(e.pointerId); var p = pos(e); ctx.beginPath(); ctx.moveTo(p[0], p[1]); e.preventDefault(); });
    canvas.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); ctx.lineTo(p[0], p[1]); ctx.stroke(); dirty = true; });
    function end() { if (!drawing) return; drawing = false; box.dispatchEvent(new Event('input', { bubbles: true })); }
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    clear.addEventListener('click', function () { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; box.dispatchEvent(new Event('input', { bubbles: true })); });
    box.value = function () { return dirty ? canvas.toDataURL('image/png') : ''; };
    box.load = function (data) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = !!data;
      if (!data) return;
      var img = new Image(); img.onload = function () { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); }; img.src = data;
    };
    box.fit = fit;
    fit(false);
  }

  /* ---------- 填写内容的保存与恢复 ---------- */
  function fields(scope) { return $$('input.blank, label.ck input, textarea.cell, .sketch', scope); }
  function valueOf(f) { return f.classList.contains('sketch') ? (f.value ? f.value() : (f.pending || '')) : f.type === 'checkbox' ? (f.checked ? 1 : 0) : f.value; }
  function scopes() { return $$('[data-save]'); }
  function save(scope) {
    var values = fields(scope).map(valueOf);
    var any = values.some(function (v) { return v !== '' && v !== 0; });
    store.set(scope.getAttribute('data-save'), any ? values : null);
    markNav();
  }
  function load(scope) {
    var values = store.get(scope.getAttribute('data-save'));
    if (!values) return;
    fields(scope).forEach(function (f, i) {
      var v = values[i];
      if (v == null) return;
      if (f.classList.contains('sketch')) { f.pending = v; if (f.load) f.load(v); }
      else if (f.type === 'checkbox') f.checked = !!v;
      else f.value = v;
    });
  }
  function markNav() {
    $$('.side a[data-view]').forEach(function (a) {
      var id = a.getAttribute('data-view');
      var has = scopes().some(function (s) { return s.getAttribute('data-save').indexOf(id) === 0 && store.get(s.getAttribute('data-save')); });
      a.classList.toggle('has', has);
    });
  }
  var timers = {};
  // The classroom viewer has an opaque origin. Exchange only this role's worksheet fields.
  if (parent !== window && window.origin === 'null') {
    var channel = 'aichat.external-tool.v1';
    var request = crypto.randomUUID(), wrapperOrigin = '', records = new Map(), edited = new Set();
    var prefix = 'bumi-npl-h5:v1:' + PAGE + ':';
    function hint(message) { $$('.storage-hint').forEach(function (el) { el.textContent = message; }); }
    window.addEventListener('message', function (event) {
      var message = event.data;
      if (event.source !== parent || message?.channel !== channel || message.type !== 'host:cache') return;
      if (message.requestId === request && !wrapperOrigin && message.ok && Array.isArray(message.value)) {
        wrapperOrigin = event.origin;
        for (var pair of message.value) {
          if (Array.isArray(pair) && !edited.has(pair[0])) records.set(pair[0], pair[1]);
        }
        store.get = function (k) { return records.get(k); };
        store.set = function (k, v) {
          records.set(k, v);
          parent.postMessage({channel:channel, type:'tool:cache:set', key:prefix+k, value:v, requestId:request+'-save'}, wrapperOrigin);
        };
        scopes().forEach(function (scope) {
          if (edited.has(scope.dataset.save)) save(scope); else load(scope);
        });
        markNav();
        hint('学习单和代码草稿保存在当前浏览器的 AIChat 课程库。');
      } else if (event.origin === wrapperOrigin && message.requestId === request+'-save' && !message.ok) {
        hint('本次填写未能保存，请先复制留存。');
      }
    });
    document.addEventListener('input', function (event) {
      var scope = event.target.closest('[data-save]');
      if (!wrapperOrigin && scope) edited.add(scope.dataset.save);
    });
    parent.postMessage({channel:channel, type:'tool:cache:get', key:prefix, requestId:request}, '*');
  }
  document.addEventListener('input', function (e) {
    var scope = e.target.closest && e.target.closest('[data-save]');
    if (!scope) return;
    var key = scope.getAttribute('data-save');
    clearTimeout(timers[key]); timers[key] = setTimeout(function () { save(scope); }, 300);
  });
  document.addEventListener('change', function (e) {
    var scope = e.target.closest && e.target.closest('[data-save]');
    if (scope) save(scope);
  });
  scopes().forEach(load);

  /* ---------- 视图切换 ---------- */
  var views = $$('.view');
  function show() {
    var hash = decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
    var parts = hash.split('-'), id = parts[0], pane = parts[1] || '';
    var view = document.getElementById(id);
    if (!view || !view.classList.contains('view')) {
      var target = document.getElementById(hash);
      view = target && target.closest ? target.closest('.view') : null;
      if (!view) { view = document.getElementById('home'); id = 'home'; }
      else { id = view.id; setTimeout(function () { target.scrollIntoView(); }, 30); }
      pane = '';
    } else window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    views.forEach(function (v) { v.classList.toggle('on', v === view); });
    var panes = $$('.pane', view);
    if (panes.length) {
      var want = pane === 's' ? 's' : 't';
      panes.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-pane') === want); });
      $$('.tabs a', view).forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-pane') === want); });
    }
    $$('.side a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-view') === id); });
    var on = $('.side a.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
    document.title = (view.getAttribute('data-title') || '') + (view.getAttribute('data-title') ? ' · ' : '') + root.getAttribute('data-site');
    root.classList.remove('nav-open');
    $$('.sketch', view).forEach(function (box) {
      if (!box.fit && box.offsetParent !== null) { setupSketch(box); if (box.pending) box.load(box.pending); }
    });
  }
  window.addEventListener('hashchange', show);
  show(); markNav();
  // 初次打开课次深链时，在浏览器完成片段定位后露出完整课头。
  window.addEventListener('load', function () {
    if (/^#l\d{2}(?:-[st])?$/.test(location.hash)) {
      requestAnimationFrame(function () { window.scrollTo({top: 0, left: 0, behavior: 'instant'}); });
    }
  });

  /* ---------- 按钮 ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-act], [data-fig], .fig .zoom, .modal') : null;
    if (!t) return;
    if (t.matches('[data-act="menu"]')) { root.classList.toggle('nav-open'); return; }
    if (t.matches('[data-act="print"]')) { window.print(); return; }
    if (t.matches('[data-act="clear"]')) {
      var scope = t.closest('.view').querySelector('.pane.on[data-save], [data-save]');
      var pane = t.closest('.view').querySelector('.pane.on');
      if (pane && pane.hasAttribute('data-save')) scope = pane;
      if (!scope || !window.confirm('清空这一课在本机填写的全部内容？清空后不能恢复。')) return;
      fields(scope).forEach(function (f) { if (f.classList.contains('sketch')) { if (f.load) f.load(''); f.pending = ''; } else if (f.type === 'checkbox') f.checked = false; else f.value = ''; });
      save(scope); toast('已清空本课填写');
      return;
    }
    if (t.matches('.modal')) { if (e.target === t || e.target.closest('.x')) closeModal(); return; }
    var figure = t.matches('[data-fig]') ? document.getElementById(t.getAttribute('data-fig')) : t.closest('figure.fig');
    if (figure) { e.preventDefault(); openModal(figure); }
  });
  var modal = $('.modal');
  function openModal(figure) {
    var box = $('.box', modal), copy = figure.cloneNode(true);
    copy.removeAttribute('id');
    $$('[id]', copy).forEach(function (n) { n.removeAttribute('id'); });
    $$('.zoom', copy).forEach(function (n) { n.remove(); });
    $$('img[loading]', copy).forEach(function (n) { n.removeAttribute('loading'); });
    box.innerHTML = '<button class="x" type="button" aria-label="关闭">×</button>';
    box.appendChild(copy);
    modal.classList.add('on'); modal.scrollTop = 0;
  }
  function closeModal() { modal.classList.remove('on'); $('.box', modal).innerHTML = ''; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); root.classList.remove('nav-open'); } });
  window.addEventListener('resize', function () { $$('.view.on .sketch').forEach(function (b) { if (b.fit) b.fit(true); }); });
})();
