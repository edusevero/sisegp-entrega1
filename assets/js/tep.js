(function () {
  'use strict';
  const e=value=>window.AppCharts.escapeHtml(String(value??''));
  const finalStatuses=['Concluído','Concluído com ressalvas','Cancelado'];
  const evaluations=['Atendido','Parcial','Não atendido'];
  const fields=[
    ['director','Diretor(a) do departamento','text'],
    ['sectorManager','Gerente do setor','text'],
    ['duration','Duração estimada (meses)','number'],
    ['result','Resultado entregue','textarea'],
    ['finalStatus','Status final *','select',finalStatuses],
    ['deadlineEvaluation','Avaliação — Prazo *','select',evaluations],
    ['scopeEvaluation','Avaliação — Escopo *','select',evaluations],
    ['qualityEvaluation','Avaliação — Qualidade *','select',evaluations],
    ['diticApprover','Aprovador — Representante DITIC','text'],
    ['sponsorApprover','Aprovador — Patrocinador','text'],
    ['managerApprover','Aprovador — Gerente de projetos','text'],
    ['place','Local de emissão','text'],
    ['date','Data de emissão','date']
  ];
  function defaults(item,today){
    const tap=window.InitiativeTap.defaults(item,today);
    const values=Object.assign({director:'',sectorManager:tap.sectorManager,duration:tap.duration,result:'',finalStatus:'',deadlineEvaluation:'',scopeEvaluation:'',qualityEvaluation:'',diticApprover:'',sponsorApprover:item.sponsor||'',managerApprover:item.manager||'',pendingActions:[],place:'Porto Alegre',date:today},item.tep||{});
    values.pendingActions=Array.isArray(values.pendingActions)?values.pendingActions.map(row=>({description:String(row.description||''),backlog:String(row.backlog||'')})):[];
    return values;
  }
  function html(item,tep){
    const shared=window.InitiativeTap,text=value=>`<p class="text">${e(value||'Não informado')}</p>`;
    const section=(title,body)=>`<section><h2>${e(title)}</h2>${body}</section>`;
    const code=item.id?window.AuxiliaryData.initiativeCode(item):'Iniciativa ainda não salva';
    const data=[['Diretor(a) do departamento',tep.director],['Setor responsável',[item.department,item.sector].filter(Boolean).join(' / ')],['Gerente do setor',tep.sectorManager],['Gerente de projeto',item.manager],['Áreas envolvidas',(item.mvp?.areas||[]).join(', ')],['Data de início',shared.date(item.start)],['Término previsto',shared.date(item.end)],['Duração estimada',tep.duration!==''?`${tep.duration} meses`:'']];
    return shared.layout('TEP - '+(item.title||code),`<header><p>Tribunal de Justiça do Rio Grande do Sul</p><h1>TEP – TERMO DE ENCERRAMENTO DE PROJETO</h1></header>
      ${section('IDENTIFICAÇÃO DO PROJETO',text('Gestão de iniciativas — '+code)+text(item.title))}
      ${section('DADOS DO PROJETO',shared.table(['Campo','Informação'],data))}
      ${section('OBJETIVO DO DOCUMENTO',text('Formalizar o encerramento do projeto, registrando o cumprimento do escopo, os resultados alcançados e o aceite das partes interessadas.'))}
      ${section('RESULTADO ENTREGUE',text(tep.result))}
      ${section('STATUS FINAL',text(finalStatuses.includes(tep.finalStatus)?tep.finalStatus:''))}
      ${section('AVALIAÇÃO CONSOLIDADA',shared.table(['Critério','Status'],[['Prazo',tep.deadlineEvaluation],['Escopo',tep.scopeEvaluation],['Qualidade',tep.qualityEvaluation]]))}
      ${section('PENDÊNCIAS E AÇÕES PÓS-PROJETO',tep.pendingActions?.length?shared.table(['Pendência','Local de registro de backlog'],tep.pendingActions.map(row=>[row.description,row.backlog])):text('Nenhuma pendência informada.'))}
      ${section('APROVADORES',shared.table(['Representante DITIC','Patrocinador','Gerente de projetos'],[[tep.diticApprover,tep.sponsorApprover,tep.managerApprover]]))}
      <footer>${e(tep.place)}, ${e(shared.date(tep.date))}</footer>`);
  }
  function open(item,api,onComplete){
    const initial=defaults(item,api.today());let serial=0;
    const pendency=row=>{const index=++serial;return `<div class="tep-pendency"><div class="field"><label for="tep-pendency-${index}">Pendência ${index}</label><input id="tep-pendency-${index}" data-tep-pendency-description type="text" value="${e(row.description)}"></div><div class="field"><label for="tep-backlog-${index}">Local de registro de backlog ${index}</label><input id="tep-backlog-${index}" data-tep-pendency-backlog type="text" value="${e(row.backlog)}"></div><button type="button" class="button button--ghost button--small" data-tep-remove-pendency aria-label="Remover pendência ${index}">Remover</button></div>`;};
    api.modal({title:'Gerar TEP',confirm:'Gerar TEP / PDF',body:`<p>Nome, setor, GP, áreas e datas serão aproveitados da iniciativa, incluindo alterações ainda não salvas. Confira os aprovadores sugeridos e preencha o resultado e as avaliações do encerramento.</p><p>Gerar o documento não altera o status da iniciativa nem registra assinatura ou aprovação. Salve a iniciativa para preservar os complementos.</p><div class="tap-fields">${fields.map(([key,label,type,options])=>`<div class="field"><label for="tep-${key}">${e(label)}</label>${type==='textarea'?`<textarea id="tep-${key}" rows="4">${e(initial[key])}</textarea>`:type==='select'?`<select id="tep-${key}" required><option value="">Selecione</option>${options.map(value=>`<option value="${e(value)}" ${initial[key]===value?'selected':''}>${e(value)}</option>`).join('')}</select>`:`<input id="tep-${key}" type="${type}" value="${e(initial[key])}" ${type==='number'?'min="0" step="any"':''}>`}</div>`).join('')}<h3>Pendências e ações pós-projeto</h3><div id="tep-pendencies">${(initial.pendingActions.length?initial.pendingActions:[{description:'',backlog:''}]).map(pendency).join('')}</div><button id="tep-add-pendency" type="button" class="button button--secondary">Adicionar pendência</button></div>`,onConfirm:()=>{
      const tep={};
      for(const [key,label,type,options] of fields){
        const input=document.getElementById('tep-'+key),value=input.value.trim();tep[key]=value;
        if(type==='select'&&!options.includes(value)||type==='number'&&(input.validity.badInput||value!==''&&(!Number.isFinite(Number(value))||Number(value)<0))||type==='date'&&!window.InitiativeEditor.validCalendarDate(value)){
          api.toast('Confira o campo',`Preencha ${label.replace(' *','')} com um valor válido.`,'warning');input.focus();return false;
        }
      }
      tep.pendingActions=[];
      for(const row of document.getElementById('tep-pendencies').querySelectorAll('.tep-pendency')){
        const descriptionInput=row.querySelector('[data-tep-pendency-description]'),backlogInput=row.querySelector('[data-tep-pendency-backlog]');
        const description=descriptionInput.value.trim(),backlog=backlogInput.value.trim();
        if(!description&&!backlog)continue;
        if(!description){api.toast('Informe a pendência','Descreva a pendência associada ao local de backlog.','warning');descriptionInput.focus();return false;}
        tep.pendingActions.push({description,backlog});
      }
      const preview=window.open('','_blank');
      if(!preview){api.toast('Permita a abertura da prévia','O navegador bloqueou a janela do TEP. Os campos permanecem neste modal.','warning');return false;}
      try{preview.opener=null;preview.document.open();preview.document.write(html(item,tep));preview.document.close();preview.document.getElementById('tap-print').addEventListener('click',()=>preview.print());onComplete(tep);}
      catch(error){preview.close();api.toast('Não foi possível gerar o TEP','Tente novamente. Os campos permanecem no modal.','danger');return false;}
    }});
    const container=document.getElementById('tep-pendencies'),add=document.getElementById('tep-add-pendency');
    add.addEventListener('click',()=>{container.insertAdjacentHTML('beforeend',pendency({description:'',backlog:''}));container.querySelector('.tep-pendency:last-child input').focus();});
    container.addEventListener('click',event=>{const button=event.target.closest('[data-tep-remove-pendency]');if(button){button.closest('.tep-pendency').remove();add.focus();}});
  }
  window.InitiativeTep={fields,defaults,html,open,finalStatuses,evaluations};
}());
