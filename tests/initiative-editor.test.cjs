// Run: node --test tests/initiative-editor.test.cjs
// Minimal DOM adapter for editor behavior; does not validate browser layout.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function environment(){
  const storage=new Map();
  const context=vm.createContext({window:{},AbortController,console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>{},URL:{},FormData:class{constructor(form){this.data=Object.values(form.controls).filter(c=>c.name).map(c=>[c.name,c.value]);}get(key){return this.data.find(([k])=>k===key)?.[1]??null;}[Symbol.iterator](){return this.data[Symbol.iterator]();}}});
  for(const file of ['data','charts','initiative-options','auxiliary-data','initiative-editor','demo-completion','mvp-views','auxiliary-view','tap','tep'])vm.runInContext(fs.readFileSync(`assets/js/${file}.js`,'utf8'),context);
  context.window.testReloadCatalogs=()=>vm.runInContext(fs.readFileSync('assets/js/auxiliary-data.js','utf8'),context);
  context.window.testStoreCatalogs=rows=>storage.set(context.window.AuxiliaryData.key,JSON.stringify(rows));
  return context.window;
}
class Node {
  set value(v){this._value=String(v??'');if(this._value===''&&this.files)this.files=[];} get value(){return this._value;}
  constructor(){this.handlers={};this.dataset={};this.value='';this.innerHTML='';this.style={};this.validity={badInput:false};this.classList={toggle(){}};}
  addEventListener(type,fn,options={}){(this.handlers[type]??=[]).push({fn,signal:options.signal});}
  fire(type,target=this){for(const h of this.handlers[type]||[])if(!h.signal?.aborted)h.fn({target,currentTarget:this,preventDefault(){},key:''});}
  focus(){this.focused=true;} setAttribute(){}
  querySelector(){return new Node();}
}
class Root extends Node {
  set innerHTML(html){
    this.html=html;if(!html)return;this.nodes={};this.tabs=[];this.files=[];this.form=new Node();this.form.controls={};
    const decode=v=>v.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w.-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
    for(const match of html.matchAll(/<(input|select|textarea|button|div|span|output|progress)\b([^>]*)>/g)){
      match[3]=html.slice(match.index+match[0].length).split(`</${match[1]}>`)[0];
      const a=attrs(match[2]),node=new Node();node.id=a.id;node.name=a.name;node.tagName=match[1].toUpperCase();node.value=a.value||'';
      if(node.tagName==='TEXTAREA')node.value=decode(match[3]||'');
      if(node.tagName==='SELECT'){const opts=[...(match[3]||'').matchAll(/<option\b([^>]*)>([^<]*)<\/option>/g)];const selected=opts.find(m=>/\bselected\b/.test(m[1]));node.value=selected?attrs(selected[1]).value||decode(selected[2]):'';}
      const before=html.slice(0,match.index);const panel=[...before.matchAll(/id="mvp-panel-(\d)"/g)].pop();node.closest=()=>({id:`mvp-panel-${panel?.[1]||0}`});
      if(node.id)this.nodes[`#${node.id}`]=node;
      if(a['data-mvp-tab']!==undefined){node.dataset.mvpTab=a['data-mvp-tab'];this.tabs.push(node);}
      if(a['data-mvp-files']){node.dataset.mvpFiles=a['data-mvp-files'];this.files.push(node);}
      if(a.type==='submit')this.submit=node;
      if(node.name)this.form.controls[node.name]=node;
    }
    this.form.elements={namedItem:k=>this.form.controls[k]};this.form.querySelector=()=>this.submit;
  }
  get innerHTML(){return this.html;}
  querySelector(selector){if(selector==='form')return this.form;return this.nodes[selector]??=(new Node());}
  querySelectorAll(selector){return selector==='[data-mvp-tab]'?this.tabs:selector==='[data-mvp-files]'?this.files:[];}
  action(action,index='',origin=''){const target={dataset:{mvpAction:action,index:String(index),origin},closest:s=>s==='[data-mvp-action]'?target:null};this.fire('click',target);}
  auxAction(action,id=''){const target={dataset:{auxAction:action,id},closest:s=>s==='[data-aux-action]'?target:null};this.fire('click',target);}
  tab(index){const target={dataset:{mvpTab:String(index)},closest:s=>s==='[data-mvp-tab]'?target:null};this.fire('click',target);}
}
function fixture(source){const w=environment(),root=new Root(),saved=[],messages=[],confirmations=[];const api={escapeHtml,header:(title)=>`<h1>${escapeHtml(title)}</h1>`,today:()=> '2026-10-21',managers:w.InitiativeOptions['Gerentes de Projetos'],blobs:new Map(),toast:(...m)=>messages.push(m),confirm:(_,fn)=>confirmations.push(fn),view:()=>{},save:item=>{saved.push(JSON.parse(JSON.stringify(item)));return true;}};const editor=w.InitiativeEditor.mount(root,source,api);return {w,root,saved,messages,confirmations,api,editor,set:(k,v)=>root.form.controls[k].value=v};}
test('TAP uses current draft fields and saves complements without discarding attachments',()=>{
  const f=fixture({id:'INI-068',title:'Projeto original',files:[{name:'anexo.txt',origin:'document'}],tap:{problem:'Anterior'}});
  let draft;
  f.api.tap=(item,complete)=>{draft=item;complete({...item.tap,problem:'Novo problema'});};
  f.set('title','Nome atualizado');f.set('scope','Escopo atualizado');f.set('c.axis','Eixo escolhido');
  assert.match(f.root.html,/Gerar TAP/);assert.match(f.root.html,/>Anexos da iniciativa<\/h2>/);
  f.root.action('tap');assert.equal(draft.title,'Nome atualizado');assert.equal(draft.scope,'Escopo atualizado');assert.equal(draft.mvp.classification.axis,'Eixo escolhido');assert.equal(f.saved.length,0);
  f.root.form.fire('submit');assert.equal(f.saved[0].tap.problem,'Novo problema');assert.equal(f.saved[0].files[0].name,'anexo.txt');
  const w=environment();assert.equal(w.DemoData.save(f.saved),true);assert.equal(w.DemoData.load()[0].tap.problem,'Novo problema');
});
test('TAP rejects missing names and reversed dates before opening its modal',()=>{
  const f=fixture();let opened=false;f.api.tap=()=>{opened=true;};f.root.action('tap');assert.equal(opened,false);
  f.set('title','Projeto');f.set('start','2026-10-20');f.set('end','2026-10-01');f.root.action('tap');assert.equal(opened,false);
});
test('TAP template covers source sections, escapes all supplied text and leaves legacy risks unused',()=>{
  const w=environment(),item={id:'INI-068',title:'Nome <script>alert(1)</script>',department:'DSUP',sector:'Setor',manager:'GP',start:'2026-01-01',end:'2026-07-01',scope:'Escopo',description:'Objetivo para revisão',benefits:'Benefício',mvp:{areas:['Área'],members:[{name:'Pessoa',role:'Papel'}],classification:{axis:'Eixo'}},risks:[{description:'RISCO LEGADO NÃO UTILIZAR'}]};
  const before=JSON.stringify(item),tap=w.InitiativeTap.defaults(item,'2026-10-23');
  assert.equal(tap.smart,item.description);assert.equal(tap.includes,item.scope);assert.equal(tap.impact,item.benefits);assert.ok(tap.duration>0);assert.equal(tap.risks,'');
  tap.governance='Nome <img> | Área & setor | Responsável';tap.schedule='Entrega | 01/06/2026 | Nota';
  const html=w.InitiativeTap.html(item,tap);
  for(const label of ['IDENTIFICAÇÃO DO PROJETO','DADOS DO PROJETO','OBJETIVO DO DOCUMENTO','JUSTIFICATIVA E ALINHAMENTO ESTRATÉGICO','OBJETIVOS DO PROJETO','ESCOPO DO PROJETO','ENTREGAS PRINCIPAIS','MATRIZ DE GOVERNANÇA','CRONOGRAMA MACRO','PREMISSAS','RESTRIÇÕES','RISCOS DE ALTO NÍVEL','CRITÉRIOS DE SUCESSO','CRITÉRIOS DE ACEITE'])assert.ok(html.includes(label),label);
  assert.match(html,/&lt;script&gt;/);assert.match(html,/Nome &lt;img&gt;/);assert.doesNotMatch(html,/<script>|<img>|RISCO LEGADO NÃO UTILIZAR/);assert.match(html,/23\/10\/2026/);assert.match(html,/size:A4 portrait/);assert.equal(JSON.stringify(item),before);
});
test('initiative data keeps an untitled areas card and attachments exist only in Documents, including legacy origins',()=>{
  for(const source of [undefined,{id:'INI-068',title:'Projeto',files:[{name:'Arquivo anterior.pdf',origin:'attachment',description:'Arquivo preservado'}]}]){
    const f=fixture(source),data=f.root.html.split('id="mvp-panel-0"')[1].split('id="mvp-panel-1"')[0];
    assert.match(data,/form-card--untitled/);assert.match(data,/Áreas Envolvidas/);assert.match(data,/Partes Interessadas/);assert.doesNotMatch(data,/Administração da Iniciativa|data-mvp-upload|data-mvp-files/);
    assert.equal(f.root.files.length,1);assert.equal(f.root.files[0].dataset.mvpFiles,'document');
    if(source)assert.match(f.root.files[0].innerHTML,/Arquivo anterior.pdf/);
  }
});
test('report percentages stay associated with each dated report and the header follows the latest date',()=>{
  const source={id:'INI-068',title:'Teste',progress:20,statusReports:[{type:'Ordinário',date:'2026-01-01',monitoringStatus:'Em dia',owner:'GP',progress:10},{type:'Ordinário',date:'2026-03-01',monitoringStatus:'Em dia',owner:'GP',progress:60}]},before=JSON.stringify(source),f=fixture(source);
  const output=()=>f.root.querySelector('[data-mvp-action="initiative-progress"] strong').textContent;
  assert.equal(f.root.form.controls['report-progress'].value,'60');assert.equal(f.root.form.controls.progress,undefined);
  f.root.action('report-edit',0);assert.equal(f.root.form.controls['report-progress'].value,'10');f.set('report-progress','15.5');f.root.action('report-save');assert.equal(output(),'60%');assert.match(f.root.querySelector('#mvp-reports').innerHTML,/15.5%/);
  for(const [key,value] of Object.entries({type:'Ordinário',date:'2026-02-01',status:'Em dia',owner:f.api.managers[0],progress:'40'}))f.set('report-'+key,value);
  f.root.action('report-save');assert.equal(output(),'60%');
  f.root.action('report-edit',2);f.set('report-date','2026-04-01');f.set('report-progress','70');f.root.action('report-save');assert.equal(output(),'70%');
  f.root.action('report-remove',2);f.confirmations.at(-1)();assert.equal(output(),'60%');
  f.root.action('report-edit',1);f.set('report-progress','65');f.root.action('report-save');assert.equal(output(),'65%');assert.equal(f.root.form.controls['report-progress'].value,'65');
  f.root.form.fire('submit');assert.equal(f.saved[0].progress,65);assert.equal(f.saved[0].statusReports[0].progress,15.5);assert.equal(JSON.stringify(source),before);
  const w=environment();w.DemoData.save(f.saved);assert.equal(w.DemoData.load()[0].statusReports[0].progress,15.5);assert.match(w.MvpViews.headerSummary(w.MvpViews.project(w.DemoData.load()[0])),/65%/);
});
test('legacy reports have no invented percentage while current progress remains a fallback',()=>{
  const w=environment(),source={id:'INI-068',title:'Legado',progress:42,statusReports:[{date:'2026-10-01',summary:'Histórico sem percentual'}]},before=JSON.stringify(source),item=w.MvpViews.project(source);
  assert.equal(item.progress,42);assert.equal(w.InitiativeEditor.reportProgress(item.statusReports[0]),null);assert.equal(JSON.stringify(source),before);
  const f=fixture(source);assert.match(f.root.querySelector('#mvp-reports').innerHTML,/% de Conclusão/);assert.match(f.root.querySelector('#mvp-reports').innerHTML,/Não informado/);f.root.action('report-edit',0);assert.equal(f.root.form.controls['report-progress'].value,'');
  assert.equal(w.InitiativeEditor.reportProgress({progress:0}),0);assert.equal(w.InitiativeEditor.reportProgress({progress:'100'}),100);for(const value of ['',null,undefined,true,'Infinity',-1,101])assert.equal(w.InitiativeEditor.reportProgress({progress:value}),null);
});
test('report progress requires confirmation and a valid calendar date and is visible in report details',()=>{
  const f=fixture({id:'INI-068',title:'Teste',progress:20});let detail;f.api.view=(title,body)=>detail=body;
  for(const [key,value] of Object.entries({type:'Ordinário',date:'2026-02-30',status:'Em dia',owner:f.api.managers[0],progress:'0'}))f.set('report-'+key,value);
  f.root.action('report-save');assert.match(f.messages.at(-1)[1],/data válida/);
  f.set('report-date','2026-10-23');f.set('report-progress','101');f.root.action('report-save');assert.match(f.messages.at(-1)[1],/entre 0 e 100/);
  f.set('report-progress','0');f.root.form.fire('submit');assert.equal(f.saved.length,0);f.root.action('report-save');f.root.action('report-view',0);assert.match(detail,/% de Conclusão/);assert.match(detail,/0%/);f.root.form.fire('submit');assert.equal(f.saved[0].progress,0);assert.equal(f.saved[0].statusReports[0].progress,0);
});
test('new report defaults use the project manager and latest percentage without creating pending reports',()=>{
  const source={id:'INI-068',title:'Teste',manager:'Eduardo de Borba Severo',progress:20,statusReports:[{date:'2026-01-01',type:'Ordinário',monitoringStatus:'Em dia',owner:'Katia Cilene Rauber Peil',progress:10},{date:'2026-03-01',type:'Ordinário',monitoringStatus:'Em dia',owner:'Katia Cilene Rauber Peil',progress:55.5}]};
  const untouched=fixture(source);assert.equal(untouched.editor.isDirty(),false);assert.equal(untouched.root.form.controls['report-owner'].value,source.manager);assert.equal(untouched.root.form.controls['report-progress'].value,'55.5');untouched.root.form.fire('submit');assert.equal(untouched.saved.length,1);assert.equal(untouched.saved[0].statusReports.length,2);
  const f=fixture(source),manager=f.root.form.controls.manager;
  f.set('manager','Adriana Ferreira de Brito');f.root.form.fire('change',manager);assert.equal(f.root.form.controls['report-owner'].value,'Adriana Ferreira de Brito');
  f.set('report-owner','Carine Vitoria Amaral de Lima');f.set('manager','Alexandre Faccioni Barcellos');f.root.form.fire('change',manager);assert.equal(f.root.form.controls['report-owner'].value,'Carine Vitoria Amaral de Lima');
  f.root.action('report-edit',0);assert.equal(f.root.form.controls['report-owner'].value,'Katia Cilene Rauber Peil');assert.equal(f.root.form.controls['report-progress'].value,'10');f.root.action('report-save');assert.equal(f.root.form.controls['report-owner'].value,'Alexandre Faccioni Barcellos');assert.equal(f.root.form.controls['report-progress'].value,'55.5');
  f.root.form.fire('submit');assert.equal(f.saved.length,1);assert.equal(f.saved[0].statusReports.length,2);
  const legacy=fixture({id:'INI-069',title:'Sem relatórios',progress:0,manager:source.manager});assert.equal(legacy.root.form.controls['report-progress'].value,'0');
});
test('report recency uses dates and the last registered entry to resolve same-day ties',()=>{
  const w=environment(),item=w.MvpViews.project({progress:5,statusReports:[{date:'2026-10-23',progress:40},{date:'2026-10-22',progress:90},{date:'2026-10-23',progress:55}]});assert.equal(item.progress,55);assert.equal(w.InitiativeEditor.latestStatusReport(item).progress,55);
});
test('GIE reference is escaped in the header and never changes the real identifier or public code',()=>{
  const w=environment(),source={id:'INI-068',title:'Projeto',department:'DPROD'},before=JSON.stringify(source),item=w.MvpViews.project(source);
  assert.equal(item.gieReference,'');assert.equal(JSON.stringify(source),before);assert.match(w.MvpViews.headerSummary(item),/data-mvp-action="initiative-gie"/);
  item.gieReference='DPROJ-555 <script>';const html=w.MvpViews.headerSummary(item);assert.match(html,/DPROD-068/);assert.match(html,/GIE: DPROJ-555 &lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.equal(item.id,'INI-068');assert.equal(w.AuxiliaryData.initiativeCode(item),'DPROD-068');
});
test('GIE save callback preserves pending form fields and synchronizes the independently saved reference',()=>{
  const f=fixture({id:'INI-068',title:'Original',department:'DPROD'});f.set('title','Alteração pendente');f.root.form.fire('input',f.root.form.controls.title);let savedReference;
  f.api.changeGieReference=callback=>{savedReference=callback;};f.root.action('initiative-gie');savedReference('DPROJ-555');
  assert.equal(f.root.form.controls.title.value,'Alteração pendente');assert.equal(f.editor.isDirty(),true);assert.equal(f.saved.length,0);
  assert.equal(f.root.querySelector('[data-mvp-gie-reference]').textContent,' | GIE: DPROJ-555');f.root.form.fire('submit');assert.equal(f.saved[0].gieReference,'DPROJ-555');assert.equal(f.saved[0].id,'INI-068');
});
test('catalogs preserve official departments, lifecycle and separate monitoring states',()=>{const w=environment(),o=w.InitiativeOptions;assert.equal(o['DIREÇÃO'].length,7);assert.equal(o['Status Administrativo da Iniciativa'].length,8);assert.equal(o['Gerentes de Projetos'].length,7);assert.deepEqual(Array.from(o['Status Report — Situação da Iniciativa']),['Em dia','Atrasado','Em risco']);});
test('legacy migration copies data, preserves unrelated collections and isolates drafts',()=>{const w=environment();const old=w.DemoData.load()[0];const before=JSON.stringify(old);const draft=w.InitiativeEditor.normalize(old);assert.equal(draft.mvp.members.length,old.team.length);assert.equal(draft.mvp.classification.ditic,old.classification);draft.risks.push({description:'test'});draft.mvp.members[0].name='Changed';assert.equal(JSON.stringify(old),before);assert.ok(w.InitiativeEditor.normalize({}).files);});
test('four tabs retain fields, escape content, save all sections and prevent duplicate submit',()=>{const f=fixture({administrativeStatus:'EM EXECUÇÃO',progress:45});assert.equal(f.root.tabs.length,4);assert.doesNotMatch(f.root.html,/mvp-panel-4|data-mvp-tab="4"|name="report-type"/);f.set('title','Teste <script>');f.set('sei','texto livre');f.set('c.hst','12.5');f.root.tab(3);assert.equal(f.root.form.controls.title.value,'Teste <script>');f.root.form.fire('submit');assert.equal(f.saved.length,1);assert.equal(f.saved[0].progress,45);assert.equal(f.saved[0].status,'Em execução');assert.equal(f.saved[0].mvp.classification.hst,12.5);f.root.form.fire('submit');assert.equal(f.saved.length,1);assert.equal(f.editor.isDirty(),false);});
test('form preserves saved progress and omits administration progress controls',()=>{for(const progress of [0,45.5,100]){const f=fixture({title:'Teste',status:'Em execução',progress});assert.doesNotMatch(f.root.html,/name="progress"|id="mvp-progress"/);f.root.form.fire('submit');assert.equal(f.saved[0].progress,progress);assert.equal(f.saved[0].status,'Em execução');}});
test('department change clears incompatible sector and keeps compatible sector',()=>{const f=fixture({title:'Teste',department:'DSUP',sector:'Seção MICROINF'});const dept=f.root.form.controls.department;f.root.form.fire('change',dept);assert.match(f.root.form.controls.sector.innerHTML,/value="Seção MICROINF" selected/);dept.value='DPROJ';f.root.form.fire('change',dept);assert.doesNotMatch(f.root.form.controls.sector.innerHTML,/MICROINF/);assert.match(f.root.form.controls.sector.innerHTML,/Seção NP/);});
test('team validates, edits, confirms deletion and remains independent of HST estimate',()=>{const f=fixture();f.root.action('member-save');assert.equal(f.messages.length,1);f.set('member-name','Pessoa de teste');f.set('member-role','Analista');f.set('member-hst','-2');f.root.action('member-save');assert.equal(f.messages.length,2);f.set('member-hst','10');f.root.action('member-save');f.root.action('member-edit',0);f.set('member-role','Liderança');f.root.action('member-save');assert.match(f.root.querySelector('#mvp-members').innerHTML,/Liderança/);f.root.action('member-remove',0);assert.match(f.root.querySelector('#mvp-members').innerHTML,/Pessoa de teste/);f.confirmations.pop()();assert.doesNotMatch(f.root.querySelector('#mvp-members').innerHTML,/Pessoa de teste/);});
test('multiple reports preserve history, edit old record, keep lifecycle independent and confirm removal',()=>{const f=fixture({id:'INI-068',title:'Teste',status:'Aberta',statusReports:[{date:'2025-01-01',summary:'Legado',version:'1.0'}]});for(const [key,v] of Object.entries({type:'Ordinário',date:'2026-10-21',status:'Em risco',owner:f.api.managers[0],achievements:'Realização',progress:'40'}))f.set(`report-${key}`,v);f.root.action('report-save');f.root.action('report-edit',0);f.set('report-type','Mudança');f.set('report-status','Em dia');f.set('report-owner',f.api.managers[0]);f.set('report-achievements','Legado editado');f.set('report-progress','10');f.root.action('report-save');f.root.form.fire('submit');assert.equal(f.saved[0].statusReports.length,2);assert.equal(f.saved[0].statusReports[0].version,'1.0');assert.equal(f.saved[0].statusReports[0].achievements,'Legado editado');assert.equal(f.saved[0].status,'Aberta');f.root.action('report-remove',0);assert.equal(f.confirmations.length,1);});
test('files are added individually with descriptions, avoid duplicates and keep bytes only in memory',()=>{
  const f=fixture({title:'Teste'}),file={name:'arquivo.pdf',size:123,type:'application/pdf'};
  for(const origin of ['document','document']){
    const el=f.root.querySelector(`#mvp-upload-${origin}`),description=f.root.querySelector(`#mvp-upload-description-${origin}`);el.dataset.mvpUpload=origin;el.files=[file];
    f.root.form.fire('change',el);assert.equal(f.api.blobs.size,description.value?1:0);
    description.value='Descrição revista';f.root.action('file-add','',origin);assert.equal(description.value,'');assert.equal(el.files.length,0);
  }
  f.root.form.fire('submit');assert.equal(f.saved[0].files.length,1);assert.equal(f.saved[0].files[0].origin,'document');assert.equal(f.saved[0].files[0].description,'Descrição revista');assert.equal(f.api.blobs.size,1);assert.equal(f.saved[0].files[0].size,123);assert.equal(f.saved[0].files[0].content,undefined);
  const w=environment();w.DemoData.save(f.saved);assert.equal(w.DemoData.load()[0].files[0].description,'Descrição revista');
});
test('attachments require one file and a description, block pending inclusion and escape displayed descriptions',()=>{
  const f=fixture({title:'Teste',files:[{name:'legado.txt'}]}),file={name:'um.txt',size:1,type:'text/plain'},input=f.root.querySelector('#mvp-upload-document'),description=f.root.querySelector('#mvp-upload-description-document');
  f.root.action('file-add','','document');assert.equal(f.api.blobs.size,0);
  input.files=[file,{...file,name:'dois.txt'}];description.value='Descrição';f.root.action('file-add','','document');assert.equal(f.api.blobs.size,0);
  input.files=[file];description.value=' ';f.root.action('file-add','','document');assert.equal(f.api.blobs.size,0);
  description.value='<script>descrição</script>';f.root.form.fire('submit');assert.equal(f.saved.length,0);
  f.root.action('file-add','','document');assert.equal(f.api.blobs.size,1);assert.match(f.root.files[0].innerHTML,/&lt;script&gt;descrição&lt;\/script&gt;/);assert.match(f.root.files[0].innerHTML,/Não informada/);
  f.root.form.fire('submit');assert.equal(f.saved.length,1);assert.equal(f.saved[0].files.length,2);assert.equal(f.saved[0].files[0].description,undefined);
  assert.doesNotMatch(f.root.html,/data-mvp-upload="[^"]+"[^>]*multiple/);
});
test('TEP complements round-trip independently of lifecycle and TAP, using current sponsor and dates',()=>{
  const f=fixture({id:'INI-068',title:'Projeto',administrativeStatus:'EM EXECUÇÃO',progress:45,tap:{problem:'Manter TAP'}});let draft;
  f.api.tep=(item,complete)=>{draft=item;complete({result:'Resultado informado',finalStatus:'Concluído com ressalvas',pendingActions:[{description:'Ação',backlog:'Registro local'}]});};
  f.set('sponsor','Patrocinador atual');f.set('title','Nome atual');f.root.action('tep');assert.equal(draft.sponsor,'Patrocinador atual');assert.equal(draft.title,'Nome atual');assert.equal(f.saved.length,0);assert.match(f.root.html,/>Documentos padronizados<\/h2>/);
  f.root.form.fire('submit');assert.equal(f.saved[0].tep.result,'Resultado informado');assert.equal(f.saved[0].tap.problem,'Manter TAP');assert.equal(f.saved[0].administrativeStatus,'EM EXECUÇÃO');assert.equal(f.saved[0].progress,45);
  const w=environment();w.DemoData.save(f.saved);assert.equal(w.DemoData.load()[0].tep.pendingActions[0].backlog,'Registro local');
});
test('TEP covers template sections without copying sample approvals or prechecked evaluations',()=>{
  const w=environment(),item={id:'INI-068',title:'Projeto <script>',department:'DSUP',sector:'Setor',manager:'GP atual',sponsor:'Patrocinador atual',start:'2026-01-01',end:'2026-07-01',tap:{sectorManager:'Gerente do setor',duration:6},mvp:{areas:['Área']}};
  const before=JSON.stringify(item),tep=w.InitiativeTep.defaults(item,'2026-10-23');assert.equal(tep.finalStatus,'');assert.equal(tep.qualityEvaluation,'');assert.equal(tep.diticApprover,'');assert.equal(tep.managerApprover,item.manager);assert.equal(tep.sponsorApprover,item.sponsor);assert.equal(tep.sectorManager,item.tap.sectorManager);
  Object.assign(tep,{result:'Resultado <img>',finalStatus:'Cancelado',deadlineEvaluation:'Parcial',scopeEvaluation:'Atendido',qualityEvaluation:'Não atendido',pendingActions:[{description:'Pendência <script>',backlog:'Local & backlog'}]});
  const html=w.InitiativeTep.html(item,tep);for(const heading of ['IDENTIFICAÇÃO DO PROJETO','DADOS DO PROJETO','OBJETIVO DO DOCUMENTO','RESULTADO ENTREGUE','STATUS FINAL','AVALIAÇÃO CONSOLIDADA','PENDÊNCIAS E AÇÕES PÓS-PROJETO','APROVADORES'])assert.ok(html.includes(heading),heading);
  assert.match(html,/Cancelado/);assert.match(html,/Resultado &lt;img&gt;/);assert.match(html,/Local &amp; backlog/);assert.match(html,/23\/10\/2026/);assert.doesNotMatch(html,/<script>|Rafael Corezola Pereira|29\/04\/2026/);assert.equal(JSON.stringify(item),before);
});
test('TEP modal validates choices and dates, keeps fields after blocked popup and commits only after generation',()=>{
  const w=environment(),nodes={},document={getElementById:id=>nodes[id]??=(new Node())},ctx=vm.createContext({window:w,document});
  vm.runInContext(fs.readFileSync('assets/js/tep.js','utf8'),ctx);
  let modal,committed,printed=false,written='';const api={today:()=> '2026-10-23',modal:config=>modal=config,toast:()=>{}};
  w.InitiativeTep.open({title:'Teste'},api,value=>committed=value);
  for(const [key] of w.InitiativeTep.fields)document.getElementById('tep-'+key).value='';
  nodes['tep-pendencies'].querySelectorAll=()=>[];assert.equal(modal.onConfirm(),false);assert.equal(committed,undefined);
  for(const [key,,type,options] of w.InitiativeTep.fields)nodes['tep-'+key].value=type==='select'?options[0]:key==='date'?'2026-02-30':'';
  assert.equal(modal.onConfirm(),false);nodes['tep-date'].value='2026-10-23';nodes['tep-duration'].value='-1';assert.equal(modal.onConfirm(),false);nodes['tep-duration'].value='6';
  w.open=()=>null;assert.equal(modal.onConfirm(),false);assert.equal(committed,undefined);
  const print=new Node();w.open=()=>({document:{open(){},write:text=>written=text,close(){},getElementById:()=>print},print:()=>printed=true,close(){}});
  modal.onConfirm();assert.equal(committed.finalStatus,'Concluído');assert.match(written,/TERMO DE ENCERRAMENTO/);print.fire('click');assert.equal(printed,true);
});
test('failed save leaves draft available and remount aborts previous root listeners',()=>{const f=fixture({title:'Teste'});f.api.save=()=>false;f.root.form.fire('input');f.root.form.fire('submit');assert.equal(f.editor.isDirty(),true);assert.equal(f.root.submit.disabled,false);f.w.InitiativeEditor.mount(f.root,{title:'Segundo'},f.api);f.root.action('member-save');assert.equal(f.messages.length,1);});
test('areas and stakeholders retain multiple values with individual removal and escaping',()=>{const f=fixture({title:'<img src=x onerror=alert(1)>'});assert.doesNotMatch(f.root.html,/<img src=x/);for(const name of ['DITIC','DG']){const area=new Node();area.dataset.mvpArea=name;area.checked=true;f.root.form.fire('change',area);}const party=f.root.querySelector('#mvp-party');party.value='Parte A';f.root.action('party-add');party.value='<script>teste</script>';f.root.action('party-add');assert.match(f.root.querySelector('#mvp-parties').innerHTML,/&lt;script&gt;/);f.root.action('party-remove',0);f.root.form.fire('submit');assert.deepEqual(f.saved[0].mvp.areas,['DITIC','DG']);assert.deepEqual(f.saved[0].mvp.stakeholders,['<script>teste</script>']);});
test('saved legacy initiative round-trips through existing storage without losing associated records',()=>{const w=environment(),old=w.DemoData.load()[0],draft=w.InitiativeEditor.normalize(old);draft.mvp.members.push({name:'Pessoa de teste',role:'Revisão',hst:2});draft.mvp.classification.hst=50;assert.equal(w.DemoData.save([draft]),true);const loaded=w.DemoData.load()[0];assert.equal(loaded.id,old.id);for(const key of ['risks','milestones','activities','meetings','raci','files','statusReports'])assert.equal(JSON.stringify(loaded[key],(k,v)=>k==='catalogRefs'?undefined:v),JSON.stringify(old[key],(k,v)=>k==='catalogRefs'?undefined:v));assert.equal(loaded.mvp.classification.hst,50);assert.equal(loaded.mvp.members.length,old.team.length+1);});
test('app adapter creates unique IDs, persists audit, renders new records and rolls back failed save',()=>{
  const w=environment(),nodes={},main=new Node();let api;
  Node.prototype.querySelectorAll=function(){return [];};Node.prototype.append=function(){};
  w.addEventListener=()=>{};w.InitiativeEditor.mount=(_,source,callbacks)=>{api=callbacks;return {isDirty:()=>false};};
  const document={getElementById:id=>id==='conteudo'?main:nodes[id]??=(new Node()),addEventListener(){},querySelectorAll:()=>[],createElement:()=>new Node()};
  const location={hash:'#/initiative/new'},storage=new Map();
  const ctx=vm.createContext({window:w,document,location,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},sessionStorage:{getItem:()=> '1'},console,setTimeout:()=>{}});
  vm.runInContext(fs.readFileSync('assets/js/charts.js','utf8'),ctx);
  const app=fs.readFileSync('assets/js/app.js','utf8').replace("hydrateIcons(); const initialSaveOk=persist(); route(); if(!initialSaveOk)showToast('Não foi possível gravar os dados','O preenchimento demonstrativo está disponível nesta sessão, mas não foi salvo no navegador.','danger');",'window.TestApp={state,renderInitiativeForm,renderOverview,renderDetailTab,renderDashboard,renderInitiatives,renderSettings};');
  vm.runInContext(app,ctx);const a=w.TestApp;
  a.renderInitiativeForm(null);const draft={title:'Nova de teste',description:'Descrição',progress:25,mvp:{classification:{},members:[],stakeholders:[],areas:[]},files:[],statusReports:[]};
  assert.equal(api.save(draft),true);const created=a.state.initiatives[0];assert.equal(created.id,'INI-201');assert.equal(w.DemoData.load()[0].id,'INI-201');assert.ok(created.evolutions[0].auditId);assert.match(w.MvpViews.summaryMetrics(w.MvpViews.project(created)),/25%/);
  a.renderInitiativeForm(created.id);let planned;
  const initiativeHeader=api.header('Nome da iniciativa','Preencha as abas e salve o cadastro completo.');assert.ok(initiativeHeader.indexOf('mvp-header-identity')<initiativeHeader.indexOf('<h1>'));assert.doesNotMatch(initiativeHeader,/Escritório de Gestão de Projetos|Preencha as abas/);
  let gieValue;api.changeGieReference(value=>gieValue=value);assert.match(nodes['modal-body'].innerHTML,/initiative-gie-reference/);assert.equal(gieValue,undefined);
  const gie=nodes['initiative-gie-reference']??=new Node();gie.value='  dproj-555  ';gie.fire('input');assert.equal(gie.value,'  DPROJ-555  ');assert.doesNotMatch(nodes['modal-body'].innerHTML,/initiative-gie-help|Exemplo:/);nodes['modal-confirm'].onclick();assert.equal(gieValue,'DPROJ-555');assert.equal(a.state.initiatives[0].id,created.id);assert.equal(w.DemoData.load()[0].gieReference,'DPROJ-555');assert.equal(a.state.initiatives[0].evolutions[0].title,'Referência do GIE atualizada');
  api.changeGieReference(value=>gieValue=value);gie.value='dproj-666';const saveGie=w.DemoData.save,logsBeforeGie=JSON.stringify(a.state.auditLogs);w.DemoData.save=()=>false;nodes['modal-confirm'].onclick();assert.equal(a.state.initiatives[0].gieReference,'DPROJ-555');assert.equal(gieValue,'DPROJ-555');assert.equal(nodes['app-modal'].hidden,false);assert.equal(JSON.stringify(a.state.auditLogs),logsBeforeGie);w.DemoData.save=saveGie;
  nodes['modal-confirm'].onclick();assert.equal(gieValue,'DPROJ-666');assert.equal(w.DemoData.load()[0].gieReference,'DPROJ-666');api.changeGieReference(value=>gieValue=value);gie.value='';nodes['modal-confirm'].onclick();assert.equal(w.DemoData.load()[0].gieReference,'');
  api.replan({start:'2026-01-01',end:'2026-12-31',entries:[]},entry=>planned=entry);
  assert.match(nodes['modal-body'].innerHTML,/rows="4"/);assert.match(nodes['modal-body'].innerHTML,/Histórico de replanejamentos \(0\)/);
  const planDate=nodes['replan-end']??=new Node(),planNote=nodes['replan-justification']??=new Node(),planFile=nodes['replan-file']??=new Node();planDate.value='2025-01-01';planNote.value='Motivo';nodes['modal-confirm'].onclick();assert.equal(planned,undefined);assert.equal(nodes['app-modal'].hidden,false);
  planDate.value='2027-02-28';planNote.value=' ';nodes['modal-confirm'].onclick();assert.equal(planned,undefined);
  planNote.value='Ajuste do planejamento';planFile.files=[{name:'Um.pdf'},{name:'Dois.pdf'}];nodes['modal-confirm'].onclick();assert.equal(planned,undefined);
  planFile.files=[{name:'Plano.pdf',size:1024,type:'application/pdf'}];nodes['modal-confirm'].onclick();assert.equal(planned.newEnd,'2027-02-28');assert.equal(planned.previousEnd,'2026-12-31');assert.equal(planned.attachment.name,'Plano.pdf');assert.equal(planned.attachment.size,1024);
  assert.equal(api.save({...created,end:'2026-12-31',actualEnd:planned.newEnd,replans:[planned]}),true);assert.equal(w.DemoData.load()[0].replans.length,1);assert.equal(w.DemoData.load()[0].actualEnd,'2027-02-28');assert.equal(w.DemoData.load()[0].end,'2026-12-31');assert.ok(a.state.initiatives[0].evolutions.some(entry=>entry.title==='Iniciativa replanejada'&&entry.auditId));
  for(const tab of ['team','classification','files','reports'])assert.equal(typeof a.renderDetailTab(created,tab),'string');
  assert.doesNotThrow(()=>a.renderDashboard());assert.doesNotThrow(()=>a.renderInitiatives());
  a.renderInitiativeForm(created.id);api.changeStatus();assert.match(nodes['modal-body'].innerHTML,/initiative-status-select/);(nodes['initiative-status-select']??=new Node()).value='FINALIZADO';nodes['modal-confirm'].onclick();
  assert.equal(a.state.initiatives[0].administrativeStatus,'FINALIZADO');assert.equal(a.state.initiatives[0].progress,100);assert.equal(w.DemoData.load()[0].administrativeStatus,'FINALIZADO');assert.equal(a.state.initiatives[0].evolutions[0].title,'Status da iniciativa atualizado');
  api.changeStatus();nodes['initiative-status-select'].value='EM EXECUÇÃO';const saveData=w.DemoData.save;w.DemoData.save=()=>false;nodes['modal-confirm'].onclick();assert.equal(a.state.initiatives[0].administrativeStatus,'FINALIZADO');assert.equal(nodes['app-modal'].hidden,false);w.DemoData.save=saveData;
  api.changeProgress();const percentage=nodes['initiative-progress-number'];assert.match(nodes['modal-body'].innerHTML,/initiative-progress-preview/);percentage.value='101';nodes['modal-confirm'].onclick();assert.equal(a.state.initiatives[0].progress,100);assert.equal(nodes['app-modal'].hidden,false);
  percentage.value='45.5';percentage.fire('input');assert.equal(nodes['initiative-progress-preview'].value,'45.5');assert.equal(nodes['initiative-progress-output'].textContent,'45.5%');nodes['modal-confirm'].onclick();assert.equal(a.state.initiatives[0].progress,45.5);assert.equal(w.DemoData.load()[0].progress,45.5);assert.equal(a.state.initiatives[0].administrativeStatus,'FINALIZADO');assert.equal(a.state.initiatives[0].evolutions[0].title,'Progresso atualizado');
  a.state.initiatives[0].statusReports=[{date:'2026-09-01',progress:30},{date:'2026-10-01',progress:45.5}];
  api.changeProgress();nodes['initiative-progress-number'].value='60';w.DemoData.save=()=>false;nodes['modal-confirm'].onclick();assert.equal(a.state.initiatives[0].progress,45.5);assert.equal(a.state.initiatives[0].statusReports[1].progress,45.5);assert.equal(nodes['app-modal'].hidden,false);w.DemoData.save=saveData;
  nodes['modal-confirm'].onclick();assert.equal(a.state.initiatives[0].statusReports[1].progress,60);assert.equal(a.state.initiatives[0].statusReports[0].progress,30);assert.equal(w.DemoData.load()[0].progress,60);
  const count=a.state.initiatives.length;w.DemoData.save=()=>false;a.renderInitiativeForm(null);assert.equal(api.save(draft),false);assert.equal(a.state.initiatives.length,count);
  a.state.params=[];a.renderSettings();assert.match(main.innerHTML,/settings-card-grid/);
  a.state.params=['catalog',encodeURIComponent(w.AuxiliaryData.statusKey)];a.renderSettings();assert.match(main.innerHTML,/<th>Cor<\/th>/);
  a.state.params=['organization','sectors'];a.renderSettings();assert.match(main.innerHTML,/Estrutura organizacional/);
  a.state.params=['catalog','%invalid'];a.renderSettings();assert.match(main.innerHTML,/Conteúdo não encontrado/);
});
test('incomplete numeric input is rejected even when browser reports empty value',()=>{const f=fixture({title:'Teste'});f.root.form.controls['c.hst'].value='';f.root.form.controls['c.hst'].validity.badInput=true;f.root.form.fire('submit');assert.equal(f.saved.length,0);});
test('existing initiatives have six tabs and reuse the same field layout without cancel-edit buttons',()=>{const f=fixture({id:'INI-900',title:'Existente',manager:'Eduardo de Borba Severo'});assert.equal(f.root.tabs.length,6);assert.match(f.root.html,/data-mvp-tab="5">Visão Geral/);assert.match(f.root.html,/mvp-col-6"><label for="mvp-title"/);assert.match(f.root.html,/mvp-col-2"><label for="mvp-report-type"/);assert.match(f.root.html,/Anexos da iniciativa/);assert.doesNotMatch(f.root.html,/Cancelar edição|acompanhamento\)/);assert.equal(f.root.form.controls.manager.value,'Eduardo de Borba Severo');});
test('auxiliary seed is idempotent and does not overwrite edits or inactive records',()=>{const w=environment(),a=w.AuxiliaryData,row=a.list('Tipos de Iniciativas')[0],count=a.list('Tipos de Iniciativas').length;assert.equal(a.save(row.key,{name:'Tipo alterado',active:false},row.id).ok,true);w.testReloadCatalogs();const loaded=w.AuxiliaryData.list(row.key);assert.equal(loaded.length,count);assert.equal(loaded[0].id,row.id);assert.equal(loaded[0].name,'Tipo alterado');assert.equal(loaded[0].active,false);});
test('auxiliary duplicate names are rejected, points remain optional and parents are stable',()=>{const w=environment(),a=w.AuxiliaryData,dep=a.list('Departamentos')[0],sector=a.list('Setores',{parentId:dep.id})[0];assert.equal(a.save('Departamentos',{name:' direção '}).ok,false);const added=a.save('Departamentos',{name:'Novo departamento'});assert.equal(added.ok,true);assert.equal(a.save('Setores',{name:'Novo setor',parentId:added.row.id}).ok,true);assert.equal(a.save('Setores',{name:sector.name,parentId:added.row.id},sector.id).ok,false);assert.equal(a.list('Criticidade')[0].points,null);const c=a.list('Criticidade')[0];assert.equal(a.save(c.key,{...c,points:2.5},c.id).row.points,2.5);assert.equal(a.save(c.key,{...c,points:'inválido'},c.id).ok,false);});
test('renames preserve initiative references, including department-sector and report owner',()=>{const w=environment(),a=w.AuxiliaryData,manager=a.list('Gerentes de Projetos')[0],dep=a.list('Departamentos')[0],sector=a.list('Setores',{parentId:dep.id})[0];const item=a.bindRecord({id:'INI-901',title:'Vínculos',manager:manager.name,department:dep.name,sector:sector.name,mvp:{classification:{},members:[],areas:[],stakeholders:[]},statusReports:[{owner:manager.name}]});a.save(manager.key,{...manager,name:'GP renomeado'},manager.id);a.save(dep.key,{...dep,name:'Departamento renomeado'},dep.id);const resolved=w.MvpViews.project(item);assert.equal(resolved.manager,'GP renomeado');assert.equal(resolved.statusReports[0].owner,'GP renomeado');assert.equal(resolved.department,'Departamento renomeado');assert.equal(resolved.sector,sector.name);assert.equal(resolved.catalogRefs.manager,manager.id);item.manager=a.list(manager.key)[1].name;assert.notEqual(a.bindRecord(item).catalogRefs.manager,manager.id);});
test('inactive options stay on existing links but are absent from new fields and reports',()=>{const f=fixture(),a=f.w.AuxiliaryData,row=a.list('Gerentes de Projetos')[0];a.save(row.key,{...row,active:false},row.id);const root=new Root();f.w.InitiativeEditor.mount(root,{id:'INI-902',title:'GP inativo',manager:row.name},f.api);assert.match(root.form.controls.manager.innerHTML||root.html,/inativo/);const fresh=new Root();f.w.InitiativeEditor.mount(fresh,null,f.api);const managerHtml=fresh.html.match(/<select id="mvp-manager"[\s\S]*?<\/select>/)[0];assert.doesNotMatch(managerHtml,new RegExp(row.name));assert.ok(a.names(row.key,row.name).includes(row.name));assert.ok(!a.names(row.key).includes(row.name));});
test('overview shows registered data, counts and latest report without legacy risk or deadline indicators',()=>{const w=environment(),item=w.MvpViews.project({id:'INI-903',title:'Painel',manager:'GP informado',department:'DSUP',progress:40,description:'Objetivo registrado',mvp:{classification:{hst:30,ditic:'Pesquisa'},members:[{name:'Um'}],areas:['DITIC'],stakeholders:['Parte']},files:[{name:'arquivo.txt'}],statusReports:[{date:'2025-01-01',achievements:'Antigo'},{date:'2026-10-21',type:'Ordinário',monitoringStatus:'Em dia',achievements:'Recente'}],risk:'Crítico',end:'2000-01-01'});const html=w.MvpViews.overview(item);assert.match(html,/Objetivo registrado|Recente/);assert.match(html,/21\/10\/2026/);assert.doesNotMatch(html,/Antigo|Crítico|2000-01-01/);assert.match(w.MvpViews.summaryMetrics(item),/30 horas/);assert.doesNotMatch(html,/mvp-summary-metrics|Indicadores da Iniciativa/);assert.match(w.MvpViews.overview(w.MvpViews.project({title:'Vazio'})),/Não informado/);});
test('MVP statistics and CSV use the same records and ignore unrelated legacy risk fields',()=>{const w=environment(),items=[w.MvpViews.project({id:'1',title:'A; "teste"',progress:20,mvp:{classification:{hst:10}}}),w.MvpViews.project({id:'2',title:'B',progress:80,mvp:{classification:{hst:5}}})],s=w.MvpViews.stats(items);assert.equal(s.total,2);assert.equal(s.progress,50);assert.equal(s.hst,15);const csv=w.MvpViews.csv(items);assert.equal(csv.charCodeAt(0),0xfeff);assert.match(csv,/"A; ""teste"""/);assert.doesNotMatch(csv,/Risco|Prazo|Impedimento/);});
test('filters, indicators and CSV agree and exclude archived initiatives',()=>{const w=environment(),root=new Root(),items=[{id:'1',title:'Alfa',progress:10,department:'DSUP'},{id:'2',title:'Beta',progress:60,department:'DPROJ'},{id:'3',title:'Beta arquivada',archived:true,progress:100,department:'DPROJ'}];let exported='';const view=w.MvpViews.mount(root,{route:'initiatives',items:()=>items,header:title=>`<h1>${title}</h1>`,metric:(label,value)=>`<p>${label}: ${value}</p>`,panel:()=>'',download:text=>exported=text});assert.equal(view.filtered().length,2);root.form.controls.search.value='Beta';const filter=root.querySelector('#mvp-filters');filter.controls=root.form.controls;filter.fire('submit');assert.equal(view.filtered().length,1);assert.equal(view.filtered()[0].id,'2');assert.match(root.html,/Conclusão média: 60%/);const target={dataset:{mvpView:'csv'},closest:s=>s==='[data-mvp-view]'?target:null};root.fire('click',target);assert.match(exported,/Beta/);assert.doesNotMatch(exported,/Alfa|arquivada/);});
test('all catalog groups are manageable and unavailable reports do not expose legacy indicators',()=>{const w=environment(),root=new Root(),api={header:(title,description)=>`<h1>${title}</h1><p>${description||''}</p>`,toast(){},audit(){}};w.AuxiliaryView.mount(root,api);assert.match(root.html,/Cadastros Auxiliares/);for(const key of w.AuxiliaryData.keys)assert.ok(root.html.includes(['Departamentos','Setores'].includes(key)?'#/settings/organization':w.AuxiliaryView.url(key)));const unsupported=new Root();w.MvpViews.mount(unsupported,{route:'critical',items:()=>[],header:(t,d)=>`<h1>${t}</h1><p>${d}</p>`});assert.match(unsupported.html,/fora do MVP/);assert.doesNotMatch(unsupported.html,/Decisões pendentes|Ranking/);});
test('dashboard has only aggregate indicators and diverse charts, without forms or initiative rows',()=>{const w=environment(),root=new Root(),rows=[{id:'1',title:'Título individual que não deve aparecer',administrativeStatus:'EM EXECUÇÃO',progress:50,department:'DSUP',initiativeType:'Tática',manager:'GP',mvp:{classification:{cycle:'CICLO 1'}}},{id:'2',archived:true,progress:100}];w.MvpViews.mount(root,{route:'dashboard',items:()=>rows,header:(t,d)=>`<h1>${t}</h1><p>${d}</p>`,metric:(t,n,ic,color)=>`<article data-color="${color}">${t}: ${n}</article>`,panel:(t,d,body)=>`<section><h2>${t}</h2>${body}</section>`});assert.doesNotMatch(root.html,/<form|<table|Título individual|HST estimadas|Vínculos de equipe|Documentos \/ Anexos|mvp-filters|data-mvp-view/);assert.match(root.html,/Total de Iniciativas: 1/);assert.match(root.html,/EM EXECUÇÃO: 1/);assert.match(root.html,/Conclusão média: 50%/);assert.match(root.html,/donut-wrap/);assert.match(root.html,/bar-chart/);assert.match(root.html,/column-chart/);assert.match(root.html,/#EEE600/);});
test('official status colors and contrast are centralized and editable without affecting report states',()=>{const w=environment(),a=w.AuxiliaryData,expected={'ABERTO':'#DDDDDD','EM PLANEJAMENTO':'#009966','EM EXECUÇÃO':'#EEE600','EM HOMOLOGAÇÃO':'#FF6400','EM AJUSTES':'#6699CC','FINALIZADO':'#6699CC','SUSPENSO':'#ACAA59','CANCELADO':'#D8D7B1'};for(const [name,color] of Object.entries(expected))assert.equal(a.find(a.statusKey,name).color,color);const row=a.find(a.statusKey,'EM EXECUÇÃO'),reportBefore=JSON.stringify(a.list('Status Report — Situação da Iniciativa'));assert.equal(a.save(row.key,{...row,color:'#123456'},row.id).ok,true);assert.equal(a.statusStyle('EM EXECUÇÃO').ink,'#FFFFFF');assert.equal(a.save(row.key,{...row,color:'red;display:none'},row.id).ok,false);assert.equal(a.statusStyle('EM EXECUÇÃO').color,'#123456');assert.match(a.statusBadge('EM EXECUÇÃO'),/#123456/);const item=w.MvpViews.project({id:'1',title:'Teste',administrativeStatus:'EM EXECUÇÃO',progress:10});assert.match(w.MvpViews.initiativeCard(item),/#123456/);assert.match(w.MvpViews.headerSummary(item),/#123456/);assert.equal(JSON.stringify(a.list('Status Report — Situação da Iniciativa')),reportBefore);});
test('status seed complement preserves renamed and inactive records, custom colors and optional points',()=>{const w=environment(),a=w.AuxiliaryData,row=a.find(a.statusKey,'EM PLANEJAMENTO');a.save(row.key,{...row,name:'Planejamento revisado',active:false,color:'#112233'},row.id);let rows=a.keys.flatMap(key=>a.list(key));const removed=rows.find(r=>r.key==='Tipos de Iniciativas');rows=rows.filter(r=>r.id!==removed.id);rows.find(r=>r.key===a.statusKey&&r.name==='ABERTO').color=undefined;w.testStoreCatalogs(rows);w.testReloadCatalogs();const next=w.AuxiliaryData;assert.equal(next.find(a.statusKey,'EM PLANEJAMENTO').id,row.id);assert.equal(next.find(a.statusKey,'EM PLANEJAMENTO').active,false);assert.equal(next.find(a.statusKey,'EM PLANEJAMENTO').color,'#112233');assert.equal(next.find(a.statusKey,'ABERTO').color,'#DDDDDD');assert.ok(next.find(removed.key,removed.name));assert.ok(next.list('Criticidade').every(r=>r.points===null));const count=next.keys.flatMap(key=>next.list(key)).length;w.testReloadCatalogs();assert.equal(w.AuxiliaryData.keys.flatMap(key=>w.AuxiliaryData.list(key)).length,count);});
test('settings maintenance edits color, preserves ID and confirms inactivation',()=>{const w=environment(),root=new Root(),messages=[],confirmations=[],a=w.AuxiliaryData,row=a.find(a.statusKey,'ABERTO');const api={header:(title,description,actions)=>`<h1>${title}</h1>${actions||''}`,toast:(...args)=>messages.push(args),audit(){},confirm:(_,fn)=>confirmations.push(fn)};w.AuxiliaryView.mount(root,api,a.statusKey);assert.match(root.html,/Novo Cadastro/);assert.match(root.html,/#DDDDDD/);assert.doesNotMatch(root.html,/id="aux-form"/);root.auxAction('edit',row.id);assert.match(root.html,/type="color"/);root.form.controls.color.value='#224466';const form=root.querySelector('#aux-form');form.controls=root.form.controls;form.fire('submit');assert.equal(a.find(a.statusKey,'ABERTO').id,row.id);assert.equal(a.find(a.statusKey,'ABERTO').color,'#224466');assert.equal(messages.length,1);root.auxAction('toggle',row.id);assert.equal(a.find(a.statusKey,'ABERTO').active,true);confirmations[0]();assert.equal(a.find(a.statusKey,'ABERTO').active,false);});
test('cards preserve full titles and current values, and the overview uses one saved progress value',()=>{const w=environment(),item=w.MvpViews.project({id:'INI-1',title:'Título longo <seguro>',department:'DSUP',sector:'Seção MICROINF',manager:'Pessoa',initiativeType:'Tática',administrativeStatus:'ABERTO',progress:37,mvp:{classification:{cycle:'CICLO 1'}}});const html=w.MvpViews.initiativeCard(item);assert.match(html,/title="Título longo &lt;seguro&gt;"/);for(const value of ['Departamento / Setor','Seção MICROINF','Pessoa','CICLO 1','37%'])assert.ok(html.includes(value));assert.doesNotMatch(html,/data-action="archive"/);const overview=w.MvpViews.overview(item);assert.doesNotMatch(overview,/mvp-executive-cover/);assert.match(w.MvpViews.headerSummary(item),/mvp-status-card/);assert.doesNotMatch(w.MvpViews.headerSummary(item),/status-badge/);assert.doesNotMatch(overview,/mvp-cover-progress|<progress/);assert.match(w.MvpViews.summaryMetrics(item),/37%/);});
test('completion bins include fractional boundaries once and empty charts do not invent counts',()=>{const w=environment(),bins=w.MvpViews.completionBands([0,25,25.5,50,50.1,75,75.1,100].map(progress=>({progress})));assert.deepEqual(Object.values(bins),[2,2,2,2]);assert.match(w.AppCharts.donut({},'iniciativas'),/Nenhum dado/);assert.doesNotMatch(w.AppCharts.donut({},'iniciativas'),/>1</);assert.equal(w.AppCharts.counts([{name:'__proto__'},{name:'constructor'}],'name').constructor,1);});
test('demo completion fills all MVP fields once and feeds persisted report statistics',()=>{
  const w=environment(),original=w.DemoData.generateInitiatives(),rows=original.map(w.DemoCompletion.complete);
  assert.equal(rows.length,200);assert.equal(original[0].mvp,undefined);
  for(const item of rows){for(const field of ['initiativeType','department','sector','administrativeStatus','manager','requester','sponsor','sei','scope','description','benefits','notes'])assert.ok(item[field],`${item.id}: ${field}`);for(const value of Object.values(item.mvp.classification))assert.notEqual(value,'');assert.ok(item.mvp.members.every(m=>m.name&&m.role&&m.hst));assert.ok(item.statusReports.every(r=>r.type&&r.date&&r.monitoringStatus&&r.owner&&r.achievements&&r.impediments&&r.nextSteps));assert.ok(item.files.length);assert.deepEqual(w.DemoCompletion.complete(item),item);}
  const custom=w.DemoCompletion.complete({id:'CUSTOM',title:'Manter título',mvp:{classification:{hst:0}},statusReports:[{achievements:'Texto preservado'}]});assert.equal(custom.title,'Manter título');assert.equal(custom.mvp.classification.hst,0);assert.equal(custom.statusReports[0].achievements,'Texto preservado');
  assert.ok(w.DemoData.save(rows));const saved=w.DemoData.load().map(w.MvpViews.project),stats=w.MvpViews.stats(saved);assert.equal(stats.reports,200);assert.equal(stats.lateReports,67);assert.ok(stats.hst>0);assert.doesNotMatch(w.MvpViews.csv(saved),/undefined/);
});
test('portfolio paginates twenty full-width cards and shows only requested metrics',()=>{
  const w=environment(),root=new Root(),items=w.DemoData.generateInitiatives().map(w.DemoCompletion.complete);
  w.MvpViews.mount(root,{route:'initiatives',items:()=>items,header:()=>'',metric:(t,n)=>`<p>${t}: ${n}</p>`,panel:()=>''});
  assert.equal((root.html.match(/<article class="mvp-initiative-card"/g)||[]).length,20);assert.match(root.html,/Página 1 de 10/);assert.match(root.html,/SR Atrasados: 67/);assert.match(root.html,/mvp-portfolio-filters/);assert.doesNotMatch(root.html,/HST estimadas|Vínculos de equipe|Documentos \/ Anexos|data-action="archive"|Protótipo com dados demonstrativos/);
  const target={dataset:{mvpView:'next'},closest:s=>s==='[data-mvp-view]'?target:null};root.fire('click',target);assert.match(root.html,/Página 2 de 10/);assert.equal((root.html.match(/<article class="mvp-initiative-card"/g)||[]).length,20);
});
test('new and existing forms expose project dates in 8/2/2 and persist edits',()=>{
  for(const source of [undefined,{id:'INI-068',title:'Existente',start:'2026-10-01',end:'2026-12-31'}]){
    const f=fixture(source),html=f.root.html;
    assert.match(html,/mvp-col-6[^>]*><label for="mvp-title"/);
    for(const key of ['start','end','actualEnd'])assert.match(html,new RegExp('mvp-col-2[^>]*><label for="mvp-'+key+'"'));
    assert.ok(html.indexOf('name="title"')<html.indexOf('name="start"'));assert.ok(html.indexOf('name="end"')<html.indexOf('name="initiativeType"'));
    for(const key of ['initiativeType','department','sector','requester','sponsor','sei','manager','c-owner'])assert.match(html,new RegExp('mvp-col-3[^>]*><label for="mvp-'+key+'"'));
    if(source)assert.equal(f.root.form.controls.start.value,source.start);
    f.set('title','Datas');f.set('start','2026-11-01');f.set('end','2026-10-31');f.root.form.fire('submit');assert.equal(f.saved.length,0);
    f.set('end','2026-11-30');f.root.form.fire('submit');assert.equal(f.saved[0].start,'2026-11-01');assert.equal(f.saved[0].end,'2026-11-30');
  }
  const f=fixture({title:'Inválida'});f.set('start','2026-02-30');f.root.form.fire('submit');assert.equal(f.saved.length,0);
});
test('latest report date uses calendar days, handles missing and future reports, and cards retain native links',()=>{
  const w=environment(),today=new Date(2026,9,21,23,30),format=w.MvpViews.lastReportLabel;
  assert.equal(format([{date:'2026-10-01'},{date:'2026-10-20'},{date:'2026-02-30'}],today),'20/10/2026 (1 dia)');
  assert.equal(format([{date:'2026-10-21'}],today),'21/10/2026 (0 dias)');
  assert.equal(format([{date:'2026-10-23'}],today),'23/10/2026 (em 2 dias)');assert.equal(format([],today),'Nenhum Status Report');
  const html=w.MvpViews.initiativeCard(w.MvpViews.project({id:'INI-068',title:'Abrir',statusReports:[{date:'2026-10-01'}]}));assert.match(html,/<dt>Último Status Report<\/dt>/);assert.match(html,/01\/10\/2026/);assert.match(html,/href="#\/initiative\/INI-068"/);assert.doesNotMatch(html,/data-action="duplicate"|Editar iniciativa|Abrir iniciativa|<footer/);
  const css=fs.readFileSync('assets/css/styles.css','utf8');assert.match(css,/h2 a::after\{[^}]*inset:0/);assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});
test('card highlights reports only after fifteen calendar days and displays project dates',()=>{
  const w=environment(),today=new Date(2026,9,21,23,30),info=w.MvpViews.lastReportInfo;
  assert.equal(info([{date:'2026-10-06'}],today).stale,false);
  assert.equal(info([{date:'2026-10-05'}],today).stale,true);
  assert.equal(info([{date:'2026-10-05'},{date:'2026-10-21'}],today).stale,false);
  assert.equal(info([{date:'2026-10-22'}],today).stale,false);assert.equal(info([],today).stale,false);
  const card=w.MvpViews.initiativeCard(w.MvpViews.project({id:'INI-068',title:'Datas',start:'2026-01-12',end:'2026-12-31',statusReports:[{date:'2020-01-01'}]}));
  assert.match(card,/<dt>Data de início<\/dt><dd>12\/01\/2026<\/dd>/);assert.match(card,/<dt>Previsão de término<\/dt><dd>31\/12\/2026<\/dd>/);assert.match(card,/class="mvp-report-stale"/);assert.match(card,/Sem atualização há mais de 15 dias/);
});
test('department codes share the original sequence across cards, overview, search and CSV without changing IDs',()=>{
  const w=environment(),source={id:'INI-068',title:'Projeto',department:'DSUP',progress:10},item=w.MvpViews.project(source);
  assert.equal(w.AuxiliaryData.initiativeCode(item),'DSUP-068');
  const card=w.MvpViews.initiativeCard(item);assert.match(card,/>DSUP-068<\/span>/);assert.match(card,/href="#\/initiative\/INI-068"/);assert.match(w.MvpViews.headerSummary(item),/>DSUP-068<\/span>/);assert.match(w.MvpViews.csv([item]),/"DSUP-068"/);assert.equal(source.id,'INI-068');
  assert.equal(w.AuxiliaryData.initiativeCode(w.AuxiliaryData.bindRecord({...item,department:'DPROJ'})),'DPROJ-068');
  const department=w.AuxiliaryData.find('Departamentos','DSUP');w.AuxiliaryData.save('Departamentos',{...department,name:'SUPORTE'},department.id);assert.equal(w.AuxiliaryData.initiativeCode(item),'SUPORTE-068');
  const root=new Root(),view=w.MvpViews.mount(root,{route:'initiatives',items:()=>[source],header:()=>'',metric:()=>'',panel:()=>''});root.form.controls.search.value='SUPORTE-068';const form=root.querySelector('#mvp-filters');form.controls=root.form.controls;form.fire('submit');assert.equal(view.filtered().length,1);
});
test('header metrics show numeric SR age and one colored interactive administrative status',()=>{
  const w=environment(),item=w.MvpViews.project({id:'INI-068',department:'DSUP',administrativeStatus:'EM EXECUÇÃO',statusReports:[{date:'2020-01-01'}]});
  const html=w.MvpViews.headerSummary(item);assert.match(html,/<small>Último Status Report<\/small><strong class="mvp-report-stale"[^>]*>\d+ dias<\/strong>/);assert.match(html,/--status-color:#EEE600/);assert.match(html,/data-mvp-action="initiative-status"/);assert.match(html,/<strong>EM EXECUÇÃO<\/strong>/);assert.doesNotMatch(html,/status-badge|<small>Integrantes<|<small>Status Reports</);
  const f=fixture({id:'INI-068',title:'Teste'});let opened=0;f.api.changeStatus=()=>opened++;f.root.action('initiative-status');assert.equal(opened,1);f.root.form.fire('input');f.root.action('initiative-status');assert.equal(opened,1);assert.match(f.messages.at(-1)[0],/Alterações pendentes/);
  assert.doesNotMatch(f.root.html,/name="administrativeStatus"/);assert.match(html,/data-mvp-action="initiative-progress"/);
  const fresh=fixture();assert.doesNotMatch(fresh.root.html,/name="administrativeStatus"/);fresh.set('title','Nova');fresh.root.form.fire('submit');assert.equal(fresh.saved[0].administrativeStatus,'ABERTO');
});
test('demo prioritization score sums selected options, updates live and survives reopening',()=>{
  for(const source of [undefined,{id:'INI-068',title:'Teste',mvp:{classification:{criticality:'ALTA',complexity:'BAIXA'}}}]){
    const f=fixture(source),score=f.root.querySelector('#mvp-priority-score'),c={...(source?.mvp.classification||{})};
    assert.equal(Number(score.textContent),f.w.InitiativeEditor.priorityScore(c));
    const fields={criticality:'Criticidade',complexity:'Complexidade',importance:'Importância para o TJRS',necessity:'Necessidade',impact:'Impacto no PE',legal:'Determinação Legal',deadline:'Prazo',budget:'Orçamento'};
    for(const [key,catalog] of Object.entries(fields)){c[key]=f.w.InitiativeOptions[catalog][0];f.set(`c.${key}`,c[key]);f.root.form.fire('change',f.root.form.controls[`c.${key}`]);assert.equal(Number(score.textContent),f.w.InitiativeEditor.priorityScore(c));}
    const expected=Object.entries(fields).reduce((sum,[key,catalog])=>sum+f.w.InitiativeEditor.demoPoints(catalog,c[key]),0);assert.equal(Number(score.textContent),expected);assert.ok(expected>0);
    f.set('title','Score');f.root.form.fire('submit');assert.equal(f.saved.length,1);const reopened=fixture(f.saved[0]);assert.equal(Number(reopened.root.querySelector('#mvp-priority-score').textContent),expected);
    f.set('c.criticality','');f.root.form.fire('change',f.root.form.controls['c.criticality']);assert.equal(Number(score.textContent),expected-f.w.InitiativeEditor.demoPoints('Criticidade',c.criticality));
  }
});
test('replans appear only for existing initiatives and retain drafts, counts and history',()=>{
  assert.doesNotMatch(fixture().root.html,/data-mvp-action="replan"/);
  for(const source of [{id:'INI-068',title:'Teste',end:'2026-12-31',replans:[{id:'OLD',newEnd:'2026-12-31',justification:'Anterior'}]}]){
    const f=fixture(source);f.set('title','Teste');f.set('start','2026-01-01');f.set('end','2026-12-31');f.set('actualEnd','2026-12-31');let context;
    f.api.replan=(c,add)=>{context=c;add({id:'NEW',newEnd:'2027-01-31',previousEnd:c.end,justification:'Revisão',attachment:null});};
    f.root.action('replan');assert.equal(context.entries.length,source?.replans.length||0);assert.equal(f.root.form.controls.actualEnd.value,'2027-01-31');assert.equal(f.root.form.controls.end.value,'2026-12-31');assert.equal(f.editor.isDirty(),true);f.root.form.fire('submit');
    assert.equal(f.saved[0].actualEnd,'2027-01-31');assert.equal(f.saved[0].end,'2026-12-31');assert.equal(f.saved[0].replans.length,(source?.replans.length||0)+1);
    const reopened=fixture(f.saved[0]);assert.match(reopened.root.html,new RegExp('Replanejamento \\('+f.saved[0].replans.length+'\\)'));if(source)assert.equal(source.replans.length,1);
  }
});
test('priority helpers exist for all eight fields and support click, focus and Escape without dirtying',()=>{
  const f=fixture();assert.equal((f.root.html.match(/data-priority-help=/g)||[]).length,8);assert.equal((f.root.html.match(/role="tooltip"/g)||[]).length,8);assert.match(f.root.html,/Planejamento Estratégico \(PE\)/);
  const button=new Node();button.dataset.priorityHelp='mvp-c-criticality';button.closest=selector=>selector==='[data-priority-help]'?button:null;button.setAttribute=(key,value)=>button[key]=value;
  const query=f.root.querySelectorAll.bind(f.root);f.root.querySelectorAll=selector=>selector==='[data-priority-help]'?[button]:query(selector);
  const tooltip=f.root.querySelector('#mvp-c-criticality-help');f.root.fire('click',button);assert.equal(tooltip.hidden,false);assert.equal(button['aria-expanded'],'true');f.root.fire('click',button);assert.equal(tooltip.hidden,true);
  f.root.fire('focusin',button);assert.equal(tooltip.hidden,false);for(const handler of f.root.handlers.keydown||[])if(!handler.signal?.aborted)handler.fn({key:'Escape',target:button,preventDefault(){}});assert.equal(tooltip.hidden,true);assert.equal(f.editor.isDirty(),false);
});
