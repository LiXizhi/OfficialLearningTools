/** Render the source course artwork. Run with the Bumi source assets directory and
 * a Playwright installation (the existing AIChat browser test runtime is the default).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const [source, modulePath]=process.argv.slice(2);
if (!source) throw Error('Pass the upstream bumi-edu-docs-v2/assets directory');
const {chromium}=createRequire(modulePath || path.resolve(root,'../../../.test-runtime/node/package.json'))('playwright');
const browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL || 'msedge'});
const mime={'.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
async function uri(file){
    return 'data:'+mime[path.extname(file)]+';base64,'+(await fs.readFile(file)).toString('base64');
}
try {
    const page=await browser.newPage();
    const atlas=await uri(path.join(root,'assets/lesson-scenes.webp'));
    const files=(await fs.readdir(source,{recursive:true})).filter(f=>/\.(svg|png)$/i.test(f));
    for(const relative of files){
        const svg=relative.endsWith('.svg');
        const file=path.join(source,relative);
        const args={svg,source:svg?await fs.readFile(file,'utf8'):await uri(file),atlas,
            lesson:Number(/lesson-(\d+)/.exec(relative)?.[1] || 1)};
        const encoded=await page.evaluate(async ({svg,source,atlas,lesson})=>{
            const load=async src=>{const image=new Image();image.src=src;await image.decode();return image;};
            let title='',cut=0;
            if(svg){
                const doc=new DOMParser().parseFromString(source,'image/svg+xml');
                const heading=doc.querySelector('text');
                title=heading.textContent.replace(/^\d+[｜|]/,'');
                cut=Number(heading.getAttribute('y'))+6;
                // Preserve geometry, labels, data series and marker identities from the authored plate.
                for(const rect of doc.querySelectorAll('rect')){
                    const color=rect.getAttribute('fill')?.toUpperCase();
                    if(['#F5FAFC','#EDF5F7','#F6FAFC','#EDF5F8'].includes(color))rect.setAttribute('fill','#F5F7EE');
                }
                source='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(doc));
            }
            const art=await load(source);
            const canvas=document.createElement('canvas');
            const extra=svg?Math.round(art.height*.16):0;
            canvas.width=art.width;canvas.height=art.height+extra;
            const g=canvas.getContext('2d');
            g.drawImage(art,0,extra);
            if(svg){
                const w=art.width,h=cut+extra;
                const colors=[['#124745','#28675B'],['#173F54','#28655F'],['#3D3754','#73546A'],['#194457','#24667B']];
                const [a,b]=colors[Math.floor((lesson-1)/4)];
                const fill=g.createLinearGradient(0,0,w,h);fill.addColorStop(0,a);fill.addColorStop(1,b);
                g.fillStyle=fill;g.fillRect(0,0,w,h);
                const scene=await load(atlas),slot=(lesson-1),cell=scene.width/4;
                const sw=Math.min(w*.32,h*1.72),left=w-sw;
                g.save();g.beginPath();g.moveTo(left+h*.16,0);g.lineTo(w,0);g.lineTo(w,h);g.lineTo(left,h);g.closePath();g.clip();
                const sh=cell*h/sw;
                g.drawImage(scene,slot%4*cell,Math.floor(slot/4)*cell+(cell-sh)/2,cell,sh,left,0,sw,h);g.restore();
                const margin=w*.038;
                g.fillStyle='#DDEF9D';g.font='bold '+Math.round(w*.017)+'px "Microsoft YaHei",sans-serif';
                g.fillText('第 '+String(lesson).padStart(2,'0')+' 课   /   小布米具身智能',margin,h*.28);
                let font=Math.round(w*.037);
                const maxWidth=left-margin*1.4;
                do {g.font='bold '+font+'px "Microsoft YaHei",sans-serif';if(g.measureText(title).width<=maxWidth)break;font--;}while(font>22);
                g.fillStyle='#FFFDF1';g.fillText(title,margin,h*.67,maxWidth);
                g.fillStyle='#E1B967';g.fillRect(margin,h*.81,w*.075,4);
                g.font='bold 15px "Microsoft YaHei",sans-serif';g.textAlign='right';
                g.fillStyle='#153F3D';g.fillRect(w-126,h-27,126,27);g.fillStyle='white';g.fillText('AI 情境插画',w-13,h-8);
            }
            // Keep text plates at native resolution; prefer quality changes over a smaller drawing.
            for(const quality of [.94,.90,.86,.82,.77,.72,.66,.60,.54,.48]){
                const url=canvas.toDataURL('image/webp',quality);
                const data=url.split(',')[1];if(data.length*3/4<=200000)return data;
            }
            throw Error('Cannot reach 200,000 bytes at the original dimensions');
        },args);
        const dest=path.join(root,'assets',relative.replace(/\.[^.]+$/,'.webp'));
        await fs.mkdir(path.dirname(dest),{recursive:true});
        await fs.writeFile(dest,Buffer.from(encoded,'base64'));
    }
} finally {await browser.close();}
