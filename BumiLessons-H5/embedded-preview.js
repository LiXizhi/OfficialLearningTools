/* AIChat preview adaptations owned by this course, without host changes. */
(function () {
  'use strict';

  var pageUrl = new URL(document.baseURI);
  var packaged = pageUrl.hostname === 'aichat-workspace.invalid';
  var inPreview = window.self !== window.top && (packaged ||
    pageUrl.pathname.includes('/__aichat_preview__/') ||
    document.documentElement.hasAttribute('data-bumi-preview'));
  if (!inPreview) return;

  var style = document.createElement('style');
  style.textContent = `
    [data-act="print"] { display: none !important; }
    .bumi-student-dialog {
      position: fixed; inset: 0; margin: 0; padding: 0; border: 0;
      width: 100vw; height: 100vh; height: 100dvh;
      max-width: none; max-height: none; background: #f2f4f7; color: #1c2937;
      box-sizing: border-box; font: 14px/1.5 system-ui, sans-serif;
    }
    .bumi-student-dialog[open] { display: flex; flex-direction: column; }
    .bumi-student-toolbar {
      display: flex; align-items: center; gap: 12px; padding: 10px 12px;
      background: #fff; border-bottom: 1px solid #dce2e9;
    }
    .bumi-student-title { font-weight: 700; margin-right: auto; }
    .bumi-student-dialog button {
      border: 1px solid #dce2e9; border-radius: 8px; padding: 7px 12px;
      background: #fff; color: #1c2937; cursor: pointer; font: inherit;
    }
    .bumi-student-dialog .bumi-student-return { background: #365b97; color: #fff; }
    .bumi-student-state { padding: 12px; }
    .bumi-student-frame { width: 100%; flex: 1; min-height: 0; border: 0; }
  `;
  document.head.appendChild(style);

  // Packaged previews have a virtual base; keep lesson links in this document.
  document.addEventListener('click', function (event) {
    if (!plainClick(event)) return;
    var link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link) return;
    event.preventDefault();
    window.location.hash = link.getAttribute('href');
  });

  if (document.documentElement.getAttribute('data-page') !== 'teacher') return;

  var dialog, frame, status, retry, opener, sequence = 0;
  var studentUrl = new URL('student.html', pageUrl);

  function plainClick(event) {
    return !event.defaultPrevented && event.button === 0 && !event.ctrlKey &&
      !event.metaKey && !event.shiftKey && !event.altKey;
  }

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'bumi-student-dialog';
    dialog.setAttribute('aria-labelledby', 'bumi-student-title');
    dialog.innerHTML = `
      <div class="bumi-student-toolbar">
        <span class="bumi-student-title" id="bumi-student-title">学生页面</span>
        <button type="button" class="bumi-student-return" autofocus>返回教师页面</button>
      </div>
      <div class="bumi-student-state">
        <span role="status" aria-live="polite"></span>
        <button type="button" class="bumi-student-retry" hidden>重试</button>
      </div>
    `;
    status = dialog.querySelector('[role="status"]');
    retry = dialog.querySelector('.bumi-student-retry');
    retry.addEventListener('click', loadStudent);
    dialog.querySelector('.bumi-student-return').addEventListener('click', function () {
      dialog.close();
    });
    dialog.addEventListener('close', function () {
      sequence += 1;
      // Keep the student page mounted so its worksheet and position survive return.
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });
    document.body.appendChild(dialog);
  }

  async function packagedStudentHtml() {
    var response = await fetch(studentUrl.href);
    if (!response.ok) throw new Error('Student page unavailable');
    var doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    if (doc.documentElement.getAttribute('data-page') !== 'student') {
      throw new Error('Invalid student page');
    }
    var assets = new Map();
    // This course uses inline CSS and classic scripts; only these assets are external.
    await Promise.all(Array.from(doc.querySelectorAll('img[src],script[src]')).map(async function (node) {
      var url = new URL(node.getAttribute('src'), studentUrl);
      if (url.origin !== studentUrl.origin) return;
      if (!assets.has(url.href)) assets.set(url.href, (async function () {
        var resource = await fetch(url.href);
        if (!resource.ok) throw new Error('Student asset unavailable');
        var blob = await resource.blob();
        if (url.pathname.endsWith('.js')) blob = new Blob([blob], { type: 'text/javascript' });
        return new Promise(function (resolve, reject) {
          var reader = new FileReader();
          reader.onload = function () { resolve(reader.result); };
          reader.onerror = function () { reject(reader.error); };
          reader.readAsDataURL(blob);
        });
      })());
      node.setAttribute('src', await assets.get(url.href));
    }));
    var base = doc.querySelector('base') || doc.createElement('base');
    base.href = 'about:srcdoc';
    doc.head.prepend(base);
    doc.documentElement.setAttribute('data-bumi-preview', '');
    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  }

  async function loadStudent() {
    var current = ++sequence;
    status.parentElement.hidden = false;
    status.textContent = '正在打开学生页面…';
    retry.hidden = true;
    try {
      var html = packaged ? await packagedStudentHtml() : null;
      if (current !== sequence || !dialog.open) return;
      frame = document.createElement('iframe');
      frame.className = 'bumi-student-frame';
      frame.title = '学生课程页面';
      frame.addEventListener('load', function () { status.parentElement.hidden = true; }, { once: true });
      if (packaged) frame.srcdoc = html;
      else frame.src = studentUrl.href;
      dialog.appendChild(frame);
    } catch (_) {
      if (current !== sequence || !dialog.open) return;
      status.textContent = '学生页面暂时未能打开，请重试。';
      retry.hidden = false;
    }
  }

  document.querySelectorAll('a[href="student.html"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (!plainClick(event)) return;
      event.preventDefault();
      opener = link;
      if (!dialog) createDialog();
      if (dialog.open) return;
      dialog.showModal();
      if (!frame) void loadStudent();
    });
  });
})();
