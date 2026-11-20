(() => {
  const source='https://keepwork.com/api/raw/official/docs/2026/super-organization-summit.html';
  const title='十家店想同一天开，今天能答应几家？';
  const task='从排期表中找出今天能承诺的门店，写一份给客户的答复，并标出仍由人决定的事。';
  const evidence='在个人目录找到 CEO 留给下次面试的追问。在团队目录打开岗位卡第 2 行，沿确认记录回到交接单和排期表，解释这行职责为什么改。';
  const job='共享/公司/项目负责人岗位卡.md';
  const note='docs/面试笔记/项目负责人面试.md';
  const approval='共享/公司/原件/CEO岗位授权确认.md';
  const raw='共享/公司/原件/CEO早晨的三份交接单.md',sheet='共享/公司/原件/十店排期核对.md';
  const cite=(path,line)=>'[['+path.slice(0,-3)+'#L'+line+'|'+path.split('/').pop().slice(0,-3)+' · 第'+line+'行]]';
  const rule='负责人核实设备到货和人员排班后，可在已核实的范围内向客户承诺交期。';
  const initialFiles={[job]:'# 项目负责人岗位卡 · 企业共享\n职责：增加现场执行人手。'};
  window.adultSummit={source,title,task,evidence,initialFiles};
  {
    const role='enterprise';
    const pages=window.brainWiki[role].pages;
    pages['门店开业项目']={project:true,scope:'保存门店排期、开业约束和对外可以做出的承诺。'};
    pages['团队用人与授权']={scope:'记录谁能核实条件、作出承诺，以及可以给协作者看哪些依据。'};
    window.brainDecisions[role][4]=['客户今天催十家店的开业日期，你会怎样答复？','先确认溪桥和北岸，约定其余八家的下一次排期答复。','把十家都列为已确认，再让项目组补齐条件。'];
  }
  window.buildSummitLesson=function({event,read,wiki,index,log,pagePath,previous}){
    const topic=pagePath('门店开业项目'),related=pagePath('团队用人与授权');
    const circle='共享/公司/原件/周四合作圈意向.md';
    const out='作品/负责人给客户的开业答复.md',proposal='共享/合作圈/周四核价草案.md';
    const sm=window.enterpriseWorkshop?.summitMeta;
    const emit=(stageIdx,label,user,ai,path,next,focus='')=>event(label,user,ai,path,next,focus,false,sm?{
      stage:stageIdx,stageName:sm.stages[stageIdx],photo:sm.photos[stageIdx+1],speaker:'CEO'
    }:{});
    emit(0,'从已有经验出发','今天要回复一个催得很急的客户，我该先翻什么？','先打开上节的作品。把其中“先核对使用条件”的办法带到这次开店任务。',previous.out,undefined,previous.final);
    emit(0,'读三份交接单','三个项目都在等我，真是现场人手不够吗？','三份交接单的最后签字人都是 CEO。先查一查：有没有人能核实条件并负责向客户答复？',raw,'# 交接单摘记 · 峰会情境改编\n溪桥、北岸、东林三份交接单的交期均由 CEO 最终确认。\n旧招聘方向：增补现场执行人手。\n来源：《未来 CEO 的一个早晨》08:40–08:43\n'+source);
    emit(0,'保存排期原件','客户希望周五十店齐开，查表给我看。','我把设备到货和人员排班放在一起看。溪桥、北岸两项都核实，其余八家至少还有一项待核。',sheet,'# 十店排期 · 课堂整理\n溪桥店：设备已到，班次已排。\n北岸店：设备已到，班次已排。\n其余八店：逐店核对中。\n来源：《未来 CEO 的一个早晨》十店排期与候选人核验环节。');
    emit(0,'建立项目词条','给门店项目单留一页，下次还会有人问进度。','我把判断和它依赖的两列数据连在一起。',topic,'# 门店开业项目\n承诺日期前，逐店查设备到货与人员排班。\n排期依据：'+wiki(sheet)+'\n谁在等签字：'+wiki(raw));
    emit(0,'登记索引','','从总索引可以打开项目，再回到原始排期。',index,read(index)+'\n- '+wiki(topic));
    emit(0,'起草客户答复','先给我一版回复，我来核对。','草稿把客户期待的日期当成了实际承诺。请对着排期表检查。',out,'# 给客户的开业答复\n十家门店周五全部开业。\n依据：'+wiki(sheet));
    emit(0,'记录人的检验','把客户想要的和我们能答应的分开。','请作出你的决定，再看答复里的哪一行需要修改。',sheet,undefined,'其余八店：逐店核对中。');
    const final='溪桥店和北岸店可按周五排期；其余八家明天下午逐店回复。';
    emit(0,'按证据改稿','先答应两家，同时给八家一个明确的回复时间。','我把承诺范围缩到已有证据支持的两家。',out,read(out).replace('十家门店周五全部开业。',final));
    emit(1,'打开旧岗位卡','签字都压在我这里，团队现在按什么标准招人？','打开团队共享第二大脑。岗位卡第 2 行只要求增加现场执行人手，还没写谁可以向客户承诺交期。',job,undefined,'增加现场执行人手');
    emit(1,'面试笔记留在个人脑','候选人只圈出两家。如果客户坚持十店同开，他会怎么谈？这句留给我下次追问。','已放在你的个人第二大脑。对照排期表，能确认的是两家店具备条件；候选人会怎样协商，还要等他回答。',note,'# 项目负责人面试 · CEO 私人笔记\n观察：候选人只承诺溪桥、北岸两家。\n下次追问：如果客户拒绝分批，你会怎样协商？\n岗位建议（待我确认）：'+rule+'\n核对材料：'+wiki(sheet));
    emit(2,'CEO 确认可共享的判断','我确认岗位建议这一条可以给团队用。面试观察和下次追问留在我这里。','我把你确认的职责单独记为团队原件，附上交接单和排期。团队成员可以自己核查这条决定。',approval,'# 岗位授权确认 · 课堂情境记录\nCEO 确认：'+rule+'\n旧流程由谁签字：'+cite(raw,2)+'\n已核实的门店：'+cite(sheet,2)+'、'+cite(sheet,3)+'\n其余门店状态：'+cite(sheet,4));
    emit(2,'确认团队规则','把我刚确认的职责写进团队岗位卡，招聘和交付以后都按它办。','岗位卡第 2 行已更新。点“CEO岗位授权确认 · 第2行”看你的原话，再点交接单或排期表核对原件。',job,read(job).replace('增加现场执行人手。',rule)+'\n这条职责由谁确认：'+cite(approval,2));
    emit(2,'个人笔记记下去向','以后翻我的面试笔记，能知道哪条建议被采用了吗？','我把待确认的一行改为已采用，并附上团队岗位卡。你的下次追问仍在上一行。',note,read(note).replace('岗位建议（待我确认）：'+rule,'已采用的岗位标准：'+cite(job,2)));
    emit(2,'留下个人判断','下次招项目负责人，我要从哪里找回这些材料？','在个人词条里，一条链接回到你的面试笔记，另一条打开团队正在使用的岗位卡。',related,'# 团队用人与授权\n我的面试记录：'+wiki(note)+'\n已确认的团队标准：'+wiki(job)+'\n项目：'+wiki(topic));
    emit(3,'核对三方条件','周四样板店空半天，三方可以先一起做什么？','我方可出场地和讲解，设备方可带样机，商场可邀请来宾。费用、人数和现场负责人仍待三方确认。',circle,'# 合作圈意向 · 峰会情境改编\n样板店：周四半天场地与讲解。\n设备方：样机与工程师。\n商场：协助邀约。\n费用、人数、现场责任人待定。');
    emit(3,'拟对外草案','先约核价。三方确认后再宣布活动。','对外只列本次合作需要的条件；个人面试笔记留在你的资料库。',proposal,'# 周四体验日 · 核价草案\n建议三方核对费用、人数和现场负责人，再决定是否举行。\n可共享的投入：半天场地、样机、来宾邀约。');
    emit(3,'把作品写回项目','','从这一页可以找回给客户的承诺、团队采用的岗位卡和仍待确认的合作草案。',topic,read(topic)+'\n客户答复：'+wiki(out)+'\n岗位授权：'+wiki(job)+'\n合作意向原件：'+wiki(circle)+'\n对外草案：'+wiki(proposal));
    emit(3,'登记第二个词条','','把长期使用的用人与授权词条也登记到总索引。',index,read(index)+'\n- '+wiki(related));
    emit(3,'登记改动','换到自己的工作，我可以带走哪一步？','为下一次交付列出两个必须核实的条件，把确认人和依据一并写进项目页。',log,read(log)+'\n\n## 第5课\n个人：'+wiki(related)+'\n公司：'+wiki(job)+'\n合作圈：'+wiki(proposal)+'\n成果：'+wiki(out));
    return {topic,related,out,raw,final,quote:'三份交接单'};
  };
})();
