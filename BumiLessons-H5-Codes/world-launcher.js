/* Course-local world launcher. Standalone pages keep their normal links. */
(function () {
  'use strict';

  if (window.self === window.top) return;

  var worldUrl = 'https://webparacraft.keepwork.com/?pid=5316902';
  var channel = 'aichat.external-tool.v1', wrapperOrigin = '';
  window.addEventListener('message', function (event) {
    if (event.source !== parent || event.data?.channel !== channel) return;
    if (event.data.type === 'host:course-world-ready') wrapperOrigin = event.origin;
    if (event.origin === wrapperOrigin && event.data.type === 'host:course-world-error') {
      if (!dialog) createDialog();
      status.textContent = '世界暂时未能打开，可复制下方网址重试。';
      if (!dialog.open) dialog.showModal();
    }
  });
  parent.postMessage({channel:channel, type:'tool:course-world-ready'}, '*');
  var dialog, frame, address, status, opener;

  function createDialog() {
    var style = document.createElement('style');
    style.textContent = `
      .bumi-world-dialog {
        position: fixed; inset: 0; margin: 0; padding: 0; border: 0;
        width: 100vw; height: 100vh; height: 100dvh;
        max-width: none; max-height: none; color: #1c2937; background: #fff;
        box-sizing: border-box; font: 14px/1.5 system-ui, sans-serif;
      }
      .bumi-world-dialog[open] { display: flex; flex-direction: column; }
      .bumi-world-dialog::backdrop { background: #fff; }
      .bumi-world-toolbar {
        display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
        padding: 10px 12px; border-bottom: 1px solid #dce2e9;
      }
      .bumi-world-title { font-weight: 700; margin-right: auto; }
      .bumi-world-dialog button {
        border: 1px solid #dce2e9; border-radius: 8px; padding: 7px 12px;
        background: #fff; color: #1c2937; cursor: pointer; font: inherit;
      }
      .bumi-world-dialog .bumi-world-return { background: #13828a; color: #fff; }
      .bumi-world-help { margin: 0; padding: 8px 12px; background: #f2f4f7; }
      .bumi-world-address {
        display: block; width: 100%; box-sizing: border-box; margin-top: 4px;
        border: 1px solid #dce2e9; border-radius: 4px; padding: 4px 8px;
        background: #fff; color: #1c2937; font: inherit;
      }
      .bumi-world-frame { width: 100%; flex: 1; min-height: 0; border: 0; }
      @media print { .bumi-world-dialog { display: none !important; } }
    `;
    document.head.appendChild(style);

    dialog = document.createElement('dialog');
    dialog.className = 'bumi-world-dialog';
    dialog.setAttribute('aria-labelledby', 'bumi-world-title');
    dialog.innerHTML = `
      <div class="bumi-world-toolbar">
        <span class="bumi-world-title" id="bumi-world-title">小布米世界</span>
        <button type="button" class="bumi-world-copy">复制世界网址</button>
        <button type="button" class="bumi-world-return" autofocus>返回课程</button>
      </div>
      <div class="bumi-world-help">
        <span role="status" aria-live="polite">首次打开可能需要 1–2 分钟。长时间未显示时，可复制网址到浏览器打开。</span>
        <input class="bumi-world-address" aria-label="世界网址" readonly>
      </div>
    `;
    address = dialog.querySelector('input');
    address.value = worldUrl;
    status = dialog.querySelector('[role="status"]');
    address.addEventListener('click', function () { address.select(); });
    dialog.querySelector('.bumi-world-copy').addEventListener('click', copyAddress);
    dialog.querySelector('.bumi-world-return').addEventListener('click', function () {
      dialog.close();
    });
    dialog.addEventListener('close', function () {
      if (frame) frame.remove();
      frame = null;
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });
    document.body.appendChild(dialog);
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(worldUrl);
      status.textContent = '网址已复制，可粘贴到浏览器地址栏打开。';
    } catch (_) {
      address.focus();
      address.select();
      status.textContent = '请按 Ctrl+C（Mac：⌘C）复制已选中的网址，再粘贴到浏览器地址栏打开。';
    }
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey ||
        event.metaKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link || link.href !== worldUrl || link.hasAttribute('download')) return;
    event.preventDefault();
    opener = link;
    if (wrapperOrigin) {
      parent.postMessage({channel:channel, type:'tool:open-course-world', pid:'5316902'}, wrapperOrigin);
      return;
    }
    if (!dialog) createDialog();
    if (dialog.open) return;
    if (window.origin === 'null') {
      status.textContent = '当前预览无法运行仿真，请复制世界网址到浏览器地址栏打开。';
      dialog.showModal();
      return;
    }
    status.textContent = '首次打开可能需要 1–2 分钟。长时间未显示时，可复制网址到浏览器打开。';
    frame = document.createElement('iframe');
    frame.className = 'bumi-world-frame';
    frame.title = '小布米世界虚拟仿真';
    frame.src = worldUrl;
    frame.allow = 'autoplay; fullscreen';
    dialog.appendChild(frame);
    dialog.showModal();
  });
})();
