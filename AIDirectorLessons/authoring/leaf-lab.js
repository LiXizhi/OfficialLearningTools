// A paper-card classifier. Training saves the observed feature-to-label pairs.
(() => {
    const lab = document.querySelector('[data-leaf-lab]');
    const data = [
        ['G1','心形、整缘','绿萝'], ['G2','心形、整缘','绿萝'], ['G3','卵形、整缘','绿萝'],
        ['M1','卵形、锯齿','薄荷'], ['M2','卵形、锯齿','薄荷'], ['M3','长形、锯齿','薄荷']
    ];
    const test = [['T1','心形、整缘'], ['T2','卵形、整缘'], ['T3','长形、整缘']];
    const get = name => lab.querySelector('[data-'+name+']');
    let includePothos = true;
    let model;
    let version = 0;
    function drawBag() {
        get('bag').textContent = data.filter(row=>includePothos || row[2]!=='绿萝').map(row=>row.join(' · ')).join('\n');
        get('toggle').textContent = includePothos ? '拿走绿萝训练卡' : '放回绿萝训练卡';
    }
    get('toggle').onclick = () => {
        includePothos = !includePothos;
        drawBag();
        get('notice').textContent = model ? '训练袋已改变。先用手中的旧模型再测一次，然后重新训练。' : '训练袋已改变。你预测它能学到哪些组合？';
    };
    get('train').onclick = () => {
        model = new Map();
        for (const [,features,label] of data) if (includePothos || label!=='绿萝') model.set(features,label);
        version++;
        get('model').textContent = '第 '+version+' 版模型\n'+[...model].map(([features,label])=>features+' → '+label).join('\n');
        get('test').disabled = false;
        get('notice').textContent = '模型已经学好。先预测，再用下面三张新卡测试。';
    };
    get('test').onclick = () => {
        const guesses = test.map(([,features])=>model.get(features) || '还没学过');
        const row = document.createElement('li');
        row.textContent = '第 '+version+' 版模型 · 当前训练袋'+(includePothos?'有':'没有')+'绿萝卡：'+test.map(([id],i)=>id+' 判为'+guesses[i]).join('，')+'。对照答案，认出 '+guesses.filter(g=>g==='绿萝').length+' / 3 张绿萝。';
        get('trials').append(row);
        get('notice').textContent = '本次结果已记下。指出哪一步改变了模型，并用两次结果说明。';
    };
    const cards = document.querySelector('[data-leaf-cards]');
    const fields = [...cards.querySelectorAll('[data-leaf-card]')];
    const key = 'director-leaf-cards/'+(lab.closest('[data-teaching-desk]')?'teacher':'student');
    let backs={};
    try { backs=JSON.parse(localStorage.getItem(key)) || {}; } catch {}
    for (const field of fields) {
        field.value=backs[field.dataset.leafCard] || '';
        field.oninput=()=>{
            backs[field.dataset.leafCard]=field.value;
            try {localStorage.setItem(key,JSON.stringify(backs));} catch {}
        };
    }
    cards.querySelector('button').onclick=()=>{
        const notice=cards.querySelector('[role=status]');
        const blank=fields.find(f=>!f.value.trim());
        if(blank){notice.textContent='请先给每张卡写一个本课例子。';blank.focus();return;}
        const esc=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
        const front=fields.map(f=>'<details><summary>'+f.dataset.leafCard+'</summary><p>'+esc(f.value)+'</p></details>').join('');
        const trials=[...get('trials').children].map(li=>'<li>'+esc(li.textContent)+'</li>').join('');
        const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>我的识叶关系卡</title><style>body{max-width:42rem;margin:auto;padding:1rem;font:18px/1.7 system-ui;color:#153e38}details{border:1px solid #86a99d;border-radius:8px;padding:1rem;margin:.5rem 0}summary{cursor:pointer}</style><h1>我的识叶关系卡</h1><p>先说出自己的例子，再点卡名翻面。</p>'+front+(trials?'<h2>我的实验记录</h2><ol>'+trials+'</ol>':'')+'</html>';
        download('识叶关系卡.html',html,'text/html;charset=utf-8');
        notice.textContent='已下载。请同伴打开文件，先猜再翻。';
    };
    drawBag();
})();
