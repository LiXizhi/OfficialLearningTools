// Small, deterministic models for lessons where students can check a numerical prediction.
const lab = get('[data-experiment]');
if (lab) {
    const controls = lab.querySelector('[data-controls]');
    const result = lab.querySelector('output');
    function select(name, options) {
        const label = document.createElement('label');
        label.textContent = name;
        const input = document.createElement('select');
        for (const value of options) input.add(new Option(value,value));
        label.append(input); controls.append(label); return input;
    }
    let calculate;
    if (root.dataset.lesson === 'g4-08') {
        const rules = select('分拣员用哪条口令？',['V1 · 白色猜纸','V2 · 纤维纹猜纸']);
        const cards = ['白纤纸','白纤纸','蓝纤纸','棕纤纸','白滑纸','蓝滑塑','蓝滑塑','白滑塑','棕滑塑','蓝纤塑'];
        calculate = () => {
            const rows = cards.map(([color,surface,actual],i) => {
                const paper = rules.selectedIndex === 0 ? color === '白' : surface === '纤';
                const guess = paper ? '纸' : '塑';
                return {match:guess === actual,text:(i+1)+' 号　'+color+'色 · '+(surface === '纤' ? '纤维纹':'光滑')+'　预测 '+guess+' / 实际 '+actual};
            });
            return ['命中 '+rows.filter(r=>r.match).length+' / 10',...rows.map(r=>(r.match?'✓ ':'× ')+r.text)].join('\n');
        };
    }
    if (root.dataset.lesson === 'g6-04') {
        const route = select('固定哪条路线？',['蓝路线 · 8格2角','绿路线 · 10格1角']);
        const pause = select('每个弯停几秒？',['0','1','2','3']);
        calculate = () => {
            const [length, corners] = route.selectedIndex === 0 ? [8,2] : [10,1];
            return '纸面模型预测：'+length+' 格 × 1 秒/格 + '+corners+' 个角 × '+pause.value+' 秒/角 = '+(length + corners*Number(pause.value))+' 秒。把实测值写在记录中。';
        };
    }
    if (root.dataset.lesson === 'g8-03') {
        const version = select('词频模型',['第一版 · 原六条训练句','第二版 · 加入 L4']);
        const label = document.createElement('label'); label.textContent = '输入问句，词之间用空格分开';
        const query = document.createElement('input'); query.value = '哪里 排练'; label.append(query); controls.append(label);
        const samples = [['几时 开门','几时 排练','几点 集合'],['哪里 排练','哪里 集合','何处 开门']];
        calculate = () => {
            const tokens = query.value.trim().split(/\s+/).filter(Boolean);
            if (!tokens.length) return '请先输入至少一个词。';
            const location = version.selectedIndex ? [...samples[1],'哪儿 看展'] : samples[1];
            const words = [samples[0],location].map(s=>s.join(' ').split(' '));
            const sums = [0,0];
            const rows = tokens.map(t=>{
                const counts = words.map(list=>list.filter(w=>w===t).length);
                counts.forEach((count,i)=>{ sums[i]+=count; });
                return t+'　时间 +'+counts[0]+' / 地点 +'+counts[1];
            });
            return [...rows,'总分 '+sums.join(' / ')+'　→ '+(sums[0]===sums[1]?'待人工确认':sums[0]>sums[1]?'时间':'地点')].join('\n');
        };
    }
    lab.querySelector('button').onclick = () => {result.textContent = calculate();};
    controls.oninput = () => {result.textContent='';};
}
