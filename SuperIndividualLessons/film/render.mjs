// Offline art tool. Inputs are paths to three.min.js (r160) and a Playwright package.
// ffmpeg must be on PATH. The course itself plays the resulting local H.264 files.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {resolve,join,dirname} from 'node:path';
import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {finished} from 'node:stream/promises';

const [three,playwright,output,mode]=process.argv.slice(2);
if (!three || !playwright || !output) throw Error('Pass Three.js r160, Playwright package.json, and an output directory.');
const {chromium}=createRequire(resolve(playwright))('playwright');
const browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL || undefined,headless:true});
const here=dirname(fileURLToPath(import.meta.url));
const fps=15,seconds=6,perShot=fps*seconds;
const dest=resolve(output);
await mkdir(dest,{recursive:true});
const audioDir=await mkdtemp(join(tmpdir(),'exhibit-voice-'));
try {
  const page=await browser.newPage();
  await page.setContent('<canvas width="896" height="504"></canvas>');
  for(const path of [resolve(three),join(here,'studio.js'),join(here,'direction.js'),join(here,'..','foundation.js')])
    await page.addScriptTag({path});
  await page.evaluate(()=>{
    window.set=buildExhibit(THREE,document.querySelector('canvas'));
    window.film=document.createElement('canvas'); film.width=896; film.height=600;
  });
  const speeches=await page.evaluate(()=>brainFoundation.flatMap(l=>[l.opening,...l.rounds.map(r=>r.voice)]));
  if(mode!=='stills'){
    const scriptFile=join(audioDir,'lines.json');
    await writeFile(scriptFile,JSON.stringify(speeches));
    execFileSync('powershell.exe',['-NoProfile','-File',join(here,'narrate.ps1'),scriptFile,audioDir]);
  }
  async function frame(chapter,shot,n) {
    const image=await page.evaluate(([c,s,t])=>{
      const lesson=brainFoundation[c], opening=s===0, round=lesson.rounds[s-1];
      directExhibit(window.set,c,Math.max(0,s-1),opening?t*.12:t,opening);
      const ctx=film.getContext('2d');
      ctx.drawImage(window.set.canvas,0,0);
      const label=opening?lesson.place:round.action;
      ctx.font='bold 25px "Microsoft YaHei", sans-serif';
      ctx.fillStyle='#183e36';ctx.fillRect(16,16,ctx.measureText(label).width+30,44);
      ctx.fillStyle='#ffebbd';ctx.fillText(label,31,47);
      ctx.fillStyle='#18362f';ctx.fillRect(0,504,896,96);
      ctx.font='bold 32px "Microsoft YaHei", sans-serif';ctx.fillStyle='#fff8e4';
      const sentence=opening?lesson.opening:round.voice;
      let lines=[sentence];
      if(ctx.measureText(sentence).width>840){
        const breaks=[...sentence.matchAll(/[，。；？！]/g)].map(m=>m.index+1);
        const cut=breaks.filter(i=>i<sentence.length).sort((a,b)=>Math.abs(a-sentence.length/2)-Math.abs(b-sentence.length/2))[0] || Math.ceil(sentence.length/2);
        lines=[sentence.slice(0,cut),sentence.slice(cut)];
      }
      lines.forEach((line,i)=>ctx.fillText(line,28,(lines.length===1?564:542)+i*39,840));
      return film.toDataURL('image/jpeg',.94).split(',')[1];
    },[chapter,shot,n/(perShot-1)]);
    return Buffer.from(image,'base64');
  }
  for(let c=0;c<4;c++) {
    const name='exhibit-'+(c+1);
    await writeFile(join(dest,name+'.jpg'),await frame(c,0,5));
    if(mode==='stills') {
      for(let s=1;s<=4;s++) await writeFile(join(dest,name+'-shot-'+s+'.jpg'),await frame(c,s,perShot-2));
      continue;
    }
    const audioInputs=[],filters=[];
    for(let s=0;s<5;s++){
      const file=join(audioDir,'line-'+(c*5+s)+'.wav');
      const length=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',file],{encoding:'utf8'}).trim());
      const tempo=Math.max(1,length/(seconds-.65));
      audioInputs.push('-i',file);
      filters.push('['+(s+1)+':a]atempo='+tempo.toFixed(3)+',adelay=180,apad,atrim=duration='+seconds+'[s'+s+']');
    }
    filters.push('[s0][s1][s2][s3][s4]concat=n=5:v=0:a=1[voice]');
    const encode=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','pipe:0',...audioInputs,'-filter_complex',filters.join(';'),'-map','0:v','-map','[voice]','-c:a','aac','-b:a','80k','-c:v','libx264','-preset','medium','-crf','23','-pix_fmt','yuv420p','-g',String(perShot),'-movflags','+faststart',join(dest,name+'.mp4')],{stdio:['pipe','inherit','inherit']});
    const exit=once(encode,'close');
    for(let s=0;s<5;s++){
      for(let n=0;n<perShot;n++) if(!encode.stdin.write(await frame(c,s,n))) await once(encode.stdin,'drain');
      console.log(name+' shot '+(s+1)+' rendered');
    }
    encode.stdin.end();await finished(encode.stdin);
    if((await exit)[0]!==0) throw Error('ffmpeg failed for '+name);
    // The same filmed moment is available to readers stepping through without motion.
    for(let s=0;s<4;s++) {
      const still=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String((s+1)*seconds+5.5),'-i',join(dest,name+'.mp4'),'-frames:v','1','-q:v','77',join(dest,name+'-'+(s+1)+'.webp')],{stdio:'inherit'});
      if((await once(still,'close'))[0]!==0) throw Error('Missing shot still for '+name);
    }
  }
} finally {await browser.close();await rm(audioDir,{recursive:true,force:true});}
