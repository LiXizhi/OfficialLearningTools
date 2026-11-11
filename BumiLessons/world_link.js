(() => {
    if (parent === window) return;
    const channel = 'aichat.external-tool.v1';
    let admitted = false;
    window.addEventListener('message', event => {
        if (event.source !== parent || event.data?.channel !== channel) return;
        if (event.data.type === 'host:course-world-ready') admitted = true;
        if (event.data.type === 'host:course-world-error') {
            window.document.querySelector('[data-world-error]')?.remove();
            const message = document.createElement('p');
            message.dataset.worldError = '';
            message.setAttribute('role', 'alert');
            message.textContent = event.data.error || '未能打开仿真世界，请重试。';
            document.querySelector('[data-world-link]')?.after(message);
        }
    });
    parent.postMessage({channel, type:'tool:course-world-ready'}, '*');
    document.addEventListener('click', event => {
        const link = event.target.closest?.('a[data-world-link]');
        if (!link || !admitted) return;
        event.preventDefault();
        document.querySelector('[data-world-error]')?.remove();
        parent.postMessage({channel, type:'tool:open-course-world', pid:link.dataset.worldLink}, '*');
    });
})();
