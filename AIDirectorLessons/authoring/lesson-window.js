// Inlined in each standalone lesson; the catalog deliberately does not pin itself.
(() => {
    const button = document.getElementById('lesson-fullscreen');
    let presenting = false;
    function showPresentation(active) {
        presenting = active;
        button.textContent = active ? '退出全屏' : '全屏';
        button.setAttribute('aria-pressed', String(active));
    }
    if (parent === window) return;
    document.querySelector('[data-chat-link]')?.replaceWith('在底部主对话继续练习');
    document.querySelectorAll('#btn-open-aichat-prompt,.open-ai-with-target,.open-ai-textarea-btn').forEach(el => {
        el.remove();
    });
    // Include folded materials and live worksheet values without reading markup,
    // image data, file names or the contents of embedded student projects.
    function readLesson(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        if (node.matches('style,script,iframe,canvas,template,[data-exam-private]')) return '';
        if (node.matches('img')) return node.alt;
        if (node.matches('svg')) return node.getAttribute('aria-label') || node.textContent;
        if (node.matches('input[type=password],input[type=file],input[type=hidden]')) return '';
        if (node.matches('input[type=checkbox],input[type=radio]')) return node.checked ? '☑' : '☐';
        if (node.matches('input,textarea,select')) return node.value + '\n';
        const selected = node.matches('[aria-pressed=true],[aria-current=step]') ? '（已选）' : '';
        const newline = node.matches('p,li,div,section,summary,button,label,h1,h2,h3,pre,br,td') ? '\n' : '';
        return Array.from(node.childNodes, readLesson).join('') + selected + newline;
    }
    const channel = 'aichat.external-tool.v1';
    let pinned = false, wrapperOrigin;
    button.onclick = () => {
        if (button.hidden || !wrapperOrigin) return;
        showPresentation(!presenting);
        parent.postMessage({channel, type:'tool:presentation', active:presenting}, wrapperOrigin);
    };
    window.addEventListener('message', ({source, origin, data}) => {
        if (source !== parent || data?.channel !== channel ||
            !(origin === location.origin || ['https://keepwork.com','https://cdn.keepwork.com'].includes(origin))) return;
        const reply = (type, fields) => parent.postMessage({channel, type, ...fields}, origin);
        if (data.type === 'host:presentation-support') {
            wrapperOrigin = origin;
            button.hidden = data.supported !== true;
            if (button.hidden) showPresentation(false);
        } else if (data.type === 'host:presentation-ended') {
            showPresentation(false);
        } else if (data.type === 'host:always-on-top-support') {
            wrapperOrigin = origin;
            pinned = data.supported === true;
            if (pinned) reply('tool:always-on-top', {enabled:true});
        } else if (pinned && data.type === 'host:get-tool-context') {
            const lesson = readLesson(document.querySelector('main')).replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n').trim();
            reply('tool:tool-context', {requestId:data.requestId, context:[
                `当前课件是《${document.title}》。以下是用户围绕这门课的对话。`,
                window.weatherLessonContext?.(), window.directorTeachingContext?.(), window.directorStudioContext?.(), lesson
            ].filter(Boolean).join('\n')});
        }
    });
    parent.postMessage({channel, type:'tool:ready', capabilities:['tool-context']}, '*');
    window.addEventListener('pagehide', () => {
        if (presenting) parent.postMessage({channel, type:'tool:presentation', active:false}, wrapperOrigin);
        if (pinned) parent.postMessage({channel, type:'tool:always-on-top', enabled:false}, wrapperOrigin);
    });
})();
