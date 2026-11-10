(() => {
    const byId = id => document.getElementById(id);
    const status = message => { byId('status').textContent = message; };
    const fields = [...document.querySelectorAll('.lesson-archive input, .lesson-archive textarea, #studio input, #studio textarea')];
    const key = 'bumi-workshop.v1.' + location.pathname;
    let versions = [];
    let run = Math.random().toString(36).slice(2);
    let opened = {};
    const windows = {};

    function save() {
        const draft = {versions, run, opened, answers:fields.map(field => field.type === 'checkbox' ? field.checked : field.value)};
        try { localStorage.setItem(key, JSON.stringify(draft)); return; } catch {}
        try { history.replaceState({...history.state, bumiDraft:draft}, ''); }
        catch { status('本窗口限制保存，请在离开前导出记录。'); }
    }
    function restore() {
        let draft;
        try { draft = JSON.parse(localStorage.getItem(key)); } catch {}
        draft ||= history.state?.bumiDraft;
        if (!Array.isArray(draft?.answers)) return;
        run = draft.run || run;
        opened = draft.opened || {};
        fields.forEach((field, index) => {
            const answer = draft.answers[index];
            if (field.type === 'checkbox') field.checked = answer === true;
            else if (typeof answer === 'string') field.value = answer;
        });
        versions = Array.isArray(draft.versions) ? draft.versions.slice(0,2) : [];
    }
    function exhibit(card, index) {
        const box = document.createElement('section');
        box.className = 'exhibit';
        const title = document.createElement('h3');
        title.textContent = '第' + (index + 1) + '版 · ' + card.question;
        const action = document.createElement('p');
        action.textContent = card.action;
        const hint = document.createElement('details');
        const reveal = document.createElement('summary');
        reveal.textContent = '试过以后，展开核对证据';
        hint.append(reveal, document.createTextNode(card.evidence));
        box.append(title, action, hint);
        return box;
    }
    function draw() {
        versions.forEach((card, index) => byId('preview' + (index+1)).replaceChildren(exhibit(card, index)));
        byId('first').disabled = Boolean(versions[0]);
    }
    function download(text, filename, type) {
        const url = URL.createObjectURL(new Blob([text], {type}));
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
    const value = id => byId(id).value.trim();
    restore();
    draw();
    function request(mode) {
        const start = {ask:'请先问我一个能用实验回答的问题。', plan:'给我两个只改变一个条件的比较方案，让我选择。', iterate:'依据同伴的原话，只建议一处可以复测的改动。'};
        byId('request').value = [value('question'), start[mode], '我的操作：' + (value('action') || '待设计'),
            '实际证据：' + (value('evidence') || '尚未观察'), '同伴反馈：' + (value('feedback') || '尚未试玩'),
            '请把建议与已有观察分开。'].join('\n');
    }
    if (!value('request')) request('ask');
    document.querySelectorAll('[data-mode]').forEach(button => {
        button.onclick = () => { request(button.dataset.mode); save(); };
    });
    byId('copy').onclick = async () => {
        try { await navigator.clipboard.writeText(value('request')); status('委托已复制，请在会话中粘贴。'); }
        catch { byId('request').focus(); byId('request').select(); status('请复制选中的委托，切到工作台粘贴。'); }
    };
    function openChat(kind) {
        const space = 'Bumi-' + run + '-' + kind;
        const local = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
        const url = new URL(local ? '../../../../AIChat.html' : 'https://keepwork.com/chat', location.href);
        url.searchParams.set('workspace', space);
        url.searchParams.set('chat', opened[kind] ? 'workspace' : 'new');
        if (windows[kind] && !windows[kind].closed) windows[kind].focus();
        else windows[kind] = window.open(url.href, space);
        if (!windows[kind]) return status('请允许打开新窗口后重试。');
        opened[kind] = true; save();
        status('回课件复制需要的委托，在工作台粘贴并发送。');
    }
    byId('chat').onclick = () => openChat('make');
    if (byId('lecture')) byId('lecture').onclick = () => openChat('class');
    document.addEventListener('input', save);
    byId('first').onclick = () => {
        if (!value('question') || !value('action') || !value('evidence')) return status('请先写下问题、一个操作和实际观察到的证据。');
        versions = [{question:value('question'), action:value('action'), evidence:value('evidence')}];
        draw(); save(); status('第一版已留存。请同伴独立试一次。');
        document.dispatchEvent(new Event('bumi-first-version'));
    };
    byId('second').onclick = () => {
        if (!versions[0] || !value('feedback') || !value('revision')) return status('请先制作第一版，再填写同伴原话和改进后的提示。');
        versions[1] = {...versions[0], action:value('revision')};
        draw(); save(); status('请同伴试第二版，在下方记录复测结果。');
    };
    byId('export').onclick = () => {
        const body = document.createElement('main');
        const title = document.createElement('h1');
        title.textContent = document.title;
        body.append(title);
        const world = document.createElement('a');
        world.href = 'https://emscripten.keepwork.com/?pid=5316902';
        world.target = '_blank';
        world.rel = 'noopener noreferrer';
        world.textContent = '打开小布米仿真世界';
        body.append(world);
        versions.forEach((card,index) => body.append(exhibit(card,index)));
        const room = document.querySelector('#classroom').cloneNode(true);
        room.querySelector('.phase-strip').remove();
        room.querySelector('.world-link').remove();
        room.querySelector('#lesson-stage').replaceChildren();
        room.querySelector('#trial-record').replaceChildren();
        room.querySelector('#lesson-heading').textContent = '';
        room.querySelector('#to-studio').textContent = '回到展题，核对证据';
        body.append(room);
        const record = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = '制作记录与实验学习单';
        record.append(summary);
        const sheet = document.querySelector('main').cloneNode(true);
        sheet.querySelector('header').remove();
        sheet.querySelector('#classroom').remove();
        // Only include frames with the group's own answers in the portable exhibit.
        const filmRecord = document.createElement('section');
        const filmTitle = document.createElement('h2');
        filmTitle.textContent = '逐幕课堂记录';
        filmRecord.append(filmTitle);
        for (const scene of document.querySelectorAll('.film-page')) {
            const answers = [...scene.querySelectorAll('.film-content input')].flatMap(field => {
                const choice = field.type === 'checkbox';
                if (choice ? !field.checked : !field.value.trim()) return [];
                const label = field.getAttribute('aria-label') || '观察记录';
                return [choice ? label : label + ' ' + field.value];
            });
            if (!answers.length) continue;
            const heading = document.createElement('h3');
            heading.textContent = scene.dataset.title;
            const text = document.createElement('p');
            text.textContent = answers.join('；');
            filmRecord.append(heading, text);
        }
        if (filmRecord.children.length > 1) record.append(filmRecord);
        sheet.querySelector('#lesson-film').remove();
        sheet.querySelectorAll('#studio, #make-panel, #peer-panel').forEach(el => el.hidden = false);
        sheet.querySelectorAll('img, script, button, nav, a, #status, #preview1, #preview2').forEach(el => el.remove());
        sheet.querySelectorAll('input,textarea').forEach((node,index) => {
            const field = fields[index];
            node.replaceWith(field.type === 'checkbox' ? (field.checked ? '☑' : '□') : field.value || '（未填写）');
        });
        record.append(sheet);
        body.append(record);
        const experiment = document.createElement('script');
        const mission = bumiMissions[Number(room.dataset.lesson)-1];
        experiment.textContent = '(' + startBumiClassroom.toString() + ')(document.querySelector("#classroom"),' +
            JSON.stringify(mission).replaceAll('<','\\u003c') + ',true);';
        body.append(experiment);
        const style = byId('portable-style').textContent;
        download('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>小布米展台挑战</title><style>'+style+'</style>'+body.outerHTML+'</html>',document.title+'.html','text/html;charset=utf-8');
        status('已导出。可在独立窗口打开，交给下一组试玩。');
    };
})();
