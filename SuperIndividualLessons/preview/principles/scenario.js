// The quotations belong to materials.js. These short exchanges are the teaching reenactment.
const staging = [
  ['calendar','会议便签','六月见面？','十月七八号','等双方确认','群里说七八号见，是哪天？','会议在十月五日。七八号是候选日，还没约定。'],
  ['stack','自动纪要','两方分工','对照发言顺序','按发言核对','这两套系统到底是谁介绍的？','摘要把两边写反了。我把核对发言人的方法留下来。'],
  ['stamp','案例清单','已完成？','做的过程中','进行中','这两个试点可以算完成了吗？','原话只说正在做。交接单先记进行中。'],
  ['note','白板笔记','34%？','问的是模型','等待调查','这个比例能放进讲义吗？','发言人说数字来自模型。等有调查依据，再引用。'],
  ['stack','工作坊草图','分组草图 A / B','两稿有分歧','等负责人定稿','群里的两张图，哪张算定稿？','图和讨论说法不同。我把分歧和出处一起留下。'],
  ['stack','老师的资料','一摞 PPT','找出资料间的关系','留下原件入口','已经有这么多课件，还要记什么？','写下它们之间的关系。以后点开知识页，就能找到原件。'],
  ['folder','教研交接','个人笔记','本人选择经验','仅分享选中内容','要把整本私人笔记发给学校吗？','老师自己挑选能分享的经验，其他内容留在个人脑。'],
  ['screen','彩排群聊','出现一条消息','手动输入','标为模拟','群里出现消息，能证明助手发出来了吗？','这次是人手动输入的。我给这条记录标上“场景演示”。'],
  ['screen','彩排现场','助手没回应','还有另一种解释','待排查','助手没说话，一定是提示词的问题吗？','原话也提到可能有程序问题。原因先留待排查。'],
  ['note','交付便签','约 15 分钟视频','会后追加要求','方案页手动讲解','明天交视频，还是交能翻页的讲解？','会后改为方案页手动讲解。早先的视频设想仍能查到。'],
  ['folder','彩排档案','一场彩排','提交 43b82e68','多份文件留痕','一场彩排，最后改了哪些文件？','概念页和项目页都有新增，索引、日志和讲稿也一起更新了。'],
  ['screen','老师的需求','上课自己控场','讨论提出的做法','等待现场演示','老师提的这个办法，今天就写成能用？','现在是需求。先记“等待演示”，等实际操作后再改。'],
  ['screen','课堂演示','电磁场课件','语音找回并打开','这一步已演示','昨天还写着“等待演示”。今天能改了吗？','能。现场用语音找回并打开了电磁场课件，只更新这一步。'],
  ['remote','桌上的遥控器','录音 / 发指令？','只验证了静音','联动仍待测','这个遥控器能录音，也能发指令吗？','当时只验证了切换收音。双按钮联动还要再试。'],
  ['stack','两份录音','长录音 + 短录音','时段重合','只算一场','又收到一份录音，算第二次成功吗？','两段来自同一场。删掉导入草稿里的重复行，留下第二个出处。'],
  ['folder','老师的交接单','哪些能照着演？','已演示 / 待测试','交给下一位老师','哪些可以现场演？以后我还会反复查。','这两项有出处。要单独建一页，还是继续放在项目页？']
];

function makeBeats(pos,choice){
  const e=events[pos], art=staging[pos], src=archive[e.src];
  const previous=events.slice(0,pos).some(x=>x.dest===e.dest && x.key===e.key);
  const beats=[];
  function add(label,docId,op,ai,opts={}){
    const scope=files[docId]||src.path;
    beats.push({label,docId,name:scope.split('/').pop(),op,ai,scope,duration:3500,prop:art[2],...opts});
  }
  function cite(n){
    const x=events[n],scope=archive[x.src].path;
    add('在原件中找依据','source','只读',n===pos?'原文里，能作依据的是这句。':'我沿项目页的出处，打开当时的演示记录。',{
      source:n,scope,name:scope.split('/').pop(),motion:'open',duration:4200,prop:n===pos?art[3]:x.title,
      rows:[{type:'plain',text:x.loc},{type:'highlight',text:x.quote}]
    });
  }
  function fold(id){
    add('保存并归档',id,'已保存','写好了，收回“'+titles[id]+'”。',{motion:'fold',prop:art[4],duration:2100});
  }
  add('收到问题','index','准备读取','我先到总索引找这件事记在哪个词条。',{motion:'idle',duration:3200});
  add('从总索引定位','index','查索引',e.dest==='log'?'先看维护日志，找这次记录的归处。':'索引里有“'+titles[e.dest]+'”这个词条，我打开它。');
  add('打开目标文件',e.dest,'读旧页',previous?'这里还写着“等待演示”。我去对照今天的原件。':pos===15?'项目页已经有两条验证记录，我分别打开出处。':'找到了。先用收到的材料核对，再决定写哪一句。',{motion:'open'});
  if(pos===15){cite(12);cite(13);}else cite(pos);
  if(pos===15)add('决定记录位置','project','等你选择',art[6],{gate:true,prop:art[3]});
  if(previous)add('删除已经过期的一行',e.dest,'删旧行','旧状态有了新证据。先把“等待演示”这一行撤下。',{motion:'open',prop:art[3],duration:3800});
  if(pos===14){
    add('去掉重复记录','log','草稿去重','这是尚未保存的导入草稿。两行指的是同一场。',{
      scope:'log.md · 写入前的草稿',prop:art[3],motion:'open',duration:3800,
      rows:[{type:'plain',text:'# 导入草稿'},{type:'plain',text:'- 11 月 8 日　课堂演示'},{type:'erase',text:'- 11 月 8 日　课堂演示（短录音）'}]
    });
  }
  if(pos===15 && choice==='new'){
    add('新建 Markdown','topic','新建文件','好，建一张“课堂现场验证”知识页。',{motion:'create',prop:'新词条',duration:5200});
    add('写入两条出处','topic','加出处','两条结论各自指回演示原文，还能回到所属项目。',{prop:art[4],duration:5000});
    fold('topic');
  }
  const answer=pos===15?(choice==='new'?'再从项目页连到新词条。':'好，这两项留在原来的项目页里。'):art[6];
  add(previous?'写入核对后的结论':'把这一行写进去',e.dest,previous?'改写':'新增行',answer,{prop:art[4],motion:previous?'write':'open',duration:5200});
  add('把原件地址也写进去',e.dest,'加出处','把这句结论的出处一起留下，下次可以点回去。',{prop:art[4],duration:4200});
  fold(e.dest);
  if(e.dest==='project'){
    add('更新索引','index','更新目录','同步总索引，下一次提问就能找到这页。',{motion:'open',prop:art[4],duration:4400});
    fold('index');
  }
  if(e.dest!=='log'){
    add('在日志留下修改理由','log','追加日志','最后记一笔，后来的人可以查为什么改。',{motion:'open',prop:art[4],duration:4300});
    fold('log');
  }
  add('回答问题',e.dest,'已归档',pos===15?'演示课件可以准备。遥控器双键还要实测，你可以沿出处核对。':art[6],{motion:'done',prop:art[4],duration:3600});
  return wikiFrames(beats,pos,choice);
}
