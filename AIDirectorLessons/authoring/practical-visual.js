// The graphic is redrawn from the result of the same run, also in a downloaded edition.
function drawLessonVisual(host,id,input,text){
    host.replaceChildren();
    const doc=host.ownerDocument, node=(tag,str)=>{const n=doc.createElement(tag);n.textContent=str;return n;};
    const lines=text.split('\n');
    if(id==='g6-03'){
        const points=[...lines[0].matchAll(/\((\d+),(\d+)\)/g)].map(m=>m[1]+','+m[2]);
        if(!points.length)return;
        const board=node('table','');board.append(node('caption','路线沙盘 · 数字为经过的步数，0 是起点'));
        for(let y=5;y>=1;y--){const row=board.insertRow();for(let x=1;x<=7;x++){
            const cell=row.insertCell(),coord=x+','+y,steps=points.flatMap((p,i)=>p===coord?[i]:[]);
            const blocked=input.closed==='施工' && coord===String(input.site).replace(/\s/g,'').replace('，',',');
            cell.textContent=blocked?'施工':steps.length?steps.join('/'):'·';cell.title='('+coord+')';
            cell.style.cssText='min-width:1.8em;text-align:center;border:1px solid #aec4bd;background:'+(blocked?'#f8d3aa':steps.length?'#b8e2ce':'#fff');
        }}host.append(board);
    }else if(id==='g4-02'){
        const bars=lines.map(s=>s.match(/^\d+．(.+?) ([\d.]+)厘米/)).filter(Boolean);
        if(!bars.length)return;
        const max=Math.max(1,...bars.map(m=>Number(m[2])));host.append(node('strong','把文具放在同一把尺上'));
        for(const m of bars){const line=node('div',m[1]+' · '+m[2]+' 厘米　'),meter=doc.createElement('meter');
            meter.max=max;meter.value=+m[2];meter.style.width='50%';meter.setAttribute('aria-label',m[1]);line.append(meter);host.append(line);}
    }else if(id==='g3-05'||id==='g5-06'){
        const frames=id==='g3-05'?text.split('\n\n').filter(s=>/^镜头 \d/.test(s)):lines.filter(s=>/^镜\d/.test(s));
        for(const frame of frames){const card=node('article',frame.replaceAll('｜','\n'));card.style.cssText='display:inline-block;vertical-align:top;white-space:pre-line;margin:4px;padding:.6em;max-width:15em;background:#fff8db;border:1px solid #c4b47a';host.append(card);}
    }
}
