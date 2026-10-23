(function () {
  'use strict';
  const KEY='sisegp-catalogs-v1', O=window.InitiativeOptions;
  const departmentSeeds=['DIREÇÃO','DSUP','DSISADM','DSISJUD','DPROD','DPROJ'];
  const priorities=['Criticidade','Complexidade','Importância para o TJRS','Necessidade','Impacto no PE','Determinação Legal','Prazo','Orçamento'];
  const keys=['Departamentos','Setores',...Object.keys(O).filter(k=>!departmentSeeds.includes(k))];
  const norm=v=>String(v||'').trim().normalize('NFC').toLocaleLowerCase('pt-BR');
  const copy=v=>JSON.parse(JSON.stringify(v));
  const statusKey='Status Administrativo da Iniciativa';
  const initialStatusColors={'ABERTO':'#DDDDDD','EM PLANEJAMENTO':'#009966','EM EXECUÇÃO':'#EEE600','EM HOMOLOGAÇÃO':'#FF6400','EM AJUSTES':'#6699CC','FINALIZADO':'#6699CC','SUSPENSO':'#ACAA59','CANCELADO':'#D8D7B1'};
  const validColor=value=>/^#[0-9a-f]{6}$/i.test(String(value||''));
  let records,readable=true;
  try { const value=localStorage.getItem(KEY); records=value===null?null:JSON.parse(value);if(value!==null&&(!Array.isArray(records)||records.some(r=>!r||typeof r.id!=='string'||typeof r.name!=='string'||!keys.includes(r.key))))throw new Error('Formato inválido'); }
  catch(error){records=null;readable=false;console.warn('Cadastros auxiliares não puderam ser lidos.',error);}
  // Seed once. Existing catalogs (including inactive/renamed rows) are authoritative.
  if(!records){records=[];const add=(key,name,parentId=null)=>{const row={id:`CAT-${records.length+1}`,key,name,active:true,parentId,points:null,aliases:[]};records.push(row);return row;};
    departmentSeeds.forEach(name=>{const dep=add('Departamentos',name);O[name].forEach(sector=>add('Setores',sector,dep.id));});
    keys.filter(k=>!['Departamentos','Setores'].includes(k)).forEach(key=>O[key].forEach(name=>add(key,name)));
    window.DemoData.managers.filter(m=>m.role.includes('GP')).forEach(m=>{if(!records.some(r=>r.key==='Gerentes de Projetos'&&r.name===m.name))add('Gerentes de Projetos',m.name).active=m.active;});
    if(readable)try{localStorage.setItem(KEY,JSON.stringify(records));}catch(error){console.warn('Carga auxiliar disponível somente em memória.',error);}
  }
  // Additive migration for previews saved before the independent strategic catalog.
  if(readable&&!records.some(r=>r.key==='Iniciativa Estratégica')){records=[...records,...O['Iniciativa Estratégica'].map((name,index)=>({id:`CAT-STRATEGIC-${index+1}`,key:'Iniciativa Estratégica',name,active:true,parentId:null,points:null,aliases:[]}))];try{localStorage.setItem(KEY,JSON.stringify(records));}catch(error){console.warn('Novo catálogo disponível somente em memória.',error);}}
  function find(key,value,id){return (id?records.find(r=>r.key===key&&r.id===id):null)||records.find(r=>r.key===key&&(r.name===value||(r.aliases||[]).includes(value)));}
  // Complement missing reference values; aliases count as existing after renames.
  if(readable){const next=copy(records);let changed=false;
    function ensure(key,name,parentId=null){let row=next.find(r=>r.key===key&&r.parentId===parentId&&[r.name,...(r.aliases||[])].includes(name));if(!row){row={id:`CAT-REF-${Date.now()}-${next.length}`,key,name,parentId,active:true,points:null,aliases:[]};next.push(row);changed=true;}return row;}
    // Preserve IDs and manual renames when updating the original axis labels.
    const previousAxes=['VALORIZAÇÃO REAL DAS PESSOAL','PARTICIPAÇÃO E TRANSPARÊNCIA','INOVAÇÃO COM FOCO EM RESULTADOS','GESTÃO DE DADOS PARA EFICIÊNCIA','ACELERAÇÃO ADMINISTRATIVA'];
    next.filter(row=>row.key==='Eixo').forEach(row=>{
      const index=previousAxes.indexOf(row.name);
      if(index!==-1&&!next.some(other=>other.id!==row.id&&other.key==='Eixo'&&[other.name,...(other.aliases||[])].includes(O.Eixo[index]))){row.aliases=[...new Set([...(row.aliases||[]),row.name])];row.name=O.Eixo[index];changed=true;}
      if(row.name==='OUTROS'&&row.active){row.active=false;changed=true;}
    });
    departmentSeeds.forEach(name=>{const parent=ensure('Departamentos',name);O[name].forEach(sector=>ensure('Setores',sector,parent.id));});
    keys.filter(k=>!['Departamentos','Setores'].includes(k)).forEach(key=>O[key].forEach(name=>ensure(key,name)));
    next.filter(r=>r.key===statusKey).forEach(row=>{if(!validColor(row.color)){const original=[row.name,...(row.aliases||[])].find(name=>Object.prototype.hasOwnProperty.call(initialStatusColors,name));row.color=initialStatusColors[original]||'#DDDDDD';changed=true;}});
    if(changed){try{localStorage.setItem(KEY,JSON.stringify(next));records=next;}catch(error){console.warn('Complemento dos cadastros disponível somente em memória.',error);records=next;}}
  }
  function statusStyle(name,id){const row=find(statusKey,name,id),color=validColor(row?.color)?row.color.toUpperCase():'#DDDDDD';const rgb=[1,3,5].map(offset=>parseInt(color.slice(offset,offset+2),16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));const luminance=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;return {color,ink:(luminance+.05)/.05>=4.5?'#000000':'#FFFFFF'};}
  function statusBadge(name,id){const style=statusStyle(name,id),text=window.AppCharts.escapeHtml(find(statusKey,name,id)?.name||name||'Não informado');return `<span class="status-badge" style="--status-color:${style.color};--status-ink:${style.ink}">${text}</span>`;}
  function list(key,{active=false,parentId}={}){return records.filter(r=>r.key===key&&(!active||r.active)&&(parentId===undefined||r.parentId===parentId)).map(copy);}
  function names(key,current='',parentId){const currentRow=records.find(r=>r.key===key&&(parentId===undefined||r.parentId===parentId)&&(r.name===current||(r.aliases||[]).includes(current)));return [...new Set([...list(key,{active:true,parentId}).map(r=>r.name),...(current&&currentRow?[currentRow.name]:current&&parentId===undefined?[current]:[])])];}
  function save(key,values,id){
    if(!readable)return {ok:false,error:'O cadastro local existente não pôde ser lido. Ele foi preservado; corrija a origem dos dados antes de gravar.'};
    if(!keys.includes(key))return {ok:false,error:'Cadastro inválido.'};
    const name=String(values.name||'').trim();if(!name)return {ok:false,error:'Informe o nome.'};
    const previous=id?records.find(r=>r.id===id&&r.key===key):null;if(id&&!previous)return {ok:false,error:'Registro não encontrado.'};
    const parentId=key==='Setores'?(values.parentId||previous?.parentId):null;
    if(key==='Setores'&&!records.some(r=>r.id===parentId&&r.key==='Departamentos'&&(r.active||r.id===previous?.parentId)))return {ok:false,error:'Selecione um departamento ativo.'};
    if(previous?.parentId&&previous.parentId!==parentId)return {ok:false,error:'O departamento de um setor existente não pode ser alterado. Cadastre outro setor para preservar os vínculos.'};
    if(records.some(r=>r.id!==id&&r.key===key&&r.parentId===parentId&&[r.name,...(r.aliases||[])].some(v=>norm(v)===norm(name))))return {ok:false,error:'Já existe um registro com esse nome neste cadastro.'};
    let points=null;if(priorities.includes(key)&&values.points!==''&&values.points!==undefined&&values.points!==null){points=Number(values.points);if(!Number.isFinite(points))return {ok:false,error:'Pontuação deve ser numérica ou ficar vazia.'};}
    const color=values.color??previous?.color??'#DDDDDD';if(key===statusKey&&!validColor(color))return {ok:false,error:'Informe uma cor hexadecimal no formato #RRGGBB.'};
    const row={...(previous||{}),id:previous?.id||`CAT-${Date.now()}-${Math.random().toString(36).slice(2)}`,key,name,parentId,points,active:values.active??previous?.active??true,aliases:previous?.aliases||[]};
    if(key===statusKey)row.color=color.toUpperCase();
    if(previous&&previous.name!==name)row.aliases=[...new Set([...row.aliases,previous.name])];
    const next=previous?records.map(r=>r.id===id?row:r):[...records,row];
    try{localStorage.setItem(KEY,JSON.stringify(next));records=next;return {ok:true,row:copy(row)};}catch(_){return {ok:false,error:'Não foi possível gravar os cadastros neste navegador.'};}
  }
  function initiativeCode(item){const department=find('Departamentos',item.department,item.catalogRefs?.department)?.name||item.department||'SEM-DEPARTAMENTO';const number=String(item.id||'').match(/(\d+)$/)?.[1];return `${department}-${number?number.padStart(3,'0'):String(item.id||'SEM-NÚMERO')}`;}
  const bindings={initiativeType:'Tipos de Iniciativas',department:'Departamentos',sector:'Setores',administrativeStatus:'Status Administrativo da Iniciativa',manager:'Gerentes de Projetos',ditic:'Classificação DITIC',strategic:'Iniciativa Estratégica',biennium:'Biênio — PDTIC',axis:'Eixo',cycle:'Ciclo',enticjud:'ENTICJUD',objective:'Objetivo Estratégico',criticality:'Criticidade',complexity:'Complexidade',importance:'Importância para o TJRS',necessity:'Necessidade',impact:'Impacto no PE',legal:'Determinação Legal',deadline:'Prazo',budget:'Orçamento'};
  function resolveRecord(source){const item=copy(source),refs=item.catalogRefs||{};
    function bind(object,field,key,ref){const row=find(key,object[field],refs[ref]);if(row){object[field]=row.name;refs[ref]=row.id;}}
    ['initiativeType','department','administrativeStatus','manager'].forEach(k=>bind(item,k,bindings[k],k));
    const sector=records.find(r=>r.key==='Setores'&&r.parentId===find('Departamentos',item.department)?.id&&(r.id===refs.sector||r.name===item.sector||(r.aliases||[]).includes(item.sector)));if(sector){item.sector=sector.name;refs.sector=sector.id;}
    if(item.mvp){Object.keys(item.mvp.classification||{}).forEach(k=>{if(bindings[k])bind(item.mvp.classification,k,bindings[k],`c.${k}`);});item.mvp.areas=(item.mvp.areas||[]).map((name,i)=>{const row=find('Áreas Envolvidas',name,refs[`area.${i}`]);if(row){refs[`area.${i}`]=row.id;return row.name;}return name;});}
    (item.statusReports||[]).forEach(r=>{r.catalogRefs=r.catalogRefs||{};for(const [field,key] of [['type','Status Report — Tipo de Relatório'],['monitoringStatus','Status Report — Situação da Iniciativa'],['owner','Gerentes de Projetos']]){const row=find(key,r[field],r.catalogRefs[field]);if(row){r[field]=row.name;r.catalogRefs[field]=row.id;}}});
    item.catalogRefs=refs;return item;
  }
  // Rebind edited values; old reference IDs must never override a new selection.
  function bindRecord(source){const item=copy(source);delete item.catalogRefs;(item.statusReports||[]).forEach(r=>delete r.catalogRefs);return resolveRecord(item);}
  window.AuxiliaryData={key:KEY,keys,priorities,list,names,find,save,resolveRecord,bindRecord,statusKey,statusStyle,statusBadge,validColor,initiativeCode};
}());
