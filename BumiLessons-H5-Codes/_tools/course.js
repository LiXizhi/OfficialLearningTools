(function () {
  'use strict';
  function announce(text) {
    var el = document.querySelector('.toast');
    el.textContent = text;
    el.classList.add('on');
    window.setTimeout(function () { el.classList.remove('on'); }, 2400);
  }
  document.addEventListener('click', async function (event) {
    var button = event.target.closest('[data-copy-code]');
    if (!button) return;
    var code = button.closest('.code-card').querySelector('pre code');
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('manual copy');
      await navigator.clipboard.writeText(code.textContent);
      announce('代码已复制，请粘贴到小布米世界的代码输入框。');
    } catch (_) {
      var range = document.createRange();
      range.selectNodeContents(code);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      announce('代码已选中，请按 Ctrl+C（Mac：⌘C）复制。');
    }
  });
  // 保存不可用时明确提示；表单仍可填写和打印。
  try {
    var key = 'bumi-npl-h5:storage-check';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
  } catch (_) {
    document.querySelectorAll('.storage-hint').forEach(function (el) {
      el.textContent = '当前浏览器不允许本机保存，请保留页面或打印记录。';
    });
  }
  var printFields = [];
  window.addEventListener('beforeprint', function () {
    printFields = [];
    document.querySelectorAll('.view.on textarea.cell').forEach(function (field) {
      if (field.offsetParent === null) return;
      printFields.push([field, field.style.height]);
      field.style.height = 'auto';
      field.style.height = Math.max(field.scrollHeight + 4, 48) + 'px';
    });
  });
  window.addEventListener('afterprint', function () {
    printFields.forEach(function (entry) { entry[0].style.height = entry[1]; });
    printFields = [];
  });
})();
