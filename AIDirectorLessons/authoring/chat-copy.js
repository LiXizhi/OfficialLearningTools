// Shared by the standalone teacher and student worksheets.
const copyLessonChatText = (() => {
    const toast = document.createElement('div');
    toast.className = 'lesson-chat-toast';
    toast.hidden = true;
    const status = document.createElement('span');
    status.setAttribute('role', 'status');
    const manual = document.createElement('textarea');
    manual.readOnly = true;
    manual.setAttribute('aria-label', '手动复制给 AI 的文字');
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '关闭';
    close.onclick = () => { toast.hidden = true; };
    toast.append(status, manual, close);
    document.body.append(toast);
    let timer;
    return async function copyLessonChatText(value) {
        clearTimeout(timer);
        toast.hidden = false;
        manual.hidden = close.hidden = true;
        if (!value.trim()) {
            status.textContent = '先写下想和 AI 说的话。';
            timer = setTimeout(() => { toast.hidden = true; }, 3500);
            return false;
        }
        let copied = false;
        try {
            await navigator.clipboard.writeText(value);
            copied = true;
        } catch {
            const previous = document.activeElement;
            manual.value = value;
            manual.hidden = false;
            manual.focus();
            manual.select();
            try { copied = document.execCommand('copy'); } catch {}
            if (copied) previous?.focus({preventScroll:true});
        }
        manual.hidden = close.hidden = copied;
        status.textContent = copied ? '复制完毕了，可以去聊天框粘贴了。' : '请长按或按 Ctrl/Cmd+C 复制选中的文字，再到聊天框粘贴。';
        if (copied) timer = setTimeout(() => { toast.hidden = true; }, 3500);
        return copied;
    };
})();
