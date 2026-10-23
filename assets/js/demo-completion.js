(function () {
  'use strict';
  // Migração aditiva, executada uma vez por registro; nunca substitui valores preenchidos.
  const A=window.AuxiliaryData;
  function complete(source,index=0){
    if(source.demoCompletionVersion)return source;
    const item=A.resolveRecord(source),pick=(key,offset=0,parentId)=>{const rows=A.list(key).filter(r=>r.active&&(!parentId||r.parentId===parentId));return rows.length?rows[(index+offset)%rows.length].name:'';};
    const fill=(object,key,value)=>{if(object[key]===undefined||object[key]===null||object[key]==='')object[key]=value;};
    fill(item,'initiativeType',pick('Tipos de Iniciativas'));fill(item,'department',pick('Departamentos'));
    fill(item,'sector',pick('Setores',0,A.find('Departamentos',item.department)?.id));
    fill(item,'manager',pick('Gerentes de Projetos'));
    const lifecycle=window.InitiativeEditor.lifecycle;
    fill(item,'administrativeStatus',Object.keys(lifecycle).find(k=>lifecycle[k]===item.status)||pick(A.statusKey));
    if(item.progress===undefined||item.progress===null||item.progress==='')item.progress=item.administrativeStatus==='FINALIZADO'?100:index%101;
    item.mvp=item.mvp||{};const m=item.mvp;m.classification=m.classification||{};
    const fields={ditic:'Classificação DITIC',strategic:'Iniciativa Estratégica',biennium:'Biênio — PDTIC',axis:'Eixo',cycle:'Ciclo',enticjud:'ENTICJUD',objective:'Objetivo Estratégico',criticality:'Criticidade',complexity:'Complexidade',importance:'Importância para o TJRS',necessity:'Necessidade',impact:'Impacto no PE',legal:'Determinação Legal',deadline:'Prazo',budget:'Orçamento'};
    Object.entries(fields).forEach(([field,key],offset)=>fill(m.classification,field,field==='strategic'?(item.strategic?'SIM':'NÃO'):pick(key,offset)));
    fill(m.classification,'owner',`Responsável demonstrativo ${item.id}`);fill(m.classification,'hst',80+index%20*16);
    if(!m.areas?.length)m.areas=[pick('Áreas Envolvidas')].filter(Boolean);
    if(!m.stakeholders?.length)m.stakeholders=['Área demandante (exemplo)','Equipe técnica (exemplo)'];
    if(!m.members?.length)m.members=[{name:`Integrante demonstrativo ${item.id}`,role:'Analista de projeto',hst:40}];
    m.members.forEach((member,i)=>{fill(member,'name',`Integrante demonstrativo ${item.id}-${i+1}`);fill(member,'role','Analista de projeto');fill(member,'hst',40);});
    for(const [key,value] of Object.entries({title:`Iniciativa demonstrativa ${item.id}`,requester:'Área demandante (exemplo)',sponsor:'Patrocinador demonstrativo',sei:`DEMO-${item.id}`,scope:'Planejamento, execução, validação e acompanhamento das entregas simuladas.',description:'Iniciativa demonstrativa para acompanhamento institucional.',benefits:'Melhoria dos serviços e padronização dos processos.',notes:'Planejamento de exemplo para validação das funcionalidades.'}))fill(item,key,value);
    if(!item.files?.length)item.files=[{name:`Plano_demonstrativo_${item.id}.pdf`}];
    item.files.forEach((file,i)=>{for(const [key,value] of Object.entries({id:`${item.id}-DEMO-F${i+1}`,origin:i?'document':'attachment',size:102400,mime:/\.xlsx$/i.test(file.name)?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'application/pdf',extension:(file.name||'pdf').split('.').pop(),date:item.updated||item.start||'2026-10-21',owner:item.manager,category:'Planejamento',version:'1.0'}))fill(file,key,value);if(!file.tags?.length)file.tags=['Exemplo'];});
    if(!item.statusReports?.length)item.statusReports=[{}];
    item.statusReports.forEach((report,i)=>{for(const [key,value] of Object.entries({id:`${item.id}-DEMO-SR${i+1}`,type:pick('Status Report — Tipo de Relatório',i),date:item.updated||item.start||'2026-10-21',monitoringStatus:pick('Status Report — Situação da Iniciativa',i),owner:item.manager,achievements:'Entregas demonstrativas revisadas e planejamento consolidado.',impediments:'Sem impedimentos adicionais no período demonstrativo.',nextSteps:'Validar as entregas e acompanhar os próximos marcos.'}))fill(report,key,value);});
    item.demoCompletionVersion=1;return A.resolveRecord(item);
  }
  window.DemoCompletion={complete};
}());
