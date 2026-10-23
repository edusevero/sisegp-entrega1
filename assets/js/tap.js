(function () {
  'use strict';
  const e=value=>window.AppCharts.escapeHtml(String(value??''));
  const fields=[
    ['sectorManager','Gerente do setor','text'],
    ['duration','Duração estimada (meses)','number'],
    ['problem','Problema ou risco atual','textarea'],
    ['need','Necessidade da iniciativa','textarea'],
    ['impact','Impacto institucional','textarea'],
    ['smart','Objetivos do projeto — SMART','textarea'],
    ['includes','Escopo — inclui','textarea'],
    ['excludes','Escopo — não inclui','textarea'],
    ['deliverables','Entregas principais','textarea'],
    ['governance','Matriz de governança','textarea'],
    ['schedule','Cronograma macro complementar','textarea'],
    ['assumptions','Premissas','textarea'],
    ['constraints','Restrições','textarea'],
    ['risks','Riscos de alto nível','textarea'],
    ['success','Critérios de sucesso (opcional)','textarea'],
    ['acceptance','Critérios de aceite','textarea'],
    ['place','Local de emissão','text'],
    ['date','Data de emissão','date']
  ];
  const date=value=>window.InitiativeEditor.validCalendarDate(value)?value.split('-').reverse().join('/'):'Não informado';
  function defaults(item,today){
    const members=item.mvp?.members||[];
    const start=item.start,end=item.end;
    const months=window.InitiativeEditor.validCalendarDate(start)&&window.InitiativeEditor.validCalendarDate(end)&&end>=start?Math.round((new Date(end+'T12:00:00')-new Date(start+'T12:00:00'))/86400000/30.4375*10)/10:'';
    return Object.assign({sectorManager:'',duration:months,problem:'',need:'',impact:item.benefits||'',smart:item.description||'',includes:item.scope||'',excludes:'',deliverables:'',governance:members.map(m=>`${m.name} | | ${m.role||''}`).join('\n'),schedule:'',assumptions:'',constraints:'',risks:'',success:'',acceptance:'',place:'Porto Alegre',date:today},item.tap||{});
  }
  function rows(text){return String(text||'').split('\n').filter(line=>line.trim()).map(line=>line.split('|').map(cell=>cell.trim()));}
  function table(headers,data){return `<table><thead><tr>${headers.map(h=>`<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${data.length?data.map(row=>`<tr>${headers.map((_,i)=>`<td>${e(row[i]||'Não informado')}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}">Não informado</td></tr>`}</tbody></table>`;}
  function layout(title,content){
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${e(title)}</title><style>
      @page{size:A4 portrait;margin:18mm 17mm}*{box-sizing:border-box}body{font:11pt Arial,Helvetica,sans-serif;color:#111;margin:0;background:white}main{max-width:180mm;margin:24px auto}header{text-align:center;border-bottom:2px solid #333;padding-bottom:12px}h1{font-size:17pt;margin:8px 0}h2{font-size:11pt;background:#eee;padding:8px;margin:20px 0 8px;break-after:avoid}h3{font-size:11pt;margin:12px 0 4px;break-after:avoid}p{line-height:1.45;overflow-wrap:anywhere}.text{white-space:pre-wrap}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10pt}th,td{border:1px solid #aaa;text-align:left;padding:8px;vertical-align:top;white-space:pre-wrap;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}th{background:#eee}footer{margin-top:24px}.controls{padding:14px;background:#f3f5f7;text-align:center}.controls button{padding:10px 18px;cursor:pointer}@media print{main{margin:0;max-width:none}.controls{display:none}}
      </style></head><body><div class="controls"><button id="tap-print" type="button">Salvar como PDF / Imprimir</button><p>Selecione “Salvar como PDF” no destino da impressão.</p></div><main>${content}</main></body></html>`;
  }
  function html(item,tap){
    const text=value=>`<p class="text">${e(value||'Não informado')}</p>`;
    const section=(title,body)=>`<section><h2>${e(title)}</h2>${body}</section>`;
    const code=item.id?window.AuxiliaryData.initiativeCode(item):'Iniciativa ainda não salva';
    const data=[['Nome do projeto',item.title],['Setor responsável',[item.department,item.sector].filter(Boolean).join(' / ')],['Gerente do setor',tap.sectorManager],['Gerente de projeto',item.manager],['Áreas envolvidas',(item.mvp?.areas||[]).join(', ')],['Data de início',date(item.start)],['Término previsto',date(item.end)],['Duração estimada',tap.duration!==''?`${tap.duration} meses`:'']];
    return layout('TAP - '+(item.title||code),`<header><p>Tribunal de Justiça do Rio Grande do Sul</p><h1>TAP – TERMO DE ABERTURA DE PROJETO</h1></header>
      ${section('IDENTIFICAÇÃO DO PROJETO',text('Gestão de iniciativas — '+code)+text(item.title))}
      ${section('DADOS DO PROJETO',table(['Campo','Informação'],data))}
      ${section('OBJETIVO DO DOCUMENTO',text('Formalizar a autorização do projeto e estabelecer diretrizes de execução, governança e sucesso, complementando as informações registradas no sistema institucional.'))}
      ${section('JUSTIFICATIVA E ALINHAMENTO ESTRATÉGICO','<h3>Problema ou risco atual</h3>'+text(tap.problem)+'<h3>Necessidade da iniciativa</h3>'+text(tap.need)+'<h3>Impacto institucional</h3>'+text(tap.impact)+ '<h3>Eixo estratégico</h3>'+text(item.mvp?.classification?.axis))}
      ${section('OBJETIVOS DO PROJETO – SMART',text(tap.smart))}
      ${section('ESCOPO DO PROJETO (REFERENCIADO + ESTRUTURADO)','<h3>Descrição geral</h3>'+text(item.scope)+'<h3>Inclui</h3>'+text(tap.includes)+'<h3>Não inclui</h3>'+text(tap.excludes))}
      ${section('ENTREGAS PRINCIPAIS',text(tap.deliverables))}
      ${section('MATRIZ DE GOVERNANÇA',table(['Nome / Grupo','Área','Qualificação / Papel'],rows(tap.governance)))}
      ${section('CRONOGRAMA MACRO',table(['Marco','Previsão','Observação'],[['Início',date(item.start),''],['Término',date(item.end),''],...rows(tap.schedule)]))}
      ${[['PREMISSAS','assumptions'],['RESTRIÇÕES','constraints'],['RISCOS DE ALTO NÍVEL','risks'],['CRITÉRIOS DE SUCESSO (opcional)','success'],['CRITÉRIOS DE ACEITE','acceptance']].map(([title,key])=>section(title,text(tap[key]))).join('')}
      <footer>${e(tap.place)}, ${e(date(tap.date))}</footer>`);
  }
  function open(item,api,onComplete){
    const initial=defaults(item,api.today());
    const hint={governance:'Uma linha por pessoa/grupo: Nome | Área | Qualificação/Papel. Complete as áreas dos integrantes aproveitados da equipe.',schedule:'Uma linha por marco: Marco | Previsão (DD/MM/AAAA) | Observação. Início e término são incluídos automaticamente.'};
    api.modal({title:'Gerar TAP',confirm:'Gerar TAP / PDF',body:`<p>Confira os complementos do modelo. Descrição, benefício e escopo são sugestões para revisão. Nome, setor, GP, áreas e datas serão aproveitados da iniciativa, incluindo alterações ainda não salvas.</p><p>Os complementos ficam no rascunho após gerar. Use Salvar iniciativa para preservá-los. A geração não comprova aprovação ou assinatura.</p><div class="tap-fields">${fields.map(([key,label,type])=>`<div class="field"><label for="tap-${key}">${e(label)}</label>${type==='textarea'?`<textarea id="tap-${key}" rows="3" ${hint[key]?`aria-describedby="tap-${key}-hint"`:''}>${e(initial[key])}</textarea>`:`<input id="tap-${key}" type="${type}" value="${e(initial[key])}" ${type==='number'?'min="0" step="any"':''}>`}${hint[key]?`<small id="tap-${key}-hint">${e(hint[key])}</small>`:''}</div>`).join('')}</div>`,onConfirm:()=>{
      const tap={};
      for(const [key,,type] of fields){const input=document.getElementById('tap-'+key);tap[key]=input.value.trim();if((type==='number'&&(input.validity.badInput||tap[key]!==''&&(!Number.isFinite(Number(tap[key]))||Number(tap[key])<0)))||(type==='date'&&!window.InitiativeEditor.validCalendarDate(tap[key]))){api.toast('Confira o campo',key==='duration'?'Informe uma duração não negativa.':'Informe uma data de emissão válida.','warning');input.focus();return false;}}
      for(const [key,label] of [['governance','governança'],['schedule','cronograma']]){if(rows(tap[key]).some(row=>row.length!==3||!row[0])){api.toast('Confira a tabela de '+label,'Use três colunas separadas por | em cada linha.','warning');document.getElementById('tap-'+key).focus();return false;}}
      const preview=window.open('','_blank');
      if(!preview){api.toast('Permita a abertura da prévia','O navegador bloqueou a janela do TAP. Os campos permanecem neste modal.','warning');return false;}
      try{preview.opener=null;preview.document.open();preview.document.write(html(item,tap));preview.document.close();preview.document.getElementById('tap-print').addEventListener('click',()=>preview.print());onComplete(tap);}
      catch(error){preview.close();api.toast('Não foi possível gerar o TAP','Tente novamente. Os campos permanecem no modal.','danger');return false;}
    }});
  }
  window.InitiativeTap={fields,defaults,html,open,layout,table,date};
}());
