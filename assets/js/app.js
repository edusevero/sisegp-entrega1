(function () {
  'use strict';

  const D = window.DemoData;
  const C = window.AppCharts;
  const main = document.getElementById('conteudo');
  const AUDIT_KEY = 'sisegp-audit-v1';
  const legacyGpFirstName='Iri'+'ne';
  const loadedInitiatives = JSON.parse(JSON.stringify(D.load()).replaceAll(`${legacyGpFirstName} Vitoria Amaral de Lima`,'Carine Vitoria Amaral de Lima').replaceAll(`${legacyGpFirstName} Lima`,'Carine Lima').replaceAll(`${legacyGpFirstName.toLowerCase()}.lima@tjrs.jus.br`,'carine.lima@tjrs.jus.br'));
  const loadedAuditLogs = JSON.parse(JSON.stringify(loadAuditLogs()).replaceAll(`${legacyGpFirstName} Vitoria Amaral de Lima`,'Carine Vitoria Amaral de Lima').replaceAll(`${legacyGpFirstName} Lima`,'Carine Lima'));
  function loadAuditLogs(){try{const value=JSON.parse(localStorage.getItem(AUDIT_KEY)||'[]');return Array.isArray(value)?value:[];}catch(_){return [];}}
  const state = {
    initiatives: loadedInitiatives.map(window.DemoCompletion.complete),
    route: 'initiatives', params: [],
    initiativeView: localStorage.getItem('sisegp-view') || 'cards', page: 1, perPage: 20,
    filters: { search: '', manager: '', area: '', status: '', cycle: '', risk: '', criticality: '', strategic: '', impediment: '', delay: '', due: '', recent: '', progress: '', period: '' },
    sort: 'updated-desc', detailTab: 'overview', repositoryFolder: 'Todos', gpReport: D.managers[0].name, actionContext: null,
    editors: { meeting: null, statusReport: null, activity: null },
    auditLogs: loadedAuditLogs, logFilters: { search:'', type:'', level:'' }, logPage: 1, logsPerPage: 50,
    authenticated: sessionStorage.getItem('sisegp-authenticated') === '1'
  };
  state.initiatives.forEach(item=>{
    item.activities=item.activities||[];item.evolutions=item.evolutions||[];item.meetings=item.meetings||[];item.statusReports=item.statusReports||[];
    item.meetings.forEach(meeting=>{meeting.objectives=meeting.objectives||'Acompanhar o andamento e definir os próximos encaminhamentos.';meeting.documents=meeting.documents||[];});
    item.statusReports.forEach(report=>{report.achievements=report.achievements||report.summary||'';report.impediments=report.impediments||'';report.nextSteps=report.nextSteps||'';});
    item.evolutions.forEach(entry=>{if(/^(Iniciativa criada|Status report|Reunião |Item do cronograma|Arquivo inserido|Iniciativa atualizada|Progresso atualizado)/i.test(entry.title||'')){entry.automatic=true;entry.source='system';}});
    if(!item.evolutions.some(entry=>entry.title==='Iniciativa criada'))item.evolutions.push({date:item.start,time:'09:00',type:'Sistema',title:'Iniciativa criada',note:'Cadastro inicial realizado pelo gerente de projetos.',author:item.manager,automatic:true,source:'system'});
    if(item.statusReports.length&&!item.evolutions.some(entry=>entry.title==='Status report inserido'))item.evolutions.splice(Math.min(1,item.evolutions.length),0,{date:item.statusReports[0].date,time:'11:20',type:'Sistema',title:'Status report inserido',note:'Registro incluído pelo gerente de projetos.',author:item.manager,automatic:true,source:'system'});
    if(item.status==='Concluída'&&!item.evolutions.some(entry=>entry.title==='Entrega concluída'))item.evolutions.splice(Math.min(2,item.evolutions.length),0,{date:item.updated,time:'15:00',type:'Sistema',title:'Entrega concluída',note:'Conclusão registrada pelo gerente de projetos.',author:item.manager,automatic:true,source:'system'});
  });
  if(!sessionStorage.getItem('sisegp-access-logged')){addAuditLog({type:'Acesso',title:'Acesso ao SISEGP',details:'Sessão iniciada no sistema.',user:'Antônio Carlos da Luz Cepa',level:'info',source:'system'});sessionStorage.setItem('sisegp-access-logged','1');}
  window.addEventListener('error',event=>addAuditLog({type:'Erro',title:'Erro de execução',details:event.message||'Erro não identificado.',user:'Sistema',level:'danger',source:'system'}));
  window.addEventListener('unhandledrejection',event=>addAuditLog({type:'Erro',title:'Falha não tratada',details:String(event.reason||'Falha não identificada.'),user:'Sistema',level:'danger',source:'system'}));

  const icons = {
    home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>', 'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/>',
    'file-text': '<path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6"/>',
    folder: '<path d="M3 6h7l2 2h9v11H3z"/>', 'folder-plus': '<path d="M3 6h7l2 2h9v11H3zM12 11v5M9.5 13.5h5"/>',
    'bar-chart': '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', 'pie-chart': '<path d="M12 2v10h10A10 10 0 0 0 12 2Z"/><path d="M9 5a9 9 0 1 0 10 10H9z"/>',
    'alert-triangle': '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 9v5M12 17h.01"/>', ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    'user-cog': '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a6 6 0 0 1 10-4.5M19 14v2M19 20v2M15.5 16l1.7 1M20.8 19l1.7 1M15.5 20l1.7-1M20.8 17l1.7-1"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 0-1.8-1.2H3v-3.6h.2A2 2 0 0 0 5 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6a2 2 0 0 0 1.2-1.8V3h3.6v.2A2 2 0 0 0 15 5a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1A2 2 0 0 0 19.4 9a2 2 0 0 0 1.8 1.2h.2v3.6h-.2A2 2 0 0 0 19.4 15Z"/>',
    landmark: '<path d="m3 10 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>',
    'help-circle': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 3.1 2.7c-.6.2-.6.8-.6 1.3M12 17h.01"/>',
    'log-out': '<path d="M9 4H4v16h5M14 8l4 4-4 4M8 12h10"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7 15h10"/>', x: '<path d="m6 6 12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>', 'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>', printer: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/>',
    more: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', edit: '<path d="m4 16-1 5 5-1L19 9l-4-4L4 16ZM13.5 6.5l4 4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>', archive: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M2 3h20v4H2zM9 11h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>', flag: '<path d="M5 21V4M5 5h12l-2 4 2 4H5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>', 'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
    save: '<path d="M4 3h14l2 2v16H4zM8 3v6h8V3M8 21v-7h8v7"/>', arrowLeft: '<path d="m15 18-6-6 6-6"/>',
    activity: '<path d="M3 12h4l2-6 4 12 2-6h6"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    alert: '<path d="M12 3v10M12 18h.01"/>', shield: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
    file: '<path d="M6 2h8l4 4v16H6zM14 2v5h5"/>', star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', chevrons: '<path d="m7 17 5-5-5-5M13 17l5-5-5-5"/>',
    presentation: '<path d="M3 4h18v12H3zM8 21l4-5 4 5"/>', sparkles: '<path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3ZM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14ZM5 14l.7 1.8L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-1.2L5 14Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>'
  };

  function icon(name, label = '') {
    return `<span data-icon="${name}"${label ? ` aria-label="${escapeHtml(label)}"` : ' aria-hidden="true"'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.info}</svg></span>`;
  }
  function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]:empty').forEach(element => { element.innerHTML = icon(element.dataset.icon).replace(/^<span[^>]*>|<\/span>$/g, ''); }); }
  window.AppUI={icon,hydrateIcons};
  function escapeHtml(value) { return C.escapeHtml(value); }
  function formatDate(value) { if (!value) return 'Não informado'; const [y,m,d] = String(value).slice(0,10).split('-'); return y && m && d ? `${d}/${m}/${y}` : value; }
  function daysBetween(a, b = new Date()) { return Math.floor((new Date(b) - new Date(`${a}T12:00:00`)) / 86400000); }
  function shortName(name) { return D.managers.find(m => m.name === name)?.short || name; }
  function average(items, key) { return items.length ? Math.round(items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length) : 0; }
  function isDelayed(item) { return item.status === 'Atrasada' || (!['Concluída','Cancelada'].includes(item.status) && new Date(`${item.end}T23:59:00`) < new Date()); }
  function isStale(item) { return daysBetween(item.updated) > 30; }
  function isDueSoon(item) { const days = Math.ceil((new Date(`${item.end}T23:59:00`) - new Date()) / 86400000); return days >= 0 && days <= 30 && !['Concluída','Cancelada'].includes(item.status); }
  function badge(value, type, iconName = '') { return `<span class="badge badge--${type}">${iconName ? icon(iconName) : ''}${escapeHtml(value)}</span>`; }
  function statusBadge(status) { const official=Object.keys(window.InitiativeEditor.lifecycle).find(key=>window.InitiativeEditor.lifecycle[key]===status)||status;return window.AuxiliaryData.statusBadge(official); }
  function riskBadge(risk) { const type = risk === 'Crítico' || risk === 'Alto' ? 'danger' : risk === 'Médio' ? 'warning' : 'success'; return badge(risk, type, risk === 'Crítico' ? 'alert-triangle' : 'shield'); }
  function criticalityBadge(value) { return badge(value, value === 'Crítica' ? 'danger' : value === 'Alta' ? 'warning' : value === 'Baixa' ? 'success' : 'info'); }
  function progressBar(value) { return `<div class="progress" role="progressbar" aria-label="Progresso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><div class="progress__bar" style="width:${value}%;--progress-color:${value === 100 ? '#147a4b' : value < 30 ? '#d08a1d' : '#2877b5'}"></div></div>`; }
  function options(values, selected = '', placeholder = 'Todos') { return `<option value="">${escapeHtml(placeholder)}</option>${values.map(value => `<option value="${escapeHtml(value)}"${value === selected ? ' selected' : ''}>${escapeHtml(value)}</option>`).join('')}`; }
  function managerOptions(selected = '', placeholder = 'Todos os GPs') { return options(D.managers.map(m => m.name), selected, placeholder); }
  function breadcrumb(items) { return `<nav class="breadcrumb" aria-label="Navegação estrutural"><a href="#/dashboard">Página inicial</a>${items.map((item, index) => `${icon('chevron-right')} ${index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : `<a href="${item.href}">${escapeHtml(item.label)}</a>`}`).join('')}</nav>`; }
  function demoBanner() { return ''; }
  function pageHeader(title, description, actions = '', eyebrow = 'Escritório de Gestão de Projetos', identity = '') { return `<header class="page-header"><div>${identity||(eyebrow?`<p class="eyebrow">${escapeHtml(eyebrow)}</p>`:'')}<h1>${escapeHtml(title)}</h1>${description?`<p>${escapeHtml(description)}</p>`:''}</div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</header>`; }
  function panel(title, subtitle, body, className = '', action = '') { return `<section class="panel ${className}"><header class="panel__header"><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}</div>${action}</header><div class="panel__body">${body}</div></section>`; }
  function metric(label, value, iconName, color, filterKey = '', filterValue = '', note = '') { return `<${filterKey ? 'button' : 'article'} class="metric-card" style="--metric-color:${color}" ${filterKey ? `data-metric-filter="${filterKey}" data-filter-value="${escapeHtml(filterValue)}" title="Ver iniciativas filtradas"` : ''}><div class="metric-card__top"><span>${escapeHtml(label)}</span><span class="metric-card__icon">${icon(iconName)}</span></div><div class="metric-card__value">${escapeHtml(value)}</div>${note ? `<div class="metric-card__note">${escapeHtml(note)}</div>` : ''}</${filterKey ? 'button' : 'article'}>`; }

  function legacyFilteredInitiatives() {
    const f = state.filters;
    const search = f.search.trim().toLocaleLowerCase('pt-BR');
    const items = state.initiatives.filter(item => !item.archived).filter(item => {
      if (search && ![item.id,item.title,item.description,item.manager,item.area].join(' ').toLocaleLowerCase('pt-BR').includes(search)) return false;
      if (f.manager && item.manager !== f.manager) return false;
      if (f.area && item.area !== f.area) return false;
      if (f.status && item.status !== f.status) return false;
      if (f.cycle && item.cycle !== f.cycle) return false;
      if (f.risk && item.risk !== f.risk) return false;
      if (f.criticality && item.criticality !== f.criticality) return false;
      if (f.strategic === 'yes' && !item.strategic) return false;
      if (f.strategic === 'no' && item.strategic) return false;
      if (f.impediment === 'yes' && !item.impediment) return false;
      if (f.impediment === 'no' && item.impediment) return false;
      if (f.delay === 'yes' && !isDelayed(item)) return false;
      if (f.delay === 'no' && isDelayed(item)) return false;
      if (f.due === 'yes' && !isDueSoon(item)) return false;
      if (f.recent === 'stale' && !isStale(item)) return false;
      if (f.recent === 'recent' && isStale(item)) return false;
      if (f.progress && item.progress < Number(f.progress)) return false;
      return true;
    });
    return items.sort((a,b) => {
      if (state.sort === 'title') return a.title.localeCompare(b.title, 'pt-BR');
      if (state.sort === 'progress-desc') return b.progress - a.progress;
      if (state.sort === 'deadline') return a.end.localeCompare(b.end);
      if (state.sort === 'criticality') return D.criticalities.indexOf(b.criticality) - D.criticalities.indexOf(a.criticality);
      return b.updated.localeCompare(a.updated);
    });
  }

  function legacyRenderDashboard() {
    const initiatives = state.initiatives.filter(item => !item.archived);
    const executing = initiatives.filter(i => i.status === 'Em execução').length;
    const completed = initiatives.filter(i => i.status === 'Concluída').length;
    const delayed = initiatives.filter(isDelayed).length;
    const critical = initiatives.filter(i => i.criticality === 'Crítica').length;
    const impeded = initiatives.filter(i => i.impediment).length;
    const highRisk = initiatives.filter(i => ['Alto','Crítico'].includes(i.risk)).length;
    const soon = initiatives.filter(isDueSoon).length;
    const stale = initiatives.filter(isStale).length;
    const meetings = initiatives.flatMap(i => i.meetings.map(m => ({ ...m, initiative: i }))).filter(m => new Date(`${m.date}T${m.time}`) >= new Date()).sort((a,b) => a.date.localeCompare(b.date)).slice(0,5);
    const milestones = initiatives.flatMap(i => i.milestones.map(m => ({ ...m, initiative: i }))).filter(m => m.status !== 'Concluído').sort((a,b) => a.planned.localeCompare(b.planned)).slice(0,5);
    const impediments = initiatives.filter(i => i.impediment).sort((a,b) => b.impedimentSince.localeCompare(a.impedimentSince)).slice(0,5);
    const staleItems = initiatives.filter(isStale).sort((a,b) => a.updated.localeCompare(b.updated)).slice(0,5);
    const statusData = C.counts(initiatives, 'status');
    const gpData = C.counts(initiatives, i => shortName(i.manager));
    const cycleData = C.counts(initiatives, 'cycle');
    const areaData = C.counts(initiatives, 'area');
    const monthly = [142,148,151,157,164,171,176,183,initiatives.length];
    const monthLabels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set'];
    const actions = `<button class="button button--secondary" data-action="presentation">${icon('presentation')}Modo apresentação</button><a class="button" href="#/initiative/new">${icon('plus')}Nova iniciativa</a>`;
    main.innerHTML = `<div class="page">${pageHeader('Visão executiva do portfólio','Indicadores consolidados para apoiar decisões, priorização e governança das iniciativas.',actions)}${demoBanner()}
      <section class="filter-bar" aria-label="Filtros globais"><div class="field"><label for="dash-period">Período</label><select id="dash-period"><option>Últimos 12 meses</option><option>Ano de 2026</option><option>3º trimestre</option></select></div><div class="field"><label for="dash-cycle">Ciclo</label><select id="dash-cycle" data-dashboard-filter="cycle">${options(D.cycles, state.filters.cycle)}</select></div><div class="field"><label for="dash-gp">Gerente de projetos</label><select id="dash-gp" data-dashboard-filter="manager">${managerOptions(state.filters.manager)}</select></div><div class="field"><label for="dash-area">Área</label><select id="dash-area" data-dashboard-filter="area">${options(D.areas, state.filters.area)}</select></div><div class="field"><label for="dash-status">Situação</label><select id="dash-status" data-dashboard-filter="status">${options(D.statuses, state.filters.status)}</select></div><button class="button button--secondary" type="button" data-action="clear-filters">${icon('rotate-ccw')}Limpar</button></section>
      <section class="metrics-grid" aria-label="Indicadores principais">
        ${metric('Total de iniciativas',initiatives.length,'briefcase','#2877b5','all','', 'Portfólio ativo')}${metric('Em execução',executing,'activity','#2380b4','status','Em execução','Acompanhamento corrente')}${metric('Concluídas',completed,'check-circle','#147a4b','status','Concluída','Resultado acumulado')}${metric('Atrasadas',delayed,'clock','#c04a45','delay','yes','Demandam atuação')}${metric('Críticas',critical,'alert-triangle','#ad3f3f','criticality','Crítica','Maior prioridade')}
        ${metric('Com impedimentos',impeded,'ban','#b06c19','impediment','yes','Bloqueios em aberto')}${metric('Riscos altos',highRisk,'shield','#a74646','risk','Alto','Alto ou crítico')}${metric('Próximas do prazo',soon,'calendar','#7561aa','due','yes','Até 30 dias')}${metric('Conclusão média',`${average(initiatives,'progress')}%`,'target','#147a4b','','','Média do portfólio')}${metric('Sem atualização',stale,'alert','#9b6b13','recent','stale','Há mais de 30 dias')}
      </section>
      <div class="dashboard-grid">
        ${panel('Iniciativas por situação','Distribuição atual do portfólio',C.donut(statusData,'iniciativas','status'),'panel--wide')}
        ${panel('Conclusão do portfólio','Distribuição por faixa de progresso',C.bars(C.progressBuckets(initiatives),{label:'Faixas de progresso',colors:['#bd5550','#d7952a','#6599bc','#3f86b8','#27815a']}))}
        ${panel('Evolução mensal','Crescimento do portfólio nos últimos meses',C.line(monthly,monthLabels,{label:'Evolução mensal do portfólio'}),'panel--wide')}
        ${panel('Iniciativas por ciclo','Visão por período de priorização',C.bars(cycleData,{label:'Iniciativas por ciclo'}))}
        ${panel('Carga por gerente de projetos','Quantidade de iniciativas sob responsabilidade',C.bars(gpData,{label:'Carga por GP',limit:9,short:v=>v.split(' ')[0]}),'panel--wide')}
        ${panel('Áreas com maior demanda','Top 8 áreas responsáveis',C.bars(areaData,{label:'Iniciativas por área',limit:8,short:v=>v.length>20?v.slice(0,18)+'…':v}))}
        ${panel('Calendário do PMO','Setembro de 2026',renderCalendar(),'',`<a class="panel-action" href="#/initiatives">Ver agenda</a>`)}
        ${panel('Próximas reuniões','Agenda executiva dos próximos dias',renderList(meetings.map(m=>({icon:'calendar',tone:'info',title:m.title,copy:`${m.initiative.id} • ${shortName(m.initiative.manager)}`,meta:`${formatDate(m.date)} • ${m.time}`,href:`#/initiative/${m.initiative.id}`}))))}
        ${panel('Próximos marcos','Entregas que requerem acompanhamento',renderList(milestones.map(m=>({icon:'flag',tone:m.status==='Atrasado'?'danger':'warning',title:m.name,copy:`${m.initiative.id} • ${m.initiative.title}`,meta:formatDate(m.planned),href:`#/initiative/${m.initiative.id}`}))))}
        ${panel('Impedimentos recentes','Bloqueios registrados no portfólio',renderList(impediments.map(i=>({icon:'ban',tone:'danger',title:i.impedimentText,copy:`${i.id} • ${i.title}`,meta:`${Math.max(0,daysBetween(i.impedimentSince))} dias`,href:`#/initiative/${i.id}`}))))}
        ${panel('Informações desatualizadas','Iniciativas sem atualização há mais de 30 dias',renderList(staleItems.map(i=>({icon:'clock',tone:'warning',title:i.title,copy:`Responsável: ${shortName(i.manager)}`,meta:formatDate(i.updated),href:`#/initiative/${i.id}`}))))}
      </div></div>`;
  }

  function renderCalendar() {
    const weekdays = ['D','S','T','Q','Q','S','S'];
    const days = Array.from({length:35},(_,i)=>i-1).map((day,i)=>`<div class="calendar-day ${day<1||day>30?'muted':''} ${day===3?'today':''} ${[4,7,11,18,23,29].includes(day)?'has-event':''}">${day<1?30+day:day>30?day-30:day}</div>`).join('');
    return `<div class="calendar"><div class="calendar-head">${weekdays.map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid">${days}</div></div>`;
  }
  function renderList(items) { return `<div class="list">${items.length ? items.map(item=>`<a class="list-item" href="${item.href || '#'}"><span class="list-icon ${item.tone || ''}">${icon(item.icon||'info')}</span><span class="list-copy"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.copy||'')}</p></span>${item.meta?`<span class="list-meta">${escapeHtml(item.meta)}</span>`:''}</a>`).join('') : `<div class="empty-state"><h3>Nenhum item</h3><p>Não há registros para este recorte.</p></div>`}</div>`; }

  function legacyRenderInitiatives() {
    const items = filteredInitiatives();
    const pageCount = Math.max(1, Math.ceil(items.length / state.perPage));
    state.page = Math.min(state.page, pageCount);
    const current = items.slice((state.page-1)*state.perPage, state.page*state.perPage);
    const activeFilters = Object.entries(state.filters).filter(([,v])=>v).length;
    const actions = `<button class="button button--secondary" data-action="export-csv">${icon('download')}Exportar</button><button class="button button--secondary" data-action="print">${icon('printer')}Imprimir</button><a class="button" href="#/initiative/new">${icon('plus')}Cadastrar nova iniciativa</a>`;
    main.innerHTML = `<div class="page">${breadcrumb([{label:'Iniciativas'}])}${pageHeader('Iniciativas','Consulte, filtre e acompanhe todas as iniciativas do portfólio do EGP.',actions)}${demoBanner()}
      <section class="filter-bar" aria-label="Filtros de iniciativas">
        <div class="field field--search"><label for="initiative-search">Pesquisa</label><div class="input-wrap">${icon('search')}<input id="initiative-search" type="search" value="${escapeHtml(state.filters.search)}" placeholder="ID, nome, GP ou área…"></div></div>
        <div class="field"><label for="filter-manager">Gerente de projetos</label><select id="filter-manager" data-filter="manager">${managerOptions(state.filters.manager)}</select></div>
        <div class="field"><label for="filter-status">Situação</label><select id="filter-status" data-filter="status">${options(D.statuses,state.filters.status)}</select></div>
        <div class="field"><label for="filter-cycle">Ciclo</label><select id="filter-cycle" data-filter="cycle">${options(D.cycles,state.filters.cycle)}</select></div>
        <div class="field"><label for="filter-risk">Risco</label><select id="filter-risk" data-filter="risk">${options(D.riskLevels,state.filters.risk)}</select></div>
        <div class="filter-actions"><button class="button button--secondary" type="button" data-action="advanced-filters">${icon('filter')}Filtros avançados${activeFilters?` (${activeFilters})`:''}</button><button class="button button--ghost" type="button" data-action="clear-filters" title="Limpar todos os filtros">${icon('rotate-ccw')}Limpar</button></div>
        ${renderActiveFilters()}
      </section>
      <section class="metrics-grid metrics-grid--six" aria-label="Resumo da listagem">
        ${metric('Total filtrado',items.length,'briefcase','#2877b5')}${metric('Em planejamento',items.filter(i=>i.status==='Em planejamento').length,'layers','#725ca8')}${metric('Em execução',items.filter(i=>i.status==='Em execução').length,'activity','#2877b5')}${metric('Atrasadas',items.filter(isDelayed).length,'clock','#b94747')}${metric('Críticas',items.filter(i=>i.criticality==='Crítica').length,'alert-triangle','#a63a3a')}${metric('Concluídas',items.filter(i=>i.status==='Concluída').length,'check-circle','#147a4b')}
      </section>
      <div class="toolbar"><div class="toolbar__summary"><strong>${items.length}</strong> iniciativas encontradas • página ${state.page} de ${pageCount}</div><div class="page-actions"><label class="sr-only" for="sort-initiatives">Ordenar por</label><select class="input" id="sort-initiatives"><option value="updated-desc"${state.sort==='updated-desc'?' selected':''}>Atualização mais recente</option><option value="title"${state.sort==='title'?' selected':''}>Nome (A–Z)</option><option value="progress-desc"${state.sort==='progress-desc'?' selected':''}>Maior progresso</option><option value="deadline"${state.sort==='deadline'?' selected':''}>Prazo mais próximo</option><option value="criticality"${state.sort==='criticality'?' selected':''}>Maior criticidade</option></select><button class="button button--secondary button--small" data-action="save-view">${icon('star')}Salvar visão</button><div class="segmented" aria-label="Modo de visualização"><button class="segment ${state.initiativeView==='cards'?'active':''}" data-view="cards" type="button" aria-label="Visualizar em cards">${icon('grid')}</button><button class="segment ${state.initiativeView==='table'?'active':''}" data-view="table" type="button" aria-label="Visualizar em tabela">${icon('list')}</button></div></div></div>
      <div id="initiative-results">${current.length ? (state.initiativeView === 'cards' ? renderInitiativeCards(current) : renderInitiativeTable(current)) : renderEmptyInitiatives()}</div>
      ${renderPagination(pageCount)}
    </div>`;
  }

  function renderActiveFilters() {
    const labels = {search:'Pesquisa',manager:'GP',area:'Área',status:'Situação',cycle:'Ciclo',risk:'Risco',criticality:'Criticidade',strategic:'Estratégica',impediment:'Impedimento',delay:'Atraso',due:'Próximas do prazo',recent:'Atualização',progress:'Progresso mínimo'};
    const active = Object.entries(state.filters).filter(([,value])=>value);
    return active.length ? `<div class="active-filters" aria-label="Filtros ativos">${active.map(([key,value])=>`<button class="filter-chip" data-remove-filter="${key}" title="Remover filtro">${escapeHtml(labels[key]||key)}: ${escapeHtml(value==='yes'?'Sim':value==='no'?'Não':value)} ${icon('x')}</button>`).join('')}</div>` : '';
  }
  function renderInitiativeCards(items) { return `<div class="initiative-grid">${items.map(item=>`<article class="initiative-card"><div class="initiative-card__head"><div><span class="initiative-card__id">${escapeHtml(item.id)}${item.strategic?' • ESTRATÉGICA':''}</span><h3><a href="#/initiative/${item.id}">${escapeHtml(item.title)}</a></h3></div>${renderCardMenu(item)}</div><p class="initiative-card__description">${escapeHtml(item.description)}</p><div class="badges">${statusBadge(item.status)}${badge(item.cycle,'info')}${riskBadge(item.risk)}${item.impediment?badge('Impedimento','danger','ban'):''}</div><div class="initiative-card__meta"><div class="meta-item"><small>Gerente de projetos</small><strong title="${escapeHtml(item.manager)}">${escapeHtml(shortName(item.manager))}</strong></div><div class="meta-item"><small>Prazo atual</small><strong>${formatDate(item.end)}${isDelayed(item)?' • vencido':''}</strong></div><div class="meta-item"><small>Área responsável</small><strong title="${escapeHtml(item.area)}">${escapeHtml(item.area)}</strong></div><div class="meta-item"><small>Próximo marco</small><strong title="${escapeHtml(item.nextMilestone)}">${escapeHtml(item.nextMilestone)}</strong></div></div><div class="initiative-card__progress"><div class="progress-label"><span>Progresso</span><strong>${item.progress}%</strong></div>${progressBar(item.progress)}</div><footer class="initiative-card__footer"><span>Atualizada em ${formatDate(item.updated)}</span><a class="button button--ghost button--small" href="#/initiative/${item.id}">Ver detalhes ${icon('chevron-right')}</a></footer></article>`).join('')}</div>`; }
  function renderCardMenu(item) { return `<div class="card-menu"><button class="icon-button" type="button" data-action="toggle-card-menu" aria-label="Ações de ${escapeHtml(item.id)}" aria-expanded="false">${icon('more')}</button><div class="dropdown" hidden><a href="#/initiative/${item.id}">${icon('eye')}Abrir detalhes</a><a href="#/initiative/${item.id}/edit">${icon('edit')}Editar</a><button data-action="duplicate" data-id="${item.id}">${icon('copy')}Duplicar</button><button data-action="quick-evolution" data-id="${item.id}">${icon('activity')}Registrar evolução</button><button data-action="document" data-id="${item.id}">${icon('file-text')}Gerar documento</button><button data-action="meeting" data-id="${item.id}">${icon('calendar')}Agendar reunião</button><button class="danger" data-action="archive" data-id="${item.id}">${icon('archive')}Arquivar</button></div></div>`; }
  function renderInitiativeTable(items) { return `<div class="table-wrap"><table class="data-table"><thead><tr><th>ID / Iniciativa</th><th>GP responsável</th><th>Área</th><th>Situação</th><th>Ciclo</th><th>Progresso</th><th>Risco</th><th>Criticidade</th><th>Prazo</th><th>Atualização</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>${items.map(item=>`<tr><td class="name-cell"><a href="#/initiative/${item.id}"><small>${item.id}</small><br>${escapeHtml(item.title)}</a></td><td>${escapeHtml(shortName(item.manager))}</td><td>${escapeHtml(item.area)}</td><td>${statusBadge(item.status)} ${item.impediment?badge('!','danger'):''}</td><td>${escapeHtml(item.cycle)}</td><td><div class="table-progress"><span>${item.progress}%</span>${progressBar(item.progress)}</div></td><td>${riskBadge(item.risk)}</td><td>${criticalityBadge(item.criticality)}</td><td>${formatDate(item.end)}</td><td>${formatDate(item.updated)}</td><td>${renderCardMenu(item)}</td></tr>`).join('')}</tbody></table></div>`; }
  function renderPagination(count) { if (count <= 1) return ''; const start=Math.max(1,state.page-2), end=Math.min(count,start+4); const pages=[]; for(let i=start;i<=end;i++)pages.push(i); return `<nav class="pagination" aria-label="Paginação"><button class="page-button" data-page="${state.page-1}" ${state.page===1?'disabled':''} aria-label="Página anterior">‹</button>${start>1?'<span>…</span>':''}${pages.map(p=>`<button class="page-button ${p===state.page?'active':''}" data-page="${p}" aria-current="${p===state.page?'page':'false'}">${p}</button>`).join('')}${end<count?'<span>…</span>':''}<button class="page-button" data-page="${state.page+1}" ${state.page===count?'disabled':''} aria-label="Próxima página">›</button></nav>`; }
  function renderEmptyInitiatives() { return `<div class="empty-state">${icon('search')}<h3>Nenhuma iniciativa encontrada</h3><p>A combinação atual de filtros não retornou resultados. Limpe os filtros ou amplie os critérios de pesquisa.</p><button class="button button--secondary" data-action="clear-filters">${icon('rotate-ccw')}Limpar filtros</button></div>`; }

  let mvpView=null;
  function filteredInitiatives(){return mvpView?mvpView.filtered():state.initiatives.filter(i=>!i.archived).map(window.MvpViews.project);}
  function downloadMvpCsv(text){const blob=new Blob([text],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='sisegp-iniciativas.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);showToast('Exportação concluída','Os registros filtrados foram exportados em CSV.');}
  function exportCsv(){downloadMvpCsv(window.MvpViews.csv(filteredInitiatives()));}
  function renderMvpView(route){mvpView=window.MvpViews.mount(main,{route,items:()=>state.initiatives,header:pageHeader,metric,panel,download:downloadMvpCsv});}
  function renderDashboard(){renderMvpView('dashboard');}
  function renderInitiatives(){renderMvpView('initiatives');}
  function renderReports(route='reports'){renderMvpView(route);}
  function renderGovernance(){renderMvpView('governance');}
  function auxiliaryApi(){return {header:pageHeader,toast:showToast,audit:(title,details)=>addAuditLog({title,details,type:'Configuração',source:'manual'}),confirm:(title,onConfirm)=>showModal({title,body:'A alteração será aplicada neste navegador. Vínculos existentes serão preservados.',confirm:'Confirmar',onConfirm})};}
  function renderSettings(){let key=null;if(state.params[0]==='organization'){if(state.params.length>2||(state.params[1]&&state.params[1]!=='sectors'))return renderNotFound();key=state.params[1]==='sectors'?'Setores':'Departamentos';}else if(state.params[0]==='catalog'){if(state.params.length!==2)return renderNotFound();try{key=decodeURIComponent(state.params[1]);}catch(_){return renderNotFound();}}else if(state.params.length)return renderNotFound();window.AuxiliaryView.mount(main,auxiliaryApi(),key);}
  function renderManagers(){window.AuxiliaryView.mount(main,auxiliaryApi(),'Gerentes de Projetos');}
  function renderInitiativeDetail(id){renderInitiativeForm(id);}
  function renderNotifications(){document.getElementById('notification-list').innerHTML='<div class="callout"><strong>Notificações automáticas fora do MVP</strong><p>Consulte os Status Reports cadastrados nas iniciativas para acompanhar a situação informada.</p></div>';}

  let mvpEditor = null;
  let mvpEditorHash = '';
  const mvpFileBlobs = new Map();
  window.addEventListener('beforeunload',event=>{if(mvpEditor?.isDirty()){event.preventDefault();event.returnValue='';}});
  function renderInitiativeForm(id) {
    mvpEditorHash=location.hash;
    const original=id?state.initiatives.find(item=>item.id===id):null;
    if(id&&!original){main.innerHTML='<div class="empty-state"><h1>Iniciativa não encontrada</h1><a href="#/initiatives">Voltar ao portfólio</a></div>';return;}
    mvpEditor=window.InitiativeEditor.mount(main,original,{
      escapeHtml,header:title=>{const item=original?window.MvpViews.project(original):null;return pageHeader(title,'',item?window.MvpViews.headerSummary(item,false):'','',item?window.MvpViews.headerIdentity(item):'');},today:()=>D.iso(new Date()),blobs:mvpFileBlobs,
      managers:window.AuxiliaryData.names('Gerentes de Projetos'),overview:window.MvpViews.overview,
      changeStatus:()=>openInitiativeStatus(id),
      changeProgress:()=>openInitiativeProgress(id),
      changeGieReference:onSaved=>openInitiativeGieReference(id,onSaved),
      replan:(context,onAdd)=>openReplanModal(context,onAdd),
      tap:(draft,onComplete)=>window.InitiativeTap.open(draft,{modal:showModal,today:()=>D.iso(new Date()),toast:showToast},onComplete),
      tep:(draft,onComplete)=>window.InitiativeTep.open(draft,{modal:showModal,today:()=>D.iso(new Date()),toast:showToast},onComplete),
      toast:showToast,
      confirm:(title,action)=>showModal({title,body:'A exclusão será confirmada ao salvar a iniciativa.',confirm:'Excluir',tone:'danger',onConfirm:action}),
      view:(title,body)=>showModal({title,body,confirm:'',cancel:'Fechar'}),
      save:draft=>{
        const previous=state.initiatives;
        const number=Math.max(0,...previous.map(i=>Number(i.id.replace(/\D/g,''))||0))+1;
        const base={title:'',description:'',objective:'',scope:'',benefits:'',availability:'',status:'Aberta',progress:0,start:'',end:'',actualEnd:'',originalEnd:'',cycle:'',area:'',manager:'',risk:'Baixo',criticality:'Média',riskScore:1,impediment:false,nextMilestone:'',strategic:false,archived:false,risks:[],milestones:[],activities:[],evolutions:[],meetings:[],files:[],raci:[],statusReports:[],...draft,id:original?.id||`INI-${String(number).padStart(3,'0')}`,updated:D.iso(new Date())};
        state.initiatives=original?previous.map(i=>i.id===original.id?base:i):[base,...previous];
        const previousLogs=state.auditLogs.slice();
        recordAutomatic(base,original?'Iniciativa atualizada':'Iniciativa criada','Cadastro MVP e registros associados salvos.');
        if(original&&Number(base.progress)!==Number(original.progress))recordAutomatic(base,'Progresso atualizado',`Conclusão alterada de ${Number(original.progress)||0}% para ${base.progress}% pelo cadastro da iniciativa.`);
        (base.replans||[]).filter(entry=>!(original?.replans||[]).some(old=>old.id===entry.id)).forEach(entry=>recordAutomatic(base,'Iniciativa replanejada',`Data real de término: ${formatDate(entry.previousEnd)} → ${formatDate(entry.newEnd)}. Justificativa: ${entry.justification}`));
        if(!persist()){state.initiatives=previous;state.auditLogs=previousLogs;try{localStorage.setItem(AUDIT_KEY,JSON.stringify(previousLogs));}catch(_){}document.getElementById('nav-initiative-count').textContent=previous.filter(i=>!i.archived).length;showToast('Não foi possível salvar','O armazenamento local pode estar cheio ou indisponível. Seus dados continuam no formulário.','danger');return false;}
        showToast('Iniciativa salva','O cadastro e os registros associados foram salvos neste navegador.');
        const destination=`#/initiative/${base.id}`,sameRoute=location.hash===destination;state.detailTab='overview';mvpEditor=null;location.hash=destination;if(sameRoute)renderInitiativeForm(base.id);return true;
      }
    });
  }
  function openReplanModal(context,onAdd){
    const history=[...context.entries].reverse();
    const rows=history.map(entry=>`<tr><td>${escapeHtml(formatDate(entry.date))}</td><td>${escapeHtml(formatDate(entry.previousEnd))}</td><td>${escapeHtml(formatDate(entry.newEnd))}</td><td class="mvp-replan-justification">${escapeHtml(entry.justification||'')}</td><td>${entry.attachment?`${escapeHtml(entry.attachment.name)}<br><small>${escapeHtml((Number(entry.attachment.size||0)/1024).toFixed(1))} KB · metadados</small>`:'Sem anexo'}</td></tr>`).join('');
    showModal({title:'Replanejamento',confirm:'Adicionar replanejamento',body:`<div class="mvp-replan-fields"><div class="field"><label for="replan-end">Nova data real de término *</label><input id="replan-end" type="date" value="${escapeHtml(context.end||'')}"${context.start?` min="${escapeHtml(context.start)}"`:''} required></div><div class="field"><label for="replan-justification">Justificativa *</label><textarea id="replan-justification" rows="4" required></textarea></div><div class="field"><label for="replan-file">Anexo (um arquivo)</label><input id="replan-file" type="file"><small>São salvos somente nome, tipo e tamanho do arquivo.</small></div></div><h3>Histórico de replanejamentos (${history.length})</h3>${history.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Registro</th><th>Data real anterior</th><th>Nova data real</th><th>Justificativa</th><th>Anexo</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p>Nenhum replanejamento registrado.</p>'}`,onConfirm:()=>{
      const date=document.getElementById('replan-end'),justification=document.getElementById('replan-justification'),fileInput=document.getElementById('replan-file'),newEnd=date.value,note=justification.value.trim();
      if(date.validity?.badInput||!window.InitiativeEditor.validCalendarDate(newEnd)||(context.start&&newEnd<context.start)){showToast('Revise a nova data','Informe uma data válida, igual ou posterior ao início da iniciativa.','warning');date.focus();return false;}
      if(!note){showToast('Informe a justificativa','Explique o motivo do replanejamento.','warning');justification.focus();return false;}
      if(fileInput.files?.length>1){showToast('Selecione apenas um arquivo','Cada replanejamento aceita um anexo.','warning');return false;}
      const file=fileInput.files?.[0],id=`REPLAN-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const attachment=file?{id:`${id}-FILE`,name:file.name,size:file.size,mime:file.type}:null;
      if(file)mvpFileBlobs.set(attachment.id,file);
      onAdd({id,date:D.iso(new Date()),previousEnd:context.end||'',newEnd,justification:note,attachment});
    }});
    setTimeout(()=>document.getElementById('replan-end')?.focus(),0);
  }
  function openInitiativeGieReference(id,onSaved){
    const original=state.initiatives.find(item=>item.id===id);if(!original)return;
    const previousReference=typeof original.gieReference==='string'?original.gieReference.trim():'',current=previousReference.toLocaleUpperCase('pt-BR');
    showModal({title:'Referência do GIE',eyebrow:window.AuxiliaryData.initiativeCode(original),confirm:'Salvar referência',body:`<div class="field"><label for="initiative-gie-reference">Identificador no GIE (opcional)</label><input id="initiative-gie-reference" type="text" value="${escapeHtml(current)}" autocapitalize="characters" spellcheck="false"></div>`,onConfirm:()=>{
      const reference=document.getElementById('initiative-gie-reference').value.trim().toLocaleUpperCase('pt-BR');
      if(reference===previousReference)return;
      const previous=state.initiatives,previousLogs=state.auditLogs.slice(),next=JSON.parse(JSON.stringify(original));
      next.gieReference=reference;next.updated=D.iso(new Date());state.initiatives=previous.map(item=>item.id===id?next:item);
      recordAutomatic(next,'Referência do GIE atualizada',`${current||'Não informada'} → ${reference||'Não informada'}`);
      if(!persist()){state.initiatives=previous;state.auditLogs=previousLogs;try{localStorage.setItem(AUDIT_KEY,JSON.stringify(previousLogs));}catch(_){}showToast('Não foi possível salvar','A referência anterior foi preservada. Tente novamente.','danger');return false;}
      onSaved?.(reference);showToast('Referência do GIE salva',reference?'O identificador atual da iniciativa foi preservado.':'A referência foi removida.');
    }});
    const input=document.getElementById('initiative-gie-reference');
    input.addEventListener('input',()=>{const start=input.selectionStart,end=input.selectionEnd;input.value=input.value.toLocaleUpperCase('pt-BR');if(start!=null&&end!=null)input.setSelectionRange(start,end);});
    setTimeout(()=>input.focus(),0);
  }
  function openInitiativeProgress(id){
    const original=state.initiatives.find(item=>item.id===id);if(!original)return;
    const current=window.InitiativeEditor.normalize(original).progress;
    showModal({title:'Alterar percentual de conclusão',eyebrow:window.AuxiliaryData.initiativeCode(original),confirm:'Salvar conclusão',body:`<div class="field"><label for="initiative-progress-number">Conclusão (%)</label><input id="initiative-progress-number" type="number" min="0" max="100" step="any" value="${current}" required></div><div class="mvp-progress-preview"><progress id="initiative-progress-preview" max="100" value="${current}" aria-label="Prévia da conclusão"></progress><output id="initiative-progress-output" for="initiative-progress-number">${current}%</output></div>`,onConfirm:()=>{
      const input=document.getElementById('initiative-progress-number'),raw=input.value.trim(),value=Number(raw);
      if(input.validity?.badInput||!raw||!Number.isFinite(value)||value<0||value>100){showToast('Revise o percentual','Informe um número entre 0 e 100.','warning');input.focus();return false;}
      if(value===current)return;
      const previous=state.initiatives,previousLogs=state.auditLogs.slice(),next=JSON.parse(JSON.stringify(original));
      next.progress=value;const latest=window.InitiativeEditor.latestStatusReport(next);if(latest)latest.progress=value;next.updated=D.iso(new Date());state.initiatives=previous.map(item=>item.id===id?next:item);
      recordAutomatic(next,'Progresso atualizado',`Conclusão alterada de ${current}% para ${value}%.`);
      if(!persist()){state.initiatives=previous;state.auditLogs=previousLogs;try{localStorage.setItem(AUDIT_KEY,JSON.stringify(previousLogs));}catch(_){}showToast('Não foi possível salvar','O percentual anterior foi preservado. Tente novamente.','danger');return false;}
      mvpEditor=null;renderInitiativeForm(id);showToast('Conclusão atualizada','O percentual foi salvo na iniciativa.');
    }});
    const input=document.getElementById('initiative-progress-number');
    input.addEventListener('input',()=>{const raw=input.value.trim(),value=Number(raw),valid=raw&&!input.validity?.badInput&&Number.isFinite(value)&&value>=0&&value<=100;document.getElementById('initiative-progress-preview').value=valid?value:0;document.getElementById('initiative-progress-output').textContent=valid?`${value}%`:'Informe de 0 a 100%';});
    setTimeout(()=>input.focus(),0);
  }
  function openInitiativeStatus(id){
    const A=window.AuxiliaryData,original=state.initiatives.find(item=>item.id===id);if(!original)return;
    const current=A.resolveRecord(original).administrativeStatus;
    showModal({title:'Alterar Status da Iniciativa',eyebrow:A.initiativeCode(original),confirm:'Salvar status',body:`<div class="field"><label for="initiative-status-select">Status da Iniciativa</label><select id="initiative-status-select">${options(A.names(A.statusKey,current),current,'Selecione')}</select></div>`,onConfirm:()=>{
      const selected=document.getElementById('initiative-status-select').value,row=A.find(A.statusKey,selected);
      if(!row||(!row.active&&selected!==current)){showToast('Selecione um status válido','Escolha uma opção ativa da lista.','warning');return false;}
      if(selected===current)return;
      const next=A.resolveRecord(original),previous=state.initiatives,previousLogs=state.auditLogs.slice();
      next.administrativeStatus=row.name;next.catalogRefs.administrativeStatus=row.id;
      const code=[row.name,...(row.aliases||[])].find(name=>window.InitiativeEditor.lifecycle[name]);
      next.status=code?window.InitiativeEditor.lifecycle[code]:row.name;
      if(code==='FINALIZADO'){next.progress=100;const latest=window.InitiativeEditor.latestStatusReport(next);if(latest)latest.progress=100;}
      next.updated=D.iso(new Date());state.initiatives=previous.map(item=>item.id===id?next:item);
      recordAutomatic(next,'Status da iniciativa atualizado',`${current||'Não informado'} → ${row.name}`);
      if(!persist()){state.initiatives=previous;state.auditLogs=previousLogs;try{localStorage.setItem(AUDIT_KEY,JSON.stringify(previousLogs));}catch(_){}showToast('Não foi possível salvar','O status anterior foi preservado. Tente novamente.','danger');return false;}
      mvpEditor=null;renderInitiativeForm(id);showToast('Status atualizado','A alteração foi salva na iniciativa.');
    }});
    setTimeout(()=>document.getElementById('initiative-status-select')?.focus(),0);
  }
  function formField(label,name,value,type='text',className='',optionsHtml='') { return `<div class="field ${className}"><label for="field-${name}">${escapeHtml(label)}</label>${type==='textarea'?`<textarea id="field-${name}" name="${name}">${escapeHtml(value)}</textarea>`:type==='select'?`<select id="field-${name}" name="${name}">${optionsHtml}</select>`:`<input id="field-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}">`}</div>`; }
  function renderEvolutionWorkspace(item) {
    return `<div class="overview-grid"><section class="form-card"><h2>Histórico de evolução</h2><p>Registros manuais e ações automáticas realizadas no sistema.</p>${renderTimeline(item.evolutions)}</section><section class="form-card record-editor"><h2>Registrar evolução</h2><p>Informe quando a atualização ocorreu e descreva a movimentação.</p><form id="evolution-form" data-id="${item.id}" class="form-grid">${formField('Data *','date',D.iso(new Date()),'date','span-2')}${formField('Hora','time',new Date().toTimeString().slice(0,5),'time','span-2')}${formField('Tipo','type','Atualização de progresso','select','span-4',options(['Atualização de progresso','Mudança de status','Alteração de escopo','Mudança de prazo','Risco','Impedimento','Decisão','Entrega concluída'],'Atualização de progresso','Selecione'))}${formField('Título *','title','','text','span-4')}${formField('Observação','note','','textarea','span-4')}<div class="span-4 record-actions"><button class="button" type="submit">${icon('save')}Registrar evolução</button></div></form></section></div>`;
  }

  function renderMeetingWorkspace(item) {
    const index=state.editors.meeting;
    const meeting=index===null?null:(item.meetings||[])[index];
    const participants=Array.isArray(meeting?.participants)?meeting.participants.join(', '):(meeting?.participants||'');
    const documents=(meeting?.documents||[]).map(doc=>typeof doc==='string'?doc:doc.name).filter(Boolean);
    return `<section class="form-card record-editor"><div class="record-editor__header"><div><h2>${meeting?'Editar reunião':'Registrar nova reunião'}</h2><p>Cadastre os participantes, a pauta, os objetivos e os documentos de apoio.</p></div>${meeting?`<button class="button button--ghost" type="button" data-action="cancel-meeting-edit">Cancelar edição</button>`:''}</div><form id="meeting-form" data-id="${item.id}" data-index="${meeting?index:''}" class="form-grid">${formField('Título da reunião *','title',meeting?.title||'','text','span-2')}${formField('Tipo','type',meeting?.type||'Acompanhamento','select','span-2',options(['Planejamento','Acompanhamento','Deliberação','Homologação','Encerramento'],meeting?.type||'Acompanhamento','Selecione'))}${formField('Data *','date',meeting?.date||D.iso(new Date()),'date','span-2')}${formField('Horário','time',meeting?.time||'14:00','time','span-2')}${formField('Participantes *','participants',participants,'textarea','span-4')}${formField('Pauta *','agenda',meeting?.agenda||'','textarea','span-2')}${formField('Objetivos *','objectives',meeting?.objectives||'','textarea','span-2')}<div class="field span-4"><label for="meeting-documents">Documentos e transcrições</label><label class="upload-zone upload-zone--compact">${icon('upload')}<strong>Selecionar transcrição, PDF ou documento de apoio</strong><p>PDF, DOCX, TXT, VTT, SRT e imagens.</p><input id="meeting-documents" class="sr-only" name="documents" type="file" accept=".pdf,.doc,.docx,.txt,.vtt,.srt,image/*" multiple></label>${documents.length?`<div class="attachment-list">${documents.map(name=>`<span>${icon('file-text')}${escapeHtml(name)}</span>`).join('')}</div>`:''}</div><div class="span-4 record-actions"><button class="button" type="submit">${icon('save')}${meeting?'Salvar alterações':'Registrar reunião'}</button></div></form></section><section class="form-card"><h2>Reuniões da iniciativa</h2><p>Agenda, participantes, objetivos e documentos vinculados.</p>${renderMeetings(item)}</section>`;
  }

  function renderStatusReportWorkspace(item) {
    const index=state.editors.statusReport;
    const report=index===null?null:(item.statusReports||[])[index];
    return `<section class="form-card record-editor"><div class="record-editor__header"><div><h2>${report?'Editar status report':'Criar status report'}</h2><p>Registre a situação atual para acompanhamento da iniciativa.</p></div>${report?`<button class="button button--ghost" type="button" data-action="cancel-status-edit">Cancelar edição</button>`:''}</div><form id="status-report-form" data-id="${item.id}" data-index="${report?index:''}" class="form-grid">${formField('Data *','date',report?.date||D.iso(new Date()),'date','span-2')}${formField('Últimas realizações / justificativas *','achievements',report?.achievements||report?.summary||'','textarea','span-4')}${formField('Impedimentos','impediments',report?.impediments||'','textarea','span-2')}${formField('Próximas etapas / passos *','nextSteps',report?.nextSteps||'','textarea','span-2')}<div class="span-4 record-actions"><button class="button" type="submit">${icon('save')}${report?'Salvar alterações':'Criar status report'}</button></div></form></section><section class="form-card"><h2>Histórico de status reports</h2><p>Registros periódicos da iniciativa.</p>${renderStatusReports(item)}</section>`;
  }

  function renderScheduleWorkspace(item) {
    const index=state.editors.activity;
    const activity=index===null?null:(item.activities||[])[index];
    return `<section class="form-card record-editor"><div class="record-editor__header"><div><h2>${activity?'Editar item do cronograma':'Adicionar item ao cronograma'}</h2><p>Informe atividade, responsabilidade, período, progresso e situação.</p></div>${activity?`<button class="button button--ghost" type="button" data-action="cancel-activity-edit">Cancelar edição</button>`:''}</div><form id="activity-form" data-id="${item.id}" data-index="${activity?index:''}" class="form-grid">${formField('Fase / atividade *','name',activity?.name||'','text','span-2')}${formField('Responsável *','owner',activity?.owner||shortName(item.manager),'text','span-2')}${formField('Data de início *','start',activity?.start||D.iso(new Date()),'date','span-2')}${formField('Data de término *','end',activity?.end||D.iso(D.addDays(new Date(),30)),'date','span-2')}${formField('Progresso (%)','progress',activity?.progress??0,'number','span-2')}${formField('Situação','status',activity?.status||'Planejada','select','span-2',options(['Planejada','Em andamento','Concluída','Atrasada','Suspensa'],activity?.status||'Planejada','Selecione'))}<div class="span-4 record-actions"><button class="button" type="submit">${icon('save')}${activity?'Salvar alterações':'Adicionar ao cronograma'}</button></div></form></section><section class="form-card"><h2>Cronograma detalhado</h2><p>Comparação entre planejamento e andamento.</p><div class="table-wrap">${renderScheduleTable(item,true)}</div></section><section class="form-card"><h2>Gráfico de Gantt</h2><p>Visualização simplificada das fases no período.</p><div class="table-wrap">${renderGantt(item)}</div></section>`;
  }

  function legacyRenderInitiativeDetail(id) {
    const item = state.initiatives.find(i=>i.id===id);
    if (!item) return renderNotFound();
    const tabs = [['overview','Visão geral'],['classification','Classificação e risco'],['team','Equipe'],['milestones','Marcos'],['schedule','Cronograma'],['files','Documentos'],['evolution','Evolução'],['meetings','Reuniões'],['reports','Status reports'],['pdf','PDF para reunião']];
    main.innerHTML = `<div class="page">${breadcrumb([{label:'Iniciativas',href:'#/initiatives'},{label:item.id}])}<section class="initiative-hero"><div class="initiative-hero__top"><div><span class="initiative-hero__id">${item.id}${item.strategic?' • INICIATIVA ESTRATÉGICA':''}</span><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.description)}</p></div><div class="hero-actions"><a class="button button--secondary" href="#/initiative/${item.id}/edit">${icon('edit')}Editar</a><button class="button button--secondary" data-action="document" data-id="${item.id}">${icon('file-text')}Gerar documento</button><button class="button button--secondary" data-action="print">${icon('printer')}Imprimir</button></div></div><div class="hero-meta"><div class="hero-meta__item"><small>Situação</small><strong>${escapeHtml(item.status)}</strong></div><div class="hero-meta__item"><small>GP responsável</small><strong>${escapeHtml(shortName(item.manager))}</strong></div><div class="hero-meta__item"><small>Área responsável</small><strong>${escapeHtml(item.area)}</strong></div><div class="hero-meta__item"><small>Progresso</small><strong>${item.progress}%</strong></div><div class="hero-meta__item"><small>Prazo atual</small><strong>${formatDate(item.end)}</strong></div><div class="hero-meta__item"><small>Última atualização</small><strong>${formatDate(item.updated)}</strong></div></div></section>
      <div class="tabs" role="tablist">${tabs.map(([key,label])=>`<button class="tab ${state.detailTab===key?'active':''}" data-detail-tab="${key}" type="button" role="tab" aria-selected="${state.detailTab===key}">${escapeHtml(label)}</button>`).join('')}</div>
      <div id="detail-tab-content">${renderDetailTab(item,state.detailTab)}</div></div>`;
  }

  function renderDetailTab(item,tab) {
    if(item.mvp&&tab==='team')return `<section class="form-card"><h2>Equipe da iniciativa</h2><div class="table-wrap"><table class="data-table"><thead><tr><th>Nome</th><th>Papel</th><th>HST (horas)</th></tr></thead><tbody>${(item.mvp.members||[]).map(m=>`<tr><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.role)}</td><td>${escapeHtml(m.hst)}</td></tr>`).join('')}</tbody></table></div><p>Partes interessadas: ${escapeHtml((item.mvp.stakeholders||[]).join(', ')||'Não informado')}</p><a class="button" href="#/initiative/${item.id}/edit">Editar cadastro</a></section>`;
    if(item.mvp&&tab==='classification')return `<section class="form-card"><h2>Classificação e priorização</h2><div class="form-grid">${[['DITIC','ditic'],['Estratégica','strategic'],['Biênio PDTIC','biennium'],['Eixo','axis'],['Ciclo','cycle'],['Responsável','owner'],['ENTICJUD','enticjud'],['Objetivo estratégico','objective'],['Criticidade','criticality'],['Complexidade','complexity'],['Importância','importance'],['Necessidade','necessity'],['Impacto no PE','impact'],['Determinação legal','legal'],['Prazo','deadline'],['Orçamento','budget'],['Estimativa HST (horas)','hst']].map(([label,key])=>`<div class="meta-item"><small>${label}</small><strong>${escapeHtml(item.mvp.classification?.[key]??'Não informado')}</strong></div>`).join('')}</div><p>Sem cálculo automático de score.</p></section><section class="form-card"><h2>Riscos registrados</h2>${renderRiskMatrix(item.risks||[])}</section>`;
    if(item.mvp&&tab==='reports')return `<section class="form-card"><h2>Status Reports</h2><a class="button" href="#/initiative/${item.id}/edit">Gerenciar relatórios no cadastro</a>${renderStatusReports(item)}</section>`;
    if (tab==='classification') return `<div class="overview-grid"><div class="stack"><section class="form-card"><h2>Alinhamento estratégico</h2><p>Classificação e critérios de priorização.</p><div class="form-grid"><div class="meta-item"><small>Classificação DITIC</small><strong>${escapeHtml(item.classification)}</strong></div><div class="meta-item"><small>Objetivo estratégico</small><strong>${escapeHtml(item.strategicObjective)}</strong></div><div class="meta-item"><small>Eixo</small><strong>${escapeHtml(item.axis)}</strong></div><div class="meta-item"><small>PDTIC</small><strong>${item.pdtic?'Sim':'Não'}</strong></div></div></section><section class="form-card"><h2>Registro de riscos</h2><p>Riscos ativos e respectivas respostas.</p>${item.risks.length?item.risks.map(r=>`<div class="callout ${['Alto','Crítico'].includes(r.level)?'danger':'warning'}"><strong>${escapeHtml(r.category)} • ${escapeHtml(r.level)}</strong><p>${escapeHtml(r.description)}</p><small>Resposta: ${escapeHtml(r.response)} • Responsável: ${escapeHtml(shortName(r.owner))}</small></div>`).join('<br>'):`<div class="empty-state"><h3>Nenhum risco ativo</h3><p>Não há riscos cadastrados para esta iniciativa.</p></div>`}</section></div><section class="form-card"><h2>Matriz de riscos</h2><p>Probabilidade × impacto</p>${renderRiskMatrix(item.risks)}<div class="stat-list" style="margin-top:16px"><div class="stat-row"><span>Score de risco</span><strong>${item.riskScore}/25</strong></div><div class="stat-row"><span>Criticidade</span>${criticalityBadge(item.criticality)}</div><div class="stat-row"><span>Risco consolidado</span>${riskBadge(item.risk)}</div></div></section></div>`;
    if (tab==='team') return `<section class="form-card"><h2>Equipe e governança</h2><p>Responsáveis e papéis na iniciativa.</p><div class="form-grid">${[['Gerente de projetos',item.manager],['Responsável técnico',item.technicalLead],['Patrocinador',item.sponsor],['Demandante',item.requester],['Chefe responsável',item.chief],['Contatos',item.contacts],['Disponibilidade',item.availability],['Partes interessadas',item.stakeholders]].map(([l,v])=>`<div class="meta-item"><small>${l}</small><strong>${escapeHtml(v||'Não informado')}</strong></div>`).join('')}</div></section><section class="form-card"><h2>Matriz RACI</h2><p>R — Responsável, A — Aprovador, C — Consultado, I — Informado.</p>${renderRaci(item)}<button class="button button--secondary" data-action="document" data-id="${item.id}" data-kind="Matriz RACI">${icon('file-text')}Gerar Matriz RACI</button></section>`;
    if (tab==='milestones') return `<section class="form-card"><h2>Marcos da iniciativa</h2><p>Datas planejadas, realizadas e evidências.</p>${renderMilestoneTable(item)}<button class="button" data-action="add-milestone" data-id="${item.id}">${icon('plus')}Adicionar marco</button></section><section class="form-card"><h2>Linha do tempo de marcos</h2><p>Visão cronológica das principais entregas.</p>${renderTimeline(item.milestones.map(m=>({date:m.actual||m.planned,type:m.status,title:m.name,note:`${m.description} • Responsável: ${m.owner}`})))}</section>`;
    if (tab==='schedule') return renderScheduleWorkspace(item);
    if (tab==='files') return `<section class="form-card"><h2>Repositório da iniciativa</h2><p>Arquivos, versões, etiquetas e responsáveis.</p>${renderUploadZone(item.id)}<div style="height:14px"></div>${renderFilesTable(item)}</section>`;
    if (tab==='evolution') return renderEvolutionWorkspace(item);
    if (tab==='meetings') return renderMeetingWorkspace(item);
    if (tab==='reports') return renderStatusReportWorkspace(item);
    if (tab==='pdf') return renderPdfBuilder(item);
    return renderOverview(item);
  }

  function renderOverview(item) {
    const health = [
      ['Prazo',isDelayed(item)?'Crítico':'Adequado',isDelayed(item)?'#b33333':'#147a4b'],['Escopo','Estável','#147a4b'],['Risco',item.risk,['Alto','Crítico'].includes(item.risk)?'#b33333':item.risk==='Médio'?'#b27a18':'#147a4b'],['Equipe',item.availability.includes('Parcial')?'Atenção':'Adequada',item.availability.includes('Parcial')?'#b27a18':'#147a4b'],['Entregas',`${item.progress}% concluído`,item.progress<30?'#b27a18':'#147a4b'],['Atualização',isStale(item)?'Desatualizada':'Em dia',isStale(item)?'#b33333':'#147a4b']
    ];
    const quick = [['edit','Editar iniciativa',`#/initiative/${item.id}/edit`],['activity','Registrar evolução','evolution'],['target','Atualizar percentual','progress'],['shield','Registrar risco','risk'],['ban','Registrar impedimento','impediment'],['flag','Adicionar marco','milestone'],['calendar','Cadastrar reunião','meeting'],['file-text','Gerar status report','status'],['file','Gerar TAP','TAP'],['file','Gerar TEP','TEP'],['users','Gerar Matriz RACI','Matriz RACI'],['presentation','Relatório para reunião','pdf']];
    return `<section class="form-card"><h2>Saúde da iniciativa</h2><p>Leitura consolidada dos principais fatores de sucesso.</p><div class="health-grid">${health.map(([label,value,color])=>`<div class="health-item" style="--health-color:${color}"><div class="health-item__head"><span>${label}</span><i class="health-dot"></i></div><strong>${escapeHtml(value)}</strong></div>`).join('')}</div></section><section class="form-card"><h2>Ações rápidas</h2><p>Registre movimentações e gere artefatos com os dados existentes.</p><div class="quick-actions">${quick.map(([iconName,label,action])=>action.startsWith('#')?`<a class="quick-action" href="${action}">${icon(iconName)}${label}</a>`:`<button class="quick-action" data-action="${['evolution','progress','risk','impediment','milestone','meeting'].includes(action)?'quick-'+action:'document'}" data-id="${item.id}" data-kind="${escapeHtml(action)}">${icon(iconName)}${label}</button>`).join('')}</div></section><div class="overview-grid"><div class="stack"><section class="form-card"><h2>Visão executiva</h2><p>Síntese da situação atual.</p><div class="report-columns"><div><p class="eyebrow">Objetivo</p><p>${escapeHtml(item.objective)}</p></div><div><p class="eyebrow">Escopo resumido</p><p>${escapeHtml(item.scope)}</p></div><div><p class="eyebrow">Resultados esperados</p><p>${escapeHtml(item.expectedResults)}</p></div><div><p class="eyebrow">Próximos passos</p><p>${escapeHtml(item.deliveries)}</p></div></div></section><section class="form-card"><h2>Progresso e situação</h2><p>Andamento consolidado da iniciativa.</p><div class="kpi-feature"><div class="gauge" style="--value:${item.progress};--gauge-color:${item.progress===100?'#147a4b':'#2877b5'}"><span class="gauge__value">${item.progress}%<small>concluído</small></span></div><div class="stat-list"><div class="stat-row"><span>Situação atual</span>${statusBadge(item.status)}</div><div class="stat-row"><span>Início</span><strong>${formatDate(item.start)}</strong></div><div class="stat-row"><span>Término original</span><strong>${formatDate(item.originalEnd)}</strong></div><div class="stat-row"><span>Término atual</span><strong>${formatDate(item.end)}</strong></div><div class="stat-row"><span>Ciclo</span><strong>${escapeHtml(item.cycle)}</strong></div></div></div></section></div><div class="stack"><section class="form-card"><h2>Próximos marcos</h2><p>Entregas prioritárias.</p>${renderList(item.milestones.filter(m=>m.status!=='Concluído').slice(0,3).map(m=>({icon:'flag',tone:m.status==='Atrasado'?'danger':'warning',title:m.name,copy:m.owner,meta:formatDate(m.planned),href:'#'})))}</section><section class="form-card"><h2>Riscos e impedimentos</h2><p>Pontos que exigem atenção.</p>${item.risks.length?`<div class="callout ${['Alto','Crítico'].includes(item.risk)?'danger':'warning'}"><strong>${escapeHtml(item.risks[0].category)} • ${escapeHtml(item.risk)}</strong><p>${escapeHtml(item.risks[0].description)}</p></div>`:'<div class="callout"><strong>Sem riscos ativos</strong><p>Nenhum risco registrado.</p></div>'}${item.impediment?`<div class="callout danger" style="margin-top:8px"><strong>Impedimento aberto</strong><p>${escapeHtml(item.impedimentText)}</p></div>`:''}</section><section class="form-card"><h2>Últimas atualizações</h2><p>Movimentações recentes.</p>${renderTimeline(item.evolutions.slice(0,3))}</section></div></div>`;
  }

  function renderRiskMatrix(risks) { let cells=''; for(let impact=5;impact>=1;impact--){for(let probability=1;probability<=5;probability++){const score=impact*probability; const level=score>=20?'critical':score>=12?'high':score>=6?'medium':'low'; const count=risks.filter(r=>Number(r.impact)===impact&&Number(r.probability)===probability).length; cells+=`<div class="matrix-cell ${level} ${count?'has-risk':''}" data-count="${count}" title="Probabilidade ${probability}, impacto ${impact}">${score}</div>`;}} return `<div class="risk-matrix"><div class="matrix-axis-y">IMPACTO</div>${cells}<div class="matrix-x">PROBABILIDADE →</div></div>`; }
  function renderRaci(item) { const rows=item.raci?.length?item.raci:[['Definir escopo','A','R','C','I'],['Validar entregas','A','C','R','I'],['Executar atividades','I','A','C','R']]; return `<div class="raci-grid"><div class="raci-head">Entrega / atividade</div><div class="raci-head">GP</div><div class="raci-head">Patrocinador</div><div class="raci-head">Área</div><div class="raci-head">Equipe técnica</div>${rows.map(row=>row.map((cell,i)=>`<div>${i?`<span class="raci-code">${escapeHtml(cell)}</span>`:escapeHtml(cell)}</div>`).join('')).join('')}</div>`; }
  function renderMilestoneTable(item) { return item.milestones?.length?`<div class="table-wrap" style="margin-bottom:14px"><table class="data-table"><thead><tr><th>Marco</th><th>Responsável</th><th>Planejado</th><th>Realizado</th><th>Situação</th><th>Evidência</th></tr></thead><tbody>${item.milestones.map(m=>`<tr><td class="name-cell"><strong>${escapeHtml(m.name)}</strong><br><small>${escapeHtml(m.description)}</small></td><td>${escapeHtml(m.owner)}</td><td>${formatDate(m.planned)}</td><td>${formatDate(m.actual)}</td><td>${statusBadge(m.status==='Concluído'?'Concluída':m.status==='Atrasado'?'Atrasada':'Em planejamento')}</td><td>${escapeHtml(m.evidence||'—')}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state"><h3>Nenhum marco cadastrado</h3><p>Adicione o primeiro marco desta iniciativa.</p></div>`; }
  function renderScheduleTable(item,editable=false) { const activities=item.activities||[]; return `<table class="data-table"><thead><tr><th>Fase / atividade</th><th>Responsável</th><th>Início</th><th>Término</th><th>Progresso</th><th>Situação</th>${editable?'<th>Ações</th>':''}</tr></thead><tbody>${activities.map((a,index)=>`<tr><td class="name-cell"><strong>${escapeHtml(a.name)}</strong></td><td>${escapeHtml(a.owner)}</td><td>${formatDate(a.start)}</td><td>${formatDate(a.end)}</td><td><div class="table-progress">${Number(a.progress)||0}%${progressBar(Number(a.progress)||0)}</div></td><td>${escapeHtml(a.status)}</td>${editable?`<td><button class="button button--ghost button--small" type="button" data-action="edit-activity" data-id="${item.id}" data-index="${index}">${icon('edit')}Editar</button></td>`:''}</tr>`).join('')||`<tr><td colspan="${editable?7:6}">Nenhum item cadastrado no cronograma.</td></tr>`}</tbody></table>`; }
  function renderGantt(item) { const acts=item.activities||[]; return `<div class="gantt"><div class="gantt-head"><div>Fase / atividade</div>${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map(m=>`<div>${m}</div>`).join('')}</div>${acts.map((a,i)=>`<div class="gantt-row"><div class="gantt-label">${escapeHtml(a.name)}</div><div style="grid-column:${2+(i*2)%9}/span ${Math.min(4,2+i%3)}"><span class="gantt-bar" style="left:3px;right:3px;background:${a.progress===100?'#147a4b':'#2877b5'}">${a.progress}%</span></div></div>`).join('')}</div>`; }
  function renderUploadZone(id) { return `<label class="upload-zone" data-upload-zone="${id}">${icon('upload')}<strong>Arraste arquivos para cá ou clique para selecionar</strong><p>Formatos aceitos: PDF, DOCX, XLSX, PPTX e imagens.</p><input class="sr-only" type="file" multiple data-upload-input="${id}"></label>`; }
  function renderFilesTable(item) { return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Arquivo</th><th>Categoria</th><th>Responsável</th><th>Inclusão</th><th>Versão</th><th>Etiquetas</th><th>Ações</th></tr></thead><tbody>${(item.files||[]).map((f,index)=>`<tr><td class="name-cell">${icon('file-text')} <strong>${escapeHtml(f.name)}</strong></td><td>${escapeHtml(f.category)}</td><td>${escapeHtml(shortName(f.owner))}</td><td>${formatDate(f.date)}</td><td>v${escapeHtml(f.version)}</td><td>${(f.tags||[]).map(t=>badge(t,'info')).join(' ')}</td><td><button class="button button--ghost button--small" data-action="preview-file" data-id="${item.id}" data-index="${index}">Visualizar</button><button class="button button--ghost button--small" data-action="delete-file" data-id="${item.id}" data-index="${index}">Excluir</button></td></tr>`).join('')}</tbody></table></div>`; }
  function renderTimeline(items=[]) { return `<div class="timeline">${items.map(item=>{const automatic=item.automatic||item.source==='system'||/^(Iniciativa criada|Status report|Reunião |Item do cronograma|Arquivo inserido|Iniciativa atualizada)/i.test(item.title||'');return `<article class="timeline-item ${automatic?'timeline-item--system':''}" style="--timeline-color:${automatic?'#4b8791':item.type==='Impedimento'?'#b33333':item.type==='Decisão'?'#725ca8':'#2877b5'}"><div class="timeline-item__meta"><span class="timeline-item__date">${formatDate(item.date)}${item.time?' • '+item.time:''} • ${escapeHtml(item.author?shortName(item.author):item.type||'Registro')}</span>${automatic?badge('Ação automática','info','settings'):badge('Registro do GP','purple','user')}</div><strong>${escapeHtml(item.title||item.name)}</strong><p>${escapeHtml(item.note||item.description||'')}</p></article>`;}).join('')||'<div class="empty-state"><h3>Sem histórico</h3><p>Nenhuma movimentação foi registrada.</p></div>'}</div>`; }
  function renderMeetings(item) { const meetings=item.meetings||[]; const indexed=meetings.map((meeting,index)=>({meeting,index})); const future=indexed.filter(({meeting:m})=>new Date(`${m.date}T${m.time||'00:00'}`)>=new Date()); const past=indexed.filter(({meeting:m})=>new Date(`${m.date}T${m.time||'00:00'}`)<new Date()); return `<div class="report-columns"><div><p class="eyebrow">Próximas reuniões</p>${future.length?future.map(({meeting,index})=>meetingCard(meeting,item,index)).join(''):'<div class="callout">Nenhuma reunião futura.</div>'}</div><div><p class="eyebrow">Reuniões realizadas</p>${past.length?past.map(({meeting,index})=>meetingCard(meeting,item,index)).join(''):'<div class="callout">Nenhuma reunião realizada.</div>'}</div></div>`; }
  function meetingCard(m,item,index) { const documents=(m.documents||[]).map(doc=>typeof doc==='string'?doc:doc.name).filter(Boolean); return `<article class="document-card meeting-card" style="margin-bottom:10px"><div class="badges">${badge(m.type||'Reunião','info')} ${badge(`${formatDate(m.date)}${m.time?' • '+m.time:''}`,'purple','calendar')}</div><h3>${escapeHtml(m.title)}</h3><p><strong>Participantes:</strong> ${escapeHtml(Array.isArray(m.participants)?m.participants.join(', '):m.participants||'Não informados')}</p><p><strong>Pauta:</strong> ${escapeHtml(m.agenda||'Não informada')}</p><p><strong>Objetivos:</strong> ${escapeHtml(m.objectives||'Não informados')}</p>${documents.length?`<div class="attachment-list">${documents.map(name=>`<span>${icon('file-text')}${escapeHtml(name)}</span>`).join('')}</div>`:''}<div class="document-card__actions"><button class="button button--secondary button--small" type="button" data-action="edit-meeting" data-id="${item.id}" data-index="${index}">${icon('edit')}Editar</button><button class="button button--ghost button--small" type="button" data-action="meeting-ai" data-id="${item.id}">${icon('sparkles')}Resumir reunião</button><button class="button button--ghost button--small" type="button" data-action="document" data-id="${item.id}" data-kind="Ata de reunião">Gerar ata</button></div></article>`; }
  function renderStatusReports(item) { const reports=(item.statusReports||[]).map((r,index)=>({...r,originalIndex:index})).sort((a,b)=>String(b.date).localeCompare(String(a.date))); return `<div class="status-report-list">${reports.map((r,index)=>`<article class="status-report-card"><div class="status-report-card__header"><div><span class="eyebrow">Status report ${escapeHtml(r.version?`v${r.version}`:`#${reports.length-index}`)}</span><h3>${formatDate(r.date)}</h3><p>${escapeHtml(r.type||'')} · ${escapeHtml(r.monitoringStatus||'')} · ${escapeHtml(r.owner||'')}</p></div><button class="button button--ghost button--small" type="button" data-action="edit-status-report" data-id="${item.id}" data-index="${r.originalIndex}">${icon('edit')}Editar</button></div><div class="report-columns"><div><strong>Últimas realizações / justificativas</strong><p>${escapeHtml(r.achievements||r.summary||'Não informado')}</p></div><div><strong>Impedimentos</strong><p>${escapeHtml(r.impediments||'Nenhum impedimento informado.')}</p></div><div><strong>Próximas etapas / passos</strong><p>${escapeHtml(r.nextSteps||'Não informado')}</p></div></div></article>`).join('')||'<div class="empty-state"><h3>Nenhum status report</h3><p>Crie o primeiro registro de acompanhamento.</p></div>'}</div>`; }

  function renderPdfBuilder(item) { const blocks=['Identificação e governança','Objetivo e escopo','Progresso e datas','Principais entregas','Marcos','Riscos e impedimentos','Decisões pendentes','Evolução recente','Próximos passos','Cronograma resumido','Histórico de reuniões']; return `<div class="overview-grid"><section class="form-card no-print"><h2>Composição do documento</h2><p>Selecione os blocos do relatório executivo.</p><div class="settings-list">${blocks.map((b,i)=>`<label class="setting-row"><span><strong>${escapeHtml(b)}</strong><small>Incluir no PDF para reunião</small></span><input class="switch pdf-block-toggle" type="checkbox" data-block="${i}" checked></label>`).join('')}</div><div class="page-actions" style="margin-top:15px"><button class="button button--secondary" data-action="print">${icon('printer')}Imprimir / salvar PDF</button><button class="button" data-action="pdf-generate" data-id="${item.id}">${icon('download')}Gerar PDF <span class="badge">Simulação</span></button></div></section><section class="report-preview" id="pdf-preview"><div class="report-preview__band"><p>TRIBUNAL DE JUSTIÇA DO RIO GRANDE DO SUL • EGP/PMO</p><h2>${escapeHtml(item.title)}</h2></div><div data-pdf-block="0" class="report-section"><div class="report-kpis"><div class="report-kpi"><strong>${item.id}</strong><small>Identificação</small></div><div class="report-kpi"><strong>${escapeHtml(shortName(item.manager))}</strong><small>Gerente</small></div><div class="report-kpi"><strong>${item.progress}%</strong><small>Progresso</small></div><div class="report-kpi"><strong>${escapeHtml(item.status)}</strong><small>Situação</small></div></div></div><div data-pdf-block="1" class="report-section"><h3>Objetivo e escopo</h3><p>${escapeHtml(item.objective)}</p><p>${escapeHtml(item.scope)}</p></div><div data-pdf-block="2" class="report-section"><h3>Período e evolução</h3><p>Início: ${formatDate(item.start)} • Término atual: ${formatDate(item.end)} • Atualização: ${formatDate(item.updated)}</p>${progressBar(item.progress)}</div><div data-pdf-block="3" class="report-section"><h3>Principais entregas</h3><p>${escapeHtml(item.deliveries)}</p></div><div class="report-columns"><div data-pdf-block="4" class="report-section"><h3>Marcos</h3><ul>${item.milestones.slice(0,4).map(m=>`<li>${escapeHtml(m.name)} — ${formatDate(m.planned)}</li>`).join('')}</ul></div><div data-pdf-block="5" class="report-section"><h3>Riscos e impedimentos</h3><p>${escapeHtml(item.risks[0]?.description||'Sem riscos ativos.')}</p><p>${escapeHtml(item.impedimentText||'Sem impedimentos ativos.')}</p></div></div><div data-pdf-block="6" class="report-section"><h3>Decisões pendentes</h3><p>Validar priorização e disponibilidade das equipes para o próximo ciclo de entrega.</p></div><div data-pdf-block="7" class="report-section"><h3>Evolução recente</h3>${renderTimeline(item.evolutions.slice(0,2))}</div><div data-pdf-block="8" class="report-section"><h3>Próximos passos</h3><p>${escapeHtml(item.deliveries)}</p></div><div data-pdf-block="9" class="report-section"><h3>Cronograma resumido</h3>${renderScheduleTable(item)}</div><div data-pdf-block="10" class="report-section"><h3>Últimas reuniões</h3><p>${item.meetings.slice(0,2).map(m=>`${formatDate(m.date)} — ${m.title}`).join('<br>')}</p></div></section></div>`; }

  function createRepositoryFolder({ name, parent = '', isSubfolder = false }) {
    const clean = String(name || '').trim();
    if (!clean) {
      showToast('Informe o nome da pasta','O nome da pasta é obrigatório para criar a organização.','danger');
      return null;
    }
    const normalized = isSubfolder && parent && parent !== 'Raiz' ? `${parent} / ${clean}` : clean;
    if (D.repositoryFolders.includes(normalized)) {
      showToast('Pasta duplicada','Já existe uma pasta com esse nome no repositório.','warning');
      return null;
    }
    D.repositoryFolders.push(normalized);
    state.repositoryFolder = normalized;
    renderRepository();
    showToast('Pasta criada',`${normalized} foi adicionada ao repositório.`);
    return normalized;
  }

  function openRepositoryFolderModal(parent = '') {
    const selectedParent = parent && parent !== 'Todos' && parent !== 'Raiz' ? parent : '';
    const isSubfolder = Boolean(selectedParent);
    const parentOptions = ['Raiz', ...D.repositoryFolders].filter(folder => folder !== 'Todos' && folder !== selectedParent);
    showModal({
      title: 'Criar nova pasta',
      eyebrow: 'Repositório do EGP',
      confirm: 'Criar pasta',
      body: `<form id="repository-folder-form" class="form-grid"><div class="field span-2"><label for="field-folder-name">Nome da pasta</label><input id="field-folder-name" name="folderName" type="text" placeholder="Ex.: Planejamento trimestral" autofocus></div><label class="switch-field span-2"><input class="switch" type="checkbox" name="folderIsSubfolder" ${isSubfolder ? 'checked' : ''}><span>É subpasta de alguma existente</span></label><div class="field span-2" ${isSubfolder ? '' : 'hidden'} id="folder-parent-wrap"><label for="field-folder-parent">Selecione a pasta pai</label><select id="field-folder-parent" name="folderParent">${options(parentOptions, selectedParent || (parentOptions[0] || ''), 'Raiz')}</select></div></form>`,
      onConfirm: () => {
        const form = document.getElementById('repository-folder-form');
        if (!form) return;
        const formData = new FormData(form);
        const name = String(formData.get('folderName') || '').trim();
        const isSub = formData.get('folderIsSubfolder') === 'on';
        const parentValue = String(formData.get('folderParent') || '').trim();
        if (!name) {
          showToast('Informe o nome da pasta','O nome da pasta é obrigatório.','danger');
          return;
        }
        if (isSub && parentValue && parentValue !== 'Raiz') {
          createRepositoryFolder({ name, parent: parentValue, isSubfolder: true });
          return;
        }
        createRepositoryFolder({ name, parent: '', isSubfolder: false });
      }
    });

    const checkbox = document.querySelector('[name="folderIsSubfolder"]');
    const parentWrap = document.getElementById('folder-parent-wrap');
    if (checkbox && parentWrap) {
      checkbox.addEventListener('change', () => {
        parentWrap.hidden = !checkbox.checked;
      });
    }
  }

  function renderRepository() {
    const files=D.repositoryFiles.filter(f=>state.repositoryFolder==='Todos'||f.folder===state.repositoryFolder);
    main.innerHTML=`<div class="page">${breadcrumb([{label:'Repositório do EGP'}])}${pageHeader('Repositório do EGP','Documentos institucionais, modelos, normativos e conhecimento compartilhado.',`<button class="button" data-action="repo-upload">${icon('upload')}Enviar arquivos</button>`)}${demoBanner()}<section class="filter-bar"><div class="field field--search"><label for="repo-search">Pesquisar documentos</label><div class="input-wrap">${icon('search')}<input id="repo-search" placeholder="Nome, responsável ou etiqueta…"></div></div><div class="field"><label for="repo-format">Formato</label><select id="repo-format">${options(['PDF','DOCX','XLSX','PPTX'])}</select></div><div class="field"><label for="repo-owner">Responsável</label><select id="repo-owner">${options(D.managers.map(m=>m.short))}</select></div><div class="segmented"><button class="segment active">${icon('grid')}</button><button class="segment">${icon('list')}</button></div></section><div class="repository-layout"><aside class="folder-tree"><div class="folder-tree__header"><h3>Pastas</h3><button class="folder-tree__add" type="button" data-action="new-folder" data-parent="Raiz" aria-label="Criar nova pasta">${icon('plus')}</button></div>${['Todos',...D.repositoryFolders].map(folder=>`<button class="folder-item ${state.repositoryFolder===folder?'active':''}" data-folder="${escapeHtml(folder)}">${icon('folder')}${escapeHtml(folder)}</button>`).join('')}</aside><section><div class="toolbar"><p class="toolbar__summary"><strong>${escapeHtml(state.repositoryFolder)}</strong> • ${files.length} itens</p><div class="badges">${badge(`${files.filter(f=>f.favorite).length} favoritos`,'warning','star')}${badge(`${files.filter(f=>f.shared).length} compartilhados`,'info','users')}</div></div><div class="document-grid">${files.map(file=>`<article class="document-card"><span class="document-card__icon">${icon('file')}</span><h3>${escapeHtml(file.name)}</h3><p>${escapeHtml(file.folder)} • ${file.size}<br>Responsável: ${escapeHtml(file.owner)}</p><div class="badges">${badge(file.format,'purple')}${file.favorite?badge('Favorito','warning','star'):''}${file.shared?badge('Compartilhado','info','users'):''}</div><div class="document-card__meta"><span>${file.date}</span><span>v${file.version}</span></div><div class="document-card__actions"><button class="button button--secondary button--small" data-action="repo-file">${icon('eye')}Visualizar</button><button class="button button--ghost button--small" data-action="repo-file">${icon('download')}Baixar</button><button class="button button--ghost button--small" data-action="repo-file">${icon('more')}Ações</button></div></article>`).join('')}</div></section></div></div>`;
  }

  function legacyRenderReports(kind='reports') {
    const items=state.initiatives.filter(i=>!i.archived);
    if(kind==='critical') return renderCritical(items);
    if(kind==='impediments') return renderImpediments(items);
    if(kind==='gp-report') return renderGpReport(items);
    const actions=`<button class="button button--secondary" data-action="print">${icon('printer')}Imprimir</button><button class="button" data-action="export-csv">${icon('download')}Exportar dados</button>`;
    main.innerHTML=`<div class="page">${breadcrumb([{label:'Relatórios',href:'#/reports'},{label:'Relatórios gerais'}])}${pageHeader('Relatórios gerais','Análises operacionais e gerenciais calculadas a partir do portfólio demonstrativo.',actions)}${demoBanner()}<section class="filter-bar"><div class="field"><label for="report-cycle">Ciclo</label><select id="report-cycle">${options(D.cycles)}</select></div><div class="field"><label for="report-gp">Gerente</label><select id="report-gp">${managerOptions()}</select></div><div class="field"><label for="report-area">Área</label><select id="report-area">${options(D.areas)}</select></div><div class="field"><label for="report-status">Situação</label><select id="report-status">${options(D.statuses)}</select></div><button class="button button--secondary">${icon('filter')}Aplicar</button></section><section class="metrics-grid">${metric('Portfólio total',items.length,'briefcase','#2877b5')}${metric('Conclusão média',`${average(items,'progress')}%`,'target','#147a4b')}${metric('Atrasadas',items.filter(isDelayed).length,'clock','#b33333')}${metric('Riscos altos',items.filter(i=>['Alto','Crítico'].includes(i.risk)).length,'shield','#a44444')}${metric('Marcos futuros',items.flatMap(i=>i.milestones).filter(m=>m.status!=='Concluído').length,'flag','#725ca8')}</section><div class="dashboard-grid">${panel('Portfólio por situação','Distribuição consolidada',C.donut(C.counts(items,'status'),'iniciativas'),'panel--wide')}${panel('Situação dos prazos','Atrasadas, próximas e no prazo',C.bars({'Atrasadas':items.filter(isDelayed).length,'Próximas do prazo':items.filter(isDueSoon).length,'No prazo':items.filter(i=>!isDelayed(i)&&!isDueSoon(i)).length},{colors:['#b33333','#d4931f','#147a4b']}))}${panel('Portfólio por GP','Carga de trabalho atual',C.bars(C.counts(items,i=>shortName(i.manager)),{limit:9,short:v=>v.split(' ')[0]}),'panel--wide')}${panel('Riscos por nível','Distribuição dos riscos',C.donut(C.counts(items,'risk'),'iniciativas'))}${panel('Iniciativas por objetivo','Aderência ao planejamento estratégico',C.bars(C.counts(items,'strategicObjective'),{limit:8,short:v=>v.replace(/ —.*/, '')}),'panel--wide')}${panel('Distribuição DITIC','Classificação das iniciativas',C.bars(C.counts(items,'classification'),{limit:8}))}${panel('Evolução da conclusão','Média simulada por mês',C.line([44,47,49,52,56,59,62,65,average(items,'progress')],['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set']),'panel--wide')}${panel('Marcos vencidos e futuros','Situação consolidada',C.bars({'Vencidos':items.flatMap(i=>i.milestones).filter(m=>m.status==='Atrasado').length,'Próximos 30 dias':items.flatMap(i=>i.milestones).filter(m=>{const d=Math.ceil((new Date(m.planned)-new Date())/86400000);return d>=0&&d<=30}).length,'Concluídos':items.flatMap(i=>i.milestones).filter(m=>m.status==='Concluído').length},{colors:['#b33333','#d4931f','#147a4b']}))}</div></div>`;
  }

  function renderCritical(items) { const critical=items.filter(i=>i.criticality==='Crítica'||(['Alto','Crítico'].includes(i.risk)&&isDelayed(i))).sort((a,b)=>b.riskScore-a.riskScore); main.innerHTML=`<div class="page">${breadcrumb([{label:'Relatórios',href:'#/reports'},{label:'Iniciativas críticas'}])}${pageHeader('Iniciativas críticas','Ranking para atuação prioritária, considerando risco, prazo, impedimentos e criticidade.',`<button class="button button--secondary" data-action="print">${icon('printer')}Imprimir</button>`)}${demoBanner()}<section class="metrics-grid">${metric('Iniciativas críticas',critical.length,'alert-triangle','#b33333')}${metric('Com atraso',critical.filter(isDelayed).length,'clock','#b33333')}${metric('Risco crítico',critical.filter(i=>i.risk==='Crítico').length,'shield','#a23a3a')}${metric('Com impedimento',critical.filter(i=>i.impediment).length,'ban','#aa6c18')}${metric('Decisões pendentes',Math.ceil(critical.length*.42),'landmark','#725ca8')}</section><div class="table-wrap"><table class="data-table"><thead><tr><th>Ranking</th><th>Iniciativa</th><th>Responsável</th><th>Criticidade</th><th>Risco</th><th>Atraso</th><th>Impedimento</th><th>Plano de ação</th><th>Tendência</th></tr></thead><tbody>${critical.slice(0,40).map((i,index)=>`<tr><td><strong>#${index+1}</strong></td><td class="name-cell"><a href="#/initiative/${i.id}">${i.id}<br>${escapeHtml(i.title)}</a></td><td>${escapeHtml(shortName(i.manager))}</td><td>${criticalityBadge(i.criticality)}</td><td>${riskBadge(i.risk)}</td><td>${isDelayed(i)?badge('Atrasada','danger','clock'):badge('No prazo','success','check')}</td><td>${i.impediment?badge('Aberto','danger','ban'):'—'}</td><td>${escapeHtml(i.risks[0]?.response||'Monitoramento quinzenal')}</td><td>${badge(index%3===0?'Piora':index%3===1?'Estável':'Melhora',index%3===0?'danger':index%3===1?'warning':'success')}</td></tr>`).join('')}</tbody></table></div></div>`; }
  function renderImpediments(items) { const impeded=items.filter(i=>i.impediment).sort((a,b)=>a.impedimentSince.localeCompare(b.impedimentSince)); main.innerHTML=`<div class="page">${breadcrumb([{label:'Relatórios',href:'#/reports'},{label:'Com impedimentos'}])}${pageHeader('Iniciativas com impedimentos','Bloqueios ativos, tempo em aberto, responsáveis e necessidade de escalonamento.',`<button class="button button--secondary" data-action="print">${icon('printer')}Imprimir</button>`)}${demoBanner()}<section class="metrics-grid">${metric('Impedimentos abertos',impeded.length,'ban','#b33333')}${metric('Há mais de 30 dias',impeded.filter(i=>daysBetween(i.impedimentSince)>30).length,'clock','#b33333')}${metric('Requer escalonamento',impeded.filter(i=>daysBetween(i.impedimentSince)>45).length,'alert-triangle','#a13c3c')}${metric('Impacto alto',impeded.filter(i=>['Alta','Crítica'].includes(i.criticality)).length,'activity','#af6c18')}</section><div class="table-wrap"><table class="data-table"><thead><tr><th>Iniciativa</th><th>Impedimento</th><th>Categoria</th><th>Registro</th><th>Tempo em aberto</th><th>Responsável</th><th>Plano de ação</th><th>Prazo</th><th>Escalonar</th></tr></thead><tbody>${impeded.map(i=>{const days=daysBetween(i.impedimentSince);return `<tr><td class="name-cell"><a href="#/initiative/${i.id}">${i.id}<br>${escapeHtml(i.title)}</a></td><td class="name-cell">${escapeHtml(i.impedimentText)}</td><td>${escapeHtml(i.impedimentCategory)}</td><td>${formatDate(i.impedimentSince)}</td><td>${badge(`${days} dias`,days>45?'danger':days>30?'warning':'info','clock')}</td><td>${escapeHtml(shortName(i.manager))}</td><td>${escapeHtml(i.risks[0]?.response||'Acompanhar e escalar preventivamente.')}</td><td>${formatDate(i.end)}</td><td>${days>45?badge('Sim','danger','alert-triangle'):badge('Não','success','check')}</td></tr>`}).join('')}</tbody></table></div></div>`; }
  function renderGpReport(items) { const gp=state.gpReport; const mine=items.filter(i=>i.manager===gp); const manager=D.managers.find(m=>m.name===gp); const meetings=mine.flatMap(i=>i.meetings.map(m=>({...m,initiative:i}))).filter(m=>new Date(m.date)>=new Date()).slice(0,6); main.innerHTML=`<div class="page">${breadcrumb([{label:'Relatórios',href:'#/reports'},{label:'Relatório por GP'}])}${pageHeader('Relatório por gerente de projetos','Carga de trabalho, pendências, reuniões e desempenho individual.',`<button class="button button--secondary" data-action="print">${icon('printer')}Imprimir</button>`)}${demoBanner()}<section class="filter-bar"><div class="field field--search"><label for="gp-report-select">Gerente de projetos</label><select id="gp-report-select">${managerOptions(gp,'Selecione')}</select></div></section><section class="initiative-hero"><div class="initiative-hero__top"><div class="manager-head"><span class="manager-avatar">${D.initials(gp)}</span><div><span class="initiative-hero__id">${escapeHtml(manager?.role||'GP')}</span><h1>${escapeHtml(gp)}</h1><p>${escapeHtml(manager?.email||'')}</p></div></div></div></section><section class="metrics-grid">${metric('Total de iniciativas',mine.length,'briefcase','#2877b5')}${metric('Atrasadas',mine.filter(isDelayed).length,'clock','#b33333')}${metric('Críticas',mine.filter(i=>i.criticality==='Crítica').length,'alert-triangle','#a33c3c')}${metric('Com impedimentos',mine.filter(i=>i.impediment).length,'ban','#a96b17')}${metric('Conclusão média',`${average(mine,'progress')}%`,'target','#147a4b')}${metric('Atualizações pendentes',mine.filter(isStale).length,'alert','#a46e12')}</section><div class="dashboard-grid">${panel('Iniciativas por situação','Distribuição da carteira',C.donut(C.counts(mine,'status'),'iniciativas'),'panel--wide')}${panel('Carga de trabalho','Estimativa por nível de atenção',C.bars({'Regular':mine.filter(i=>!isDelayed(i)&&!i.impediment).length,'Atenção':mine.filter(i=>isDueSoon(i)||i.risk==='Alto').length,'Crítica':mine.filter(i=>isDelayed(i)||i.impediment).length},{colors:['#147a4b','#d4931f','#b33333']}))}${panel('Próximos marcos','Entregas da carteira',renderList(mine.flatMap(i=>i.milestones.map(m=>({...m,initiative:i}))).filter(m=>m.status!=='Concluído').slice(0,6).map(m=>({icon:'flag',tone:m.status==='Atrasado'?'danger':'warning',title:m.name,copy:`${m.initiative.id} • ${m.initiative.title}`,meta:formatDate(m.planned),href:`#/initiative/${m.initiative.id}`}))),'panel--wide')}${panel('Reuniões futuras','Agenda do gerente',renderList(meetings.map(m=>({icon:'calendar',title:m.title,copy:`${m.initiative.id} • ${m.initiative.title}`,meta:formatDate(m.date),href:`#/initiative/${m.initiative.id}`}))))}</div></div>`; }

  function legacyRenderManagers() { const items=state.initiatives.filter(i=>!i.archived); main.innerHTML=`<div class="page">${breadcrumb([{label:'Administração'},{label:'Cadastro de GP'}])}${pageHeader('Cadastro de gerentes de projetos','Equipe do EGP, carga de trabalho e áreas atendidas.',`<button class="button" data-action="new-manager">${icon('plus')}Cadastrar GP</button>`)}${demoBanner()}<div class="manager-grid">${D.managers.map(manager=>{const mine=items.filter(i=>i.manager===manager.name);return `<article class="manager-card"><div class="manager-head"><span class="manager-avatar">${D.initials(manager.name)}</span><div><h3>${escapeHtml(manager.name)}</h3><p>${escapeHtml(manager.email)}</p></div></div><div class="badges" style="margin-top:12px">${badge(manager.role,'info')}${badge(manager.active?'Ativo':'Inativo',manager.active?'success':'warning')}</div><div class="manager-stats"><div class="manager-stat"><strong>${mine.length}</strong><small>Iniciativas</small></div><div class="manager-stat"><strong>${mine.filter(isDelayed).length}</strong><small>Atrasadas</small></div><div class="manager-stat"><strong>${average(mine,'progress')}%</strong><small>Conclusão</small></div></div><p class="field-label">Áreas atendidas</p><div class="badges">${manager.areas.map(a=>badge(a,'purple')).join('')}</div><div class="document-card__actions"><button class="button button--secondary button--small" data-action="edit-manager">${icon('edit')}Editar</button><button class="button button--ghost button--small" data-action="toggle-manager">${manager.active?'Inativar':'Ativar'}</button></div></article>`}).join('')}</div></div>`; }
  function legacyRenderSettings() { const groups=[['Situações disponíveis','8 valores configurados','Aberta, planejamento, execução…'],['Ciclos de gestão','5 ciclos ativos','2024, 2025, 2026, 2026–2027…'],['Áreas institucionais','10 áreas cadastradas','Unidades responsáveis e demandantes'],['Classificações DITIC','6 classificações','Sustentação, evolução, inovação…'],['Categorias de risco','6 categorias','Tecnologia, prazo, pessoas…'],['Níveis de criticidade','5 níveis','Baixa a crítica'],['Tipos de documento','12 tipos','PDF, DOCX, XLSX e PPTX'],['Tipos de reunião','5 tipos','Planejamento, acompanhamento…'],['Modelos de notificação','7 modelos','Prazos, riscos e atualizações'],['Identidade visual','Tema institucional','Azul TJRS • modo claro'],['Parâmetros de atualização','30 dias','Prazo para considerar desatualizada']]; main.innerHTML=`<div class="page">${breadcrumb([{label:'Administração'},{label:'Configurações'}])}${pageHeader('Configurações do sistema','Parâmetros para adaptar o SISEGP à metodologia do EGP.',`<button class="button button--secondary" data-action="reset-data">${icon('rotate-ccw')}Restaurar dados originais</button>`)}${demoBanner()}<div class="settings-list">${groups.map(([name,value,description])=>`<article class="setting-row"><div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(description)}</p></div><button class="button button--ghost" data-action="edit-setting"><span class="setting-value">${escapeHtml(value)}</span>${icon('chevron-right')}</button></article>`).join('')}</div></div>`; }
  function legacyRenderGovernance() { const items=state.initiatives.filter(i=>!i.archived); const strategic=items.filter(i=>i.strategic); main.innerHTML=`<div class="page">${breadcrumb([{label:'Administração'},{label:'Relatórios de governança'}])}${pageHeader('Relatórios de governança','Visão consolidada para reuniões de decisão e acompanhamento estratégico.',`<button class="button" data-action="document" data-id="${items[0].id}" data-kind="Relatório de governança">${icon('presentation')}Exportar para governança</button>`)}${demoBanner()}<section class="metrics-grid">${metric('Iniciativas estratégicas',strategic.length,'target','#2877b5')}${metric('Aderência ao plano',`${Math.round(strategic.length/items.length*100)}%`,'landmark','#147a4b')}${metric('Decisões pendentes',Math.ceil(items.filter(i=>i.criticality==='Crítica').length*.7),'alert-triangle','#b33333')}${metric('Riscos corporativos',items.filter(i=>i.risk==='Crítico').length,'shield','#a13a3a')}${metric('Qualidade dos dados',`${100-Math.round(items.filter(isStale).length/items.length*100)}%`,'check-circle','#147a4b')}</section><div class="dashboard-grid">${panel('Aderência ao planejamento','Estratégicas e demais iniciativas',C.donut({'Estratégicas':strategic.length,'Não estratégicas':items.length-strategic.length},'iniciativas'),'panel--wide')}${panel('Desempenho por ciclo','Conclusão média estimada',C.bars(Object.fromEntries(D.cycles.map(cycle=>[cycle,average(items.filter(i=>i.cycle===cycle),'progress')]))))}${panel('Iniciativas por objetivo','Distribuição estratégica',C.bars(C.counts(strategic,'strategicObjective'),{limit:8,short:v=>v.replace(/ —.*/, '')}),'panel--wide')}${panel('Indicadores de entrega','Prazo, atualização e conclusão',C.bars({'No prazo':items.filter(i=>!isDelayed(i)).length,'Atualizadas':items.filter(i=>!isStale(i)).length,'Concluídas':items.filter(i=>i.status==='Concluída').length},{colors:['#2877b5','#725ca8','#147a4b']}))}${panel('Principais impedimentos','Itens para escalonamento',renderList(items.filter(i=>i.impediment).slice(0,6).map(i=>({icon:'ban',tone:'danger',title:i.impedimentText,copy:`${i.id} • ${shortName(i.manager)}`,meta:`${daysBetween(i.impedimentSince)} dias`,href:`#/initiative/${i.id}`}))),'panel--wide')}${panel('Decisões aguardando governança','Priorização executiva',renderList(items.filter(i=>i.criticality==='Crítica').slice(0,6).map(i=>({icon:'landmark',tone:'warning',title:'Validar priorização e capacidade',copy:`${i.id} • ${i.title}`,meta:formatDate(i.updated),href:`#/initiative/${i.id}`}))))}</div></div>`; }

  function allSystemLogs(){
    const derived=state.initiatives.flatMap(item=>(item.evolutions||[]).filter(entry=>!entry.auditId).map((entry,index)=>{const automatic=entry.automatic||entry.source==='system'||/^(Iniciativa criada|Status report|Reunião |Item do cronograma|Arquivo inserido|Iniciativa atualizada|Progresso atualizado|Entrega concluída)/i.test(entry.title||'');const manualType=entry.type==='Entrega concluída'?'Entrega':/^Mudança/i.test(entry.type||'')?'Mudança':'Evolução';return{id:`${item.id}-${index}`,date:entry.date,time:entry.time||'',type:automatic?auditTypeFor(entry.title||'Alteração'):manualType,title:entry.title||entry.type||'Registro',details:entry.note||'',user:entry.author||item.manager,initiative:item.id,level:entry.type==='Impedimento'?'warning':'info',source:automatic?'system':'manual'};}));
    return [...state.auditLogs,...derived].sort((a,b)=>`${b.date||''}T${b.time||''}`.localeCompare(`${a.date||''}T${a.time||''}`));
  }
  function renderLogPagination(count){if(count<=1)return'';const start=Math.max(1,state.logPage-2),end=Math.min(count,start+4),pages=[];for(let i=start;i<=end;i++)pages.push(i);return`<nav class="pagination" aria-label="Paginação dos logs"><button class="page-button" data-log-page="${state.logPage-1}" ${state.logPage===1?'disabled':''}>‹</button>${pages.map(page=>`<button class="page-button ${page===state.logPage?'active':''}" data-log-page="${page}">${page}</button>`).join('')}<button class="page-button" data-log-page="${state.logPage+1}" ${state.logPage===count?'disabled':''}>›</button></nav>`;}
  function renderLogs(){
    const all=allSystemLogs(),search=state.logFilters.search.trim().toLocaleLowerCase('pt-BR');
    const filtered=all.filter(log=>(!search||[log.title,log.details,log.user,log.initiative,log.type].join(' ').toLocaleLowerCase('pt-BR').includes(search))&&(!state.logFilters.type||log.type===state.logFilters.type)&&(!state.logFilters.level||log.level===state.logFilters.level));
    const pages=Math.max(1,Math.ceil(filtered.length/state.logsPerPage));state.logPage=Math.min(state.logPage,pages);const current=filtered.slice((state.logPage-1)*state.logsPerPage,state.logPage*state.logsPerPage);const types=[...new Set(['Acesso','Alteração','Evolução','Mudança','Entrega','Status report','Reunião','Cronograma','Documento','Erro',...all.map(log=>log.type)])];
    main.innerHTML=`<div class="page">${breadcrumb([{label:'Administração'},{label:'Logs'}])}${pageHeader('Relatório de logs','Relatório consolidado de acessos, alterações, evoluções, entregas, documentos e erros.')}<section class="metrics-grid metrics-grid--six">${metric('Total de logs',all.length,'activity','#2877b5')}${metric('Acessos',all.filter(l=>l.type==='Acesso').length,'user','#4b8791')}${metric('Alterações',all.filter(l=>['Alteração','Evolução','Cronograma','Reunião','Status report'].includes(l.type)).length,'edit','#725ca8')}${metric('Entregas',all.filter(l=>l.type==='Entrega').length,'check-circle','#147a4b')}${metric('Erros',all.filter(l=>l.type==='Erro').length,'alert-triangle','#b33333')}${metric('Automáticos',all.filter(l=>l.source==='system').length,'settings','#2877b5')}</section><section class="filter-bar"><div class="field field--search"><label for="log-search">Pesquisar logs</label><div class="input-wrap">${icon('search')}<input id="log-search" type="search" value="${escapeHtml(state.logFilters.search)}" placeholder="Evento, usuário, iniciativa ou detalhe…"></div></div><div class="field"><label for="log-type">Tipo</label><select id="log-type" data-log-filter="type">${options(types,state.logFilters.type,'Todos os tipos')}</select></div><div class="field"><label for="log-level">Nível</label><select id="log-level" data-log-filter="level">${options(['info','warning','danger'],state.logFilters.level,'Todos os níveis')}</select></div></section><div class="toolbar"><p class="toolbar__summary"><strong>${filtered.length}</strong> logs encontrados • página ${state.logPage} de ${pages}</p></div><div class="table-wrap"><table class="data-table logs-table"><thead><tr><th>Data e hora</th><th>Tipo</th><th>Evento</th><th>Usuário</th><th>Iniciativa</th><th>Origem</th><th>Nível</th></tr></thead><tbody>${current.map(log=>`<tr><td>${formatDate(log.date)}<br><small>${escapeHtml(log.time||'—')}</small></td><td>${badge(log.type,'info')}</td><td class="name-cell"><strong>${escapeHtml(log.title)}</strong><br><small>${escapeHtml(log.details||'Sem detalhes adicionais.')}</small></td><td>${escapeHtml(shortName(log.user||'Sistema'))}</td><td>${log.initiative?`<a href="#/initiative/${escapeHtml(log.initiative)}">${escapeHtml(log.initiative)}</a>`:'—'}</td><td>${badge(log.source==='system'?'Automática':'Manual',log.source==='system'?'info':'purple',log.source==='system'?'settings':'user')}</td><td>${badge(log.level==='danger'?'Erro':log.level==='warning'?'Atenção':'Informação',log.level==='danger'?'danger':log.level==='warning'?'warning':'success')}</td></tr>`).join('')||'<tr><td colspan="7">Nenhum log encontrado para os filtros selecionados.</td></tr>'}</tbody></table></div>${renderLogPagination(pages)}</div>`;
  }

  function openActionScreen(action, target) {
    const card = target.closest('.document-card, .manager-card, .setting-row');
    state.actionContext = {
      action,
      id: target.dataset.id || '',
      index: target.dataset.index || '',
      title: card?.querySelector('h3')?.textContent?.trim() || target.dataset.kind || '',
      returnTo: location.hash || '#/dashboard'
    };
    location.hash = `#/action/${action}/${encodeURIComponent(state.actionContext.id || 'novo')}`;
  }

  function actionFields(kind, context) {
    const title = context.title || 'Item selecionado';
    const commonPreview = `<section class="report-preview"><div class="report-preview__band"><p>TRIBUNAL DE JUSTIÇA DO RIO GRANDE DO SUL • EGP/PMO</p><h2>${escapeHtml(title)}</h2></div><div class="report-section"><h3>Informações do documento</h3><div class="report-kpis"><div class="report-kpi"><strong>${escapeHtml(context.id || 'DOC')}</strong><small>Identificação</small></div><div class="report-kpi"><strong>1.0</strong><small>Versão</small></div><div class="report-kpi"><strong>PDF</strong><small>Formato</small></div><div class="report-kpi"><strong>EGP</strong><small>Responsável</small></div></div></div><div class="report-section"><h3>Conteúdo</h3><p>Documento institucional disponível para consulta, utilização e gerenciamento no repositório do EGP.</p></div></section>`;
    const screens = {
      'new-artifact': { title: 'Cadastrar modelo de artefato', description: 'Inclua um novo modelo institucional na central de documentos.', body: `<form id="action-form" class="form-card form-grid">${formField('Nome do modelo *','actionName','','text','span-2')}${formField('Categoria','actionCategory','Planejamento','select','',options(['Planejamento','Execução','Monitoramento','Reunião','Riscos','Encerramento','Governança'],'Planejamento','Selecione'))}${formField('Formato','actionFormat','DOCX','select','',options(['DOCX','XLSX','PDF','PPTX'],'DOCX','Selecione'))}${formField('Descrição','actionDescription','','textarea','span-4')}<div class="span-4 page-actions"><button class="button button--secondary" type="button" data-action="action-cancel">Cancelar</button><button class="button" type="submit">${icon('save')}Salvar modelo</button></div></form>` },
      'preview-artifact': { title: 'Visualizar modelo', description: 'Pré-visualização do conteúdo e dos metadados do modelo.', body: commonPreview },
      'use-artifact': { title: 'Utilizar modelo', description: 'Escolha a iniciativa e prepare o documento a partir dos dados existentes.', body: `<form id="action-form" class="form-card form-grid">${formField('Modelo','actionModel',title,'text','span-2')}${formField('Iniciativa','actionInitiative',state.initiatives[0].id,'select','span-2',options(state.initiatives.slice(0,60).map(i=>i.id),state.initiatives[0].id,'Selecione'))}${formField('Título do documento','actionTitle',title,'text','span-4')}<div class="span-4 page-actions"><button class="button" type="submit">${icon('file-text')}Preparar documento</button></div></form>` },
      'download-artifact': { title: 'Baixar modelo', description: 'Confira a versão selecionada antes de baixar.', body: `${commonPreview}<div class="page-actions" style="margin-top:14px"><button class="button" data-action="action-download">${icon('download')}Baixar arquivo</button></div>` },
      'duplicate-artifact': { title: 'Duplicar modelo', description: 'Crie uma nova versão editável sem alterar o original.', body: `<form id="action-form" class="form-card form-grid">${formField('Nome da cópia','actionName',`Cópia de ${title}`,'text','span-2')}${formField('Categoria','actionCategory','Planejamento','select','',options(['Planejamento','Execução','Monitoramento','Governança'],'Planejamento'))}${formField('Observação','actionNotes','','textarea','span-4')}<div class="span-4 page-actions"><button class="button" type="submit">${icon('copy')}Criar cópia</button></div></form>` },
      'new-folder': { title: 'Criar nova pasta', description: 'Organize os documentos do repositório em uma nova pasta.', body: `<form id="action-form" class="form-card form-grid" data-form-kind="new-folder">${formField('Nome da pasta *','actionName','','text','span-2')}<label class="switch-field span-2"><input class="switch" type="checkbox" name="folderIsSubfolder"><span>É subpasta de alguma existente</span></label><div class="field span-2" id="action-folder-parent-wrap" hidden>${formField('Pasta superior','actionParent',state.repositoryFolder==='Todos'?'Raiz':state.repositoryFolder,'select','',options(['Raiz',...D.repositoryFolders.filter(folder=>folder!=='Todos')],state.repositoryFolder==='Todos'?'Raiz':state.repositoryFolder))}</div><div class="span-4 page-actions"><button class="button" type="submit">${icon('folder-plus')}Criar pasta</button></div></form>` },
      'repo-upload': { title: 'Enviar arquivos ao repositório', description: 'Selecione a pasta, a categoria e os documentos.', body: `<form id="action-form" class="form-card form-grid">${formField('Pasta de destino','actionFolder',state.repositoryFolder,'select','span-2',options(D.repositoryFolders,state.repositoryFolder==='Todos'?D.repositoryFolders[0]:state.repositoryFolder))}${formField('Categoria','actionCategory','Documento institucional','text','span-2')}<label class="upload-zone span-4">${icon('upload')}<strong>Arraste arquivos para cá ou clique para selecionar</strong><p>PDF, DOCX, XLSX, PPTX e imagens</p><input class="sr-only" name="actionFiles" type="file" multiple></label><div class="span-4 page-actions"><button class="button" type="submit">${icon('upload')}Enviar arquivos</button></div></form>` },
      'repo-file': { title: 'Gerenciar documento', description: 'Consulte metadados, versões e opções do arquivo selecionado.', body: `${commonPreview}<section class="form-card"><h2>Histórico de versões</h2><p>Versões disponíveis para consulta.</p><div class="table-wrap"><table class="data-table"><thead><tr><th>Versão</th><th>Data</th><th>Responsável</th><th>Situação</th></tr></thead><tbody><tr><td>1.0</td><td>28/08/2026</td><td>Escritório de Gestão de Projetos</td><td>${badge('Atual','success')}</td></tr></tbody></table></div></section>` },
      'preview-file': { title: 'Visualizar arquivo da iniciativa', description: 'Pré-visualização do arquivo e de seus metadados.', body: commonPreview },
      'new-manager': { title: 'Cadastrar gerente de projetos', description: 'Adicione um profissional à equipe do EGP.', body: `<form id="action-form" class="form-card form-grid">${formField('Nome completo *','actionName','','text','span-2')}${formField('E-mail institucional','actionEmail','','email','span-2')}${formField('Função','actionRole','GP','select','',options(['GP','GP e chefe','Chefe'],'GP'))}${formField('Áreas atendidas','actionAreas','','text','span-3')}<div class="span-4 page-actions"><button class="button" type="submit">${icon('save')}Cadastrar profissional</button></div></form>` },
      'edit-manager': { title: 'Editar gerente de projetos', description: 'Atualize os dados funcionais e as áreas atendidas.', body: `<form id="action-form" class="form-card form-grid">${formField('Nome completo','actionName',title,'text','span-2')}${formField('E-mail institucional','actionEmail','nome@tjrs.jus.br','email','span-2')}${formField('Função','actionRole','GP','select','',options(['GP','GP e chefe','Chefe'],'GP'))}${formField('Situação','actionStatus','Ativo','select','',options(['Ativo','Inativo'],'Ativo'))}${formField('Áreas atendidas','actionAreas','Governança, DITIC','text','span-2')}<div class="span-4 page-actions"><button class="button" type="submit">${icon('save')}Salvar alterações</button></div></form>` },
      'toggle-manager': { title: 'Alterar situação do profissional', description: 'Confirme a alteração do vínculo com a equipe.', body: `<form id="action-form" class="form-card"><div class="callout warning"><strong>${escapeHtml(title)}</strong><p>A situação será alterada e o profissional permanecerá no histórico das iniciativas.</p></div><div class="page-actions" style="margin-top:14px"><button class="button" type="submit">Confirmar alteração</button></div></form>` },
      'edit-setting': { title: 'Editar configuração', description: 'Ajuste os valores disponíveis para uso no sistema.', body: `<form id="action-form" class="form-card form-grid">${formField('Configuração','actionName',title,'text','span-2')}${formField('Valor padrão','actionDefault','','text','span-2')}${formField('Valores disponíveis','actionValues','','textarea','span-4')}<label class="switch-field span-2"><input class="switch" type="checkbox" checked><span>Configuração ativa</span></label><div class="span-4 page-actions"><button class="button" type="submit">${icon('save')}Salvar configuração</button></div></form>` },
      'meeting-ai': { title: 'Resumo da reunião', description: 'Revise a síntese, as decisões e os encaminhamentos extraídos.', body: `<section class="form-card"><h2>Síntese executiva</h2><p>A reunião confirmou a evolução das entregas prioritárias e a necessidade de acompanhamento dos riscos de prazo.</p><div class="report-columns"><div><p class="eyebrow">Decisões</p><ul><li>Manter o escopo priorizado.</li><li>Validar o próximo marco com a área demandante.</li></ul></div><div><p class="eyebrow">Encaminhamentos</p><ul><li>Atualizar o cronograma até sexta-feira.</li><li>Apresentar evidências na próxima reunião.</li></ul></div></div><div class="page-actions"><button class="button button--secondary" data-action="action-complete">Transformar em tarefas</button><button class="button" data-action="action-complete">${icon('save')}Salvar resumo</button></div></section>` },
      'profile': { title: 'Meu perfil', description: 'Informações do usuário e preferências de interface.', body: `<section class="form-card"><div class="manager-head"><span class="manager-avatar">AC</span><div><h3>Antônio Carlos da Luz Cepa</h3><p>antonio.cepa@tjrs.jus.br</p></div></div><div class="form-grid" style="margin-top:18px">${formField('Função','actionRole','Chefe do EGP','text','span-2')}${formField('Unidade','actionUnit','Escritório de Gestão de Projetos','text','span-2')}<label class="switch-field span-2"><input class="switch" type="checkbox" checked><span>Receber alertas de prazo</span></label><label class="switch-field span-2"><input class="switch" type="checkbox" checked><span>Receber resumo semanal</span></label></div></section>` },
      'help': { title: 'Ajuda e primeiros passos', description: 'Atalhos para conhecer os principais fluxos do SISEGP.', body: `<div class="document-grid"><article class="document-card"><span class="document-card__icon">${icon('search')}</span><h3>Pesquisa global</h3><p>Use Ctrl+K para localizar iniciativas, pessoas e documentos.</p></article><article class="document-card"><span class="document-card__icon">${icon('briefcase')}</span><h3>Gestão de iniciativas</h3><p>Cadastre, filtre e acompanhe progresso, prazo e riscos.</p></article><article class="document-card"><span class="document-card__icon">${icon('file-text')}</span><h3>Documentos</h3><p>Gere artefatos usando automaticamente os dados cadastrados.</p></article></div>` }
    };
    return screens[kind] || { title: 'Executar ação', description: 'Revise as informações antes de continuar.', body: commonPreview };
  }

  function renderActionPage(kind) {
    const context = state.actionContext || { action: kind, id: state.params[1] || '', title: '', returnTo: '#/dashboard' };
    const screen = actionFields(kind, context);
    main.innerHTML = `<div class="page">${breadcrumb([{label:'Área de trabalho',href:context.returnTo || '#/dashboard'},{label:screen.title}])}${pageHeader(screen.title,screen.description,`<a class="button button--secondary" href="${context.returnTo || '#/dashboard'}">${icon('arrowLeft')}Voltar</a>`)}${screen.body}</div>`;
  }
  function removePresentationLabels(root) {
    root.querySelectorAll('.badge').forEach(badge=>{if(badge.textContent.trim()==='Simulação')badge.remove();});
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let node;
    while((node=walker.nextNode())) node.nodeValue=node.nodeValue
      .replace(/portfólio demonstrativo/gi,'portfólio atual')
      .replace(/média simulada por mês/gi,'média por mês')
      .replace(/ambiente demonstrativo/gi,'');
  }
  function renderNotFound() { main.innerHTML=`<div class="page">${breadcrumb([{label:'Página não encontrada'}])}<div class="empty-state">${icon('alert-triangle')}<h3>Conteúdo não encontrado</h3><p>O endereço informado não corresponde a uma página ou iniciativa disponível.</p><a class="button" href="#/dashboard">Voltar à página inicial</a></div></div>`; }

  function renderLogin() {
    document.body.classList.add('auth-mode');
    main.innerHTML = `<div class="login-screen">
      <div class="login-panel">
        <div class="login-panel__brand">
          <img class="login-panel__banner" src="assets/images/govbr-login.jpg" width="869" height="628" alt="gov.br — Uma conta gov.br garante a identificação de cada cidadão que acessa os serviços digitais do governo.">
        </div>
        <div class="login-card">
          <h2>Identifique-se no gov.br:</h2>
          <div class="login-method">
            <span class="login-method__icon">${icon('user')}</span>
            <span>Número do CPF</span>
          </div>
          <p class="login-support">Digite seu CPF para criar ou acessar sua conta gov.br</p>
          <form id="login-form" class="login-form">
            <label class="field field--login">
              <span>CPF</span>
              <input type="text" name="user" placeholder="Digite seu CPF" autocomplete="username" required>
            </label>
            <label class="field field--login">
              <span>Senha</span>
              <input type="password" name="password" placeholder="Digite sua senha" autocomplete="current-password" required>
            </label>
            <div class="login-actions">
              <button class="button button--govbr" type="submit">Continuar</button>
              <button class="button button--secondary" type="button" data-action="demo-login">Acesso de demonstração</button>
            </div>
          </form>

          <div class="login-divider"><span>Outras opções de identificação:</span></div>

          <div class="login-alt-list" aria-label="Outras opções de login">
            <button class="login-alt login-alt--bank" type="button">
              <span class="login-alt__icon">${icon('landmark')}</span>
              <span class="login-alt__text">Login com seu banco</span>
              <span class="login-alt__tag">Sua conta será prata</span>
            </button>
            <button class="login-alt login-alt--qr" type="button">
              <span class="login-alt__icon">${icon('grid')}</span>
              <span class="login-alt__text">Login com QR code</span>
            </button>
            <button class="login-alt login-alt--cert" type="button">
              <span class="login-alt__icon">${icon('shield')}</span>
              <span class="login-alt__text">Seu certificado digital</span>
            </button>
            <button class="login-alt login-alt--cert2" type="button">
              <span class="login-alt__icon">${icon('cloud')}</span>
              <span class="login-alt__text">Seu certificado digital em nuvem</span>
            </button>
          </div>

          <div class="login-footer">
            <button class="login-help" type="button">${icon('help-circle')} Está com dúvidas e precisa de ajuda?</button>
            <a href="#" class="login-privacy">Termo de Uso e Aviso de Privacidade</a>
          </div>
        </div>
      </div>
    </div>`;
    hydrateIcons(main);
  }

  function authenticateUser({ silent = false } = {}) {
    state.authenticated = true;
    sessionStorage.setItem('sisegp-authenticated', '1');
    document.body.classList.remove('auth-mode');
    if (!silent) {
      showToast('Login realizado','Acesso autorizado ao SISEGP.');
    }
    location.hash = '#/initiatives';
    route();
  }

  function route() {
    if(mvpEditor?.isDirty()&&location.hash!==mvpEditorHash){
      const destination=location.hash;
      history.replaceState(null,'',mvpEditorHash);
      showModal({title:'Descartar alterações não salvas?',body:'As alterações da iniciativa ainda não foram salvas.',confirm:'Descartar e sair',onConfirm:()=>{mvpEditor=null;location.hash=destination;}});
      return;
    }
    mvpEditor=null;
    closeProfileMenu();
    const hash=(location.hash||'#/initiatives').replace(/^#\/?/,''); const [path]=hash.split('?'); const parts=path.split('/').filter(Boolean); state.route=parts[0]||'initiatives'; state.params=parts.slice(1);
    const isLoginRoute = state.route === 'login';
    document.body.classList.toggle('auth-mode', !state.authenticated);
    if (!state.authenticated && !isLoginRoute) {
      location.hash = '#/login';
      return;
    }
    if (state.authenticated && isLoginRoute) {
      state.route = 'initiatives';
      location.hash = '#/initiatives';
      return;
    }
    if (state.route === 'login') {
      renderLogin();
      return;
    }
    if(state.route==='initiative'&&state.params[1]==='edit'&&state.detailTab==='overview')state.detailTab='main';
    if(state.route==='initiative'&&state.params[1]&&state.params[1]!=='edit')state.detailTab='overview';
    document.querySelectorAll('.nav-item[data-route]').forEach(link=>link.classList.toggle('active',link.dataset.route===state.route||(state.route==='initiative'&&link.dataset.route==='initiatives')));
    closeSidebar(); window.scrollTo(0,0);
    if(state.route==='dashboard')renderDashboard(); else if(state.route==='initiatives')renderInitiatives(); else if(state.route==='initiative'){ if(state.params[0]==='new'||state.params[1]==='edit')renderInitiativeForm(state.params[0]==='new'?null:state.params[0]); else renderInitiativeDetail(state.params[0]); }
    else if(state.route==='repository')renderRepository(); else if(['reports','critical','impediments','gp-report'].includes(state.route))renderReports(state.route); else if(state.route==='logs')renderLogs(); else if(state.route==='managers')renderManagers(); else if(state.route==='settings')renderSettings(); else if(state.route==='governance')renderGovernance(); else if(state.route==='action')renderActionPage(state.params[0]); else renderNotFound();
    removePresentationLabels(main); hydrateIcons(main); main.focus({preventScroll:true}); document.title=`${document.querySelector('h1')?.textContent||'SISEGP'} | TJRS`;
  }

  function showToast(title,message='',tone='success') { const node=document.createElement('div'); node.className=`toast ${tone}`; node.innerHTML=`${icon(tone==='success'?'check-circle':tone==='danger'?'alert-triangle':'info')}<div><strong>${escapeHtml(title)}</strong>${message?`<p>${escapeHtml(message)}</p>`:''}</div>`; document.getElementById('toast-region').append(node); hydrateIcons(node); setTimeout(()=>node.remove(),4200); }
  function showModal({title,eyebrow='SISEGP',body,confirm='Confirmar',cancel='Cancelar',tone='',onConfirm=null}) {
    const modal=document.getElementById('app-modal');
    modal.returnFocus=document.activeElement;
    document.getElementById('modal-title').textContent=title;
    document.getElementById('modal-eyebrow').textContent=eyebrow;
    document.getElementById('modal-body').innerHTML=body;
    document.getElementById('modal-footer').innerHTML=`<button class="button button--secondary" data-close="app-modal">${escapeHtml(cancel)}</button>${confirm?`<button class="button ${tone==='danger'?'button--danger':''}" id="modal-confirm">${escapeHtml(confirm)}</button>`:''}`;
    modal.hidden=false;hydrateIcons(modal);
    const confirmButton=document.getElementById('modal-confirm');
    if(confirmButton)confirmButton.onclick=()=>{if(onConfirm&&onConfirm()===false)return;closeOverlay('app-modal');};
    setTimeout(()=>modal.querySelector('button')?.focus(),0);
  }
  function closeOverlay(id) {
    const element=document.getElementById(id);if(!element)return;
    const restore=id==='app-modal'&&!element.hidden;
    element.hidden=true;
    if(restore){const target=element.returnFocus?.isConnected?element.returnFocus:main;target.focus({preventScroll:true});}
  }
  function persist() { const ok=D.save(state.initiatives); document.getElementById('nav-initiative-count').textContent=state.initiatives.filter(i=>!i.archived).length; return ok; }
  function closeSidebar(){ document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebar-scrim').classList.remove('open'); document.getElementById('menu-toggle').setAttribute('aria-expanded','false'); }
  function openAdvancedFilters() { showModal({title:'Filtros avançados',eyebrow:'Iniciativas',confirm:'Aplicar filtros',body:`<div class="form-grid">${formField('Área responsável','area',state.filters.area,'select','span-2',options(D.areas,state.filters.area))}${formField('Criticidade','criticality',state.filters.criticality,'select','span-2',options(D.criticalities,state.filters.criticality))}${formField('Iniciativa estratégica','strategic',state.filters.strategic,'select','span-2',options(['yes','no'],state.filters.strategic,'Todas'))}${formField('Com impedimento','impediment',state.filters.impediment,'select','span-2',options(['yes','no'],state.filters.impediment,'Todas'))}${formField('Situação de atraso','delay',state.filters.delay,'select','span-2',options(['yes','no'],state.filters.delay,'Todas'))}${formField('Atualização','recent',state.filters.recent,'select','span-2',options(['recent','stale'],state.filters.recent,'Todas'))}${formField('Progresso mínimo (%)','progress',state.filters.progress,'number','span-2')}</div>`,onConfirm:()=>{ const modal=document.getElementById('app-modal'); ['area','criticality','strategic','impediment','delay','recent','progress'].forEach(key=>{const el=modal.querySelector(`[name="${key}"]`);state.filters[key]=el?el.value:'';}); state.page=1;renderInitiatives(); }}); }
  function duplicateInitiative(id) { const original=state.initiatives.find(i=>i.id===id); if(!original)return; const number=Math.max(...state.initiatives.map(i=>Number(i.id.replace(/\D/g,''))))+1; const clone=JSON.parse(JSON.stringify(original)); clone.id=`INI-${String(number).padStart(3,'0')}`; clone.title=`Cópia de ${original.title}`; clone.status='Em planejamento';if(clone.mvp)clone.administrativeStatus='EM PLANEJAMENTO'; clone.progress=0; clone.updated=D.iso(new Date()); clone.evolutions=[{date:clone.updated,time:new Date().toTimeString().slice(0,5),type:'Criação',title:'Iniciativa duplicada',note:`Criada a partir de ${original.id}.`,author:'Usuário atual'}]; state.initiatives.unshift(clone); persist(); showToast('Iniciativa duplicada',`${clone.id} criada como rascunho.`); location.hash=`#/initiative/${clone.id}/edit`; }
  function archiveInitiative(id) { const item=state.initiatives.find(i=>i.id===id); if(!item)return; showModal({title:'Arquivar iniciativa?',eyebrow:item.id,tone:'danger',confirm:'Arquivar',body:`<div class="callout danger"><strong>${escapeHtml(item.title)}</strong><p>A iniciativa deixará de aparecer no portfólio ativo e permanecerá disponível no histórico.</p></div>`,onConfirm:()=>{item.archived=true;persist();showToast('Iniciativa arquivada',`${item.id} foi removida do portfólio ativo.`,'warning');route();}}); }
  function openDocumentBuilder(id,kind='Relatório executivo') { const item=state.initiatives.find(i=>i.id===id)||state.initiatives[0]; showModal({title:'Gerar documento',eyebrow:item.id,confirm:'Abrir pré-visualização',body:`<div class="form-grid"><div class="field span-4"><label for="doc-kind">Tipo de artefato</label><select id="doc-kind">${options(['TAP — Termo de Abertura','TEP — Termo de Encerramento','Matriz RACI','Status Report','Ata de reunião','Relatório executivo','Relatório para reunião do PMO','Registro de riscos','Plano de ação','Cronograma resumido','Lições aprendidas'],kind,'Selecione')}</select></div><div class="field span-4"><label for="doc-initiative">Iniciativa</label><select id="doc-initiative">${state.initiatives.slice(0,80).map(i=>`<option value="${i.id}" ${i.id===item.id?'selected':''}>${i.id} — ${escapeHtml(i.title)}</option>`).join('')}</select></div><div class="callout span-4"><strong>Preenchimento automático</strong><p>O documento reutilizará dados da iniciativa, equipe, cronograma, riscos, marcos e evolução.</p></div></div>`,onConfirm:()=>{state.detailTab='pdf'; location.hash=`#/initiative/${document.getElementById('doc-initiative').value}`; setTimeout(route,0);}}); }
  function legacyExportCsv() { const items=filteredInitiatives(); const rows=[['ID','Iniciativa','GP','Área','Situação','Ciclo','Progresso','Risco','Criticidade','Impedimento','Prazo','Atualização'],...items.map(i=>[i.id,i.title,i.manager,i.area,i.status,i.cycle,i.progress,i.risk,i.criticality,i.impediment?'Sim':'Não',i.end,i.updated])]; const csv='\ufeff'+rows.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(';')).join('\r\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download='sisegp-iniciativas-demonstracao.csv'; link.click(); URL.revokeObjectURL(link.href); showToast('Exportação concluída',`${items.length} iniciativas exportadas em CSV.`); }

  function addAuditLog({type='Alteração',title,details='',user='Sistema',initiative='',level='info',source='system'}) {
    const now=new Date(); const id=`LOG-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    state.auditLogs.unshift({id,date:D.iso(now),time:now.toTimeString().slice(0,8),type,title,details,user,initiative,level,source});
    state.auditLogs=state.auditLogs.slice(0,2500);
    try{localStorage.setItem(AUDIT_KEY,JSON.stringify(state.auditLogs));}catch(error){console.warn('Não foi possível persistir os logs.',error);}
    return id;
  }
  function auditTypeFor(title){if(/status report/i.test(title))return 'Status report';if(/reunião/i.test(title))return 'Reunião';if(/cronograma/i.test(title))return 'Cronograma';if(/arquivo/i.test(title))return 'Documento';if(/entrega/i.test(title))return 'Entrega';return 'Alteração';}
  function recordAutomatic(item,title,note,date=D.iso(new Date())) {
    item.evolutions=item.evolutions||[];
    const time=new Date().toTimeString().slice(0,5);const auditId=addAuditLog({type:auditTypeFor(title),title,details:note,user:item.manager,initiative:item.id,level:'info',source:'system'});
    item.evolutions.unshift({date,time,type:'Sistema',title,note,author:item.manager,automatic:true,source:'system',auditId});
  }
  function rerenderInitiativeTab(item) {
    if(state.params[1]==='edit')renderInitiativeForm(item.id); else renderInitiativeDetail(item.id);
  }

  function saveMeeting(form) {
    const item=state.initiatives.find(i=>i.id===form.dataset.id); if(!item)return;
    const data=new FormData(form); const index=form.dataset.index===''?null:Number(form.dataset.index);
    if(!data.get('title')?.trim()||!data.get('date')||!data.get('participants')?.trim()||!data.get('agenda')?.trim()||!data.get('objectives')?.trim()){showToast('Revise os campos obrigatórios','Título, data, participantes, pauta e objetivos devem ser informados.','danger');return;}
    const previous=index===null?{}:item.meetings[index];
    const uploaded=[...form.querySelector('[name="documents"]').files].map(file=>({name:file.name,type:file.type||'Documento',size:file.size}));
    const meeting={...previous,title:data.get('title').trim(),type:data.get('type')||'Acompanhamento',date:data.get('date'),time:data.get('time')||'',participants:data.get('participants').split(/[,\n]/).map(v=>v.trim()).filter(Boolean),agenda:data.get('agenda').trim(),objectives:data.get('objectives').trim(),documents:[...(previous.documents||[]),...uploaded]};
    item.meetings=item.meetings||[]; if(index===null)item.meetings.unshift(meeting);else item.meetings[index]=meeting;
    recordAutomatic(item,index===null?'Reunião inserida':'Reunião atualizada',`${meeting.title} • ${formatDate(meeting.date)}`);
    item.updated=D.iso(new Date());persist();state.editors.meeting=null; rerenderInitiativeTab(item); showToast(index===null?'Reunião registrada':'Reunião atualizada','O histórico da iniciativa foi atualizado.');
  }

  function saveStatusReport(form) {
    const item=state.initiatives.find(i=>i.id===form.dataset.id); if(!item)return;
    const data=new FormData(form); const index=form.dataset.index===''?null:Number(form.dataset.index);
    if(!data.get('date')||!data.get('achievements')?.trim()||!data.get('nextSteps')?.trim()){showToast('Revise os campos obrigatórios','Data, últimas realizações e próximas etapas devem ser informadas.','danger');return;}
    item.statusReports=item.statusReports||[]; const previous=index===null?{}:item.statusReports[index];
    const report={...previous,version:previous.version||`${item.statusReports.length+1}.0`,date:data.get('date'),achievements:data.get('achievements').trim(),impediments:data.get('impediments').trim(),nextSteps:data.get('nextSteps').trim()};
    if(index===null)item.statusReports.unshift(report);else item.statusReports[index]=report;
    recordAutomatic(item,index===null?'Status report inserido':'Status report atualizado',`Referência: ${formatDate(report.date)}.`);
    item.updated=D.iso(new Date());persist();state.editors.statusReport=null; rerenderInitiativeTab(item); showToast(index===null?'Status report criado':'Status report atualizado','O registro foi salvo e incluído na evolução.');
  }

  function saveActivity(form) {
    const item=state.initiatives.find(i=>i.id===form.dataset.id); if(!item)return;
    const data=new FormData(form); const index=form.dataset.index===''?null:Number(form.dataset.index);
    if(!data.get('name')?.trim()||!data.get('owner')?.trim()||!data.get('start')||!data.get('end')){showToast('Revise os campos obrigatórios','Atividade, responsável, início e término devem ser informados.','danger');return;}
    if(new Date(`${data.get('end')}T12:00:00`)<new Date(`${data.get('start')}T12:00:00`)){showToast('Período inválido','A data de término deve ser igual ou posterior à data de início.','danger');return;}
    const activity={name:data.get('name').trim(),owner:data.get('owner').trim(),start:data.get('start'),end:data.get('end'),progress:Math.max(0,Math.min(100,Number(data.get('progress'))||0)),status:data.get('status')||'Planejada'};
    item.activities=item.activities||[]; if(index===null)item.activities.push(activity);else item.activities[index]=activity;
    recordAutomatic(item,index===null?'Item do cronograma inserido':'Item do cronograma atualizado',activity.name);
    item.updated=D.iso(new Date());persist();state.editors.activity=null; rerenderInitiativeTab(item); showToast(index===null?'Item adicionado':'Item atualizado','O cronograma e o histórico foram atualizados.');
  }

  function addEvolution(form) { const item=state.initiatives.find(i=>i.id===form.dataset.id); const data=new FormData(form); if(!data.get('date')||!data.get('title')?.trim()){showToast('Revise os campos obrigatórios','Data e título da evolução devem ser informados.','danger');return;} item.evolutions=item.evolutions||[];const title=data.get('title').trim(),note=data.get('note').trim();const auditId=addAuditLog({type:data.get('type')==='Entrega concluída'?'Entrega':'Evolução',title,details:note,user:item.manager,initiative:item.id,level:'info',source:'manual'});item.evolutions.unshift({date:data.get('date'),time:data.get('time')||'',type:data.get('type'),title,note,author:item.manager,automatic:false,source:'manual',auditId});item.updated=D.iso(new Date());persist();showToast('Evolução registrada','A linha do tempo e a data de atualização foram renovadas.');if(state.params[1]==='edit')renderInitiativeForm(item.id);else renderInitiativeDetail(item.id); }
  function handleUpload(input) { const item=state.initiatives.find(i=>i.id===input.dataset.uploadInput); if(!item||!input.files.length)return; [...input.files].forEach(file=>item.files.unshift({name:file.name,category:'Arquivo enviado',owner:item.manager,date:D.iso(new Date()),version:'1.0',tags:['Novo']}));recordAutomatic(item,'Arquivo inserido',`${input.files.length} arquivo(s) adicionado(s) ao repositório da iniciativa.`);persist();showToast('Upload concluído',`${input.files.length} arquivo(s) adicionado(s) ao repositório.`);if(state.params[1]==='edit')renderInitiativeForm(item.id);else renderInitiativeDetail(item.id); }

  document.addEventListener('click',event=>{
    const target=event.target.closest('button,a,[data-close]'); if(!target)return;
    if(target.dataset.close){closeOverlay(target.dataset.close);return;}
    if(target.matches('[data-view]')){state.initiativeView=target.dataset.view;localStorage.setItem('sisegp-view',state.initiativeView);renderInitiatives();return;}
    if(target.matches('[data-page]')){state.page=Number(target.dataset.page);renderInitiatives();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(target.matches('[data-log-page]')){state.logPage=Number(target.dataset.logPage);renderLogs();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(target.matches('[data-remove-filter]')){state.filters[target.dataset.removeFilter]='';state.page=1;renderInitiatives();return;}
    if(target.matches('[data-metric-filter]')){const key=target.dataset.metricFilter;if(key!=='all')state.filters[key]=target.dataset.filterValue;state.page=1;location.hash='#/initiatives';return;}
    if(target.matches('.chart-filter')){state.filters[target.dataset.filterKey]=target.dataset.filterValue;state.page=1;location.hash='#/initiatives';return;}
    if(target.matches('[data-folder]')){state.repositoryFolder=target.dataset.folder;renderRepository();return;}
    if(target.matches('[data-detail-tab]')){state.detailTab=target.dataset.detailTab;state.editors={meeting:null,statusReport:null,activity:null};renderInitiativeDetail(state.params[0]);return;}
    if(target.matches('[data-action="toggle-card-menu"]')){document.querySelectorAll('.dropdown').forEach(menu=>{if(menu!==target.nextElementSibling)menu.hidden=true;});target.nextElementSibling.hidden=!target.nextElementSibling.hidden;target.setAttribute('aria-expanded',String(!target.nextElementSibling.hidden));return;}
    const action=target.dataset.action;
    if(action==='demo-login'){authenticateUser({ silent: true }); return;}
    if(action==='clear-filters'){Object.keys(state.filters).forEach(k=>state.filters[k]='');state.page=1;state.route==='dashboard'?renderDashboard():renderInitiatives();}
    else if(action==='advanced-filters')openAdvancedFilters();
    else if(action==='duplicate')duplicateInitiative(target.dataset.id);
    else if(action==='archive')archiveInitiative(target.dataset.id);
    else if(action==='document')openDocumentBuilder(target.dataset.id,target.dataset.kind);
    else if(action==='print')window.print();
    else if(action==='export-csv')exportCsv();
    else if(action==='save-view')showToast('Visão salva','Os filtros e o modo de visualização foram salvos neste navegador.');
    else if(action==='presentation'){document.documentElement.requestFullscreen?.();showToast('Modo apresentação ativado','Pressione Esc para sair da tela cheia.');}
    else if(action==='edit-meeting'){state.editors.meeting=Number(target.dataset.index);rerenderInitiativeTab(state.initiatives.find(i=>i.id===target.dataset.id));}
    else if(action==='cancel-meeting-edit'){state.editors.meeting=null;rerenderInitiativeTab(state.initiatives.find(i=>i.id===state.params[0]));}
    else if(action==='edit-status-report'&&state.initiatives.find(i=>i.id===target.dataset.id)?.mvp){location.hash=`#/initiative/${target.dataset.id}/edit`;}
    else if(action==='edit-status-report'){state.editors.statusReport=Number(target.dataset.index);rerenderInitiativeTab(state.initiatives.find(i=>i.id===target.dataset.id));}
    else if(action==='cancel-status-edit'){state.editors.statusReport=null;rerenderInitiativeTab(state.initiatives.find(i=>i.id===state.params[0]));}
    else if(action==='edit-activity'){state.editors.activity=Number(target.dataset.index);rerenderInitiativeTab(state.initiatives.find(i=>i.id===target.dataset.id));}
    else if(action==='cancel-activity-edit'){state.editors.activity=null;rerenderInitiativeTab(state.initiatives.find(i=>i.id===state.params[0]));}
    else if(action==='quick-meeting'){state.detailTab='meetings';state.editors.meeting=null;renderInitiativeDetail(target.dataset.id);}
    else if(action==='reset-data')showModal({title:'Restaurar dados originais?',eyebrow:'Configurações',tone:'danger',confirm:'Restaurar 200 iniciativas',body:'<div class="callout danger"><strong>As alterações locais serão substituídas.</strong><p>Cadastros, edições, uploads e evoluções feitas neste navegador serão descartados.</p></div>',onConfirm:()=>{state.initiatives=D.reset();persist();showToast('Dados restaurados','O conjunto original com 200 iniciativas foi recriado.');route();}});
    else if(action==='pdf-generate'){showToast('PDF preparado','Use a janela de impressão para escolher “Salvar como PDF”.');setTimeout(()=>window.print(),300);}
    else if(['quick-evolution','quick-progress','quick-risk','quick-impediment','quick-milestone','meeting','add-milestone'].includes(action)){const item=state.initiatives.find(i=>i.id===target.dataset.id);const labels={ 'quick-evolution':'Registrar evolução','quick-progress':'Atualizar percentual','quick-risk':'Registrar risco','quick-impediment':'Registrar impedimento','quick-milestone':'Adicionar marco',meeting:'Cadastrar reunião','add-milestone':'Adicionar marco'}; showModal({title:labels[action],eyebrow:item?.id||'Iniciativa',confirm:'Salvar registro',body:`<div class="form-grid">${formField('Título / descrição','demoTitle','','text','span-4')}${formField('Data','demoDate',D.iso(new Date()),'date','span-2')}${formField('Responsável','demoOwner',item?.manager||'','text','span-2')}${formField('Observações','demoNotes','','textarea','span-4')}</div>`,onConfirm:()=>{if(item){item.updated=D.iso(new Date());item.evolutions.unshift({date:item.updated,time:new Date().toTimeString().slice(0,5),type:labels[action],title:document.querySelector('[name="demoTitle"]')?.value||labels[action],note:'Registro incluído por ação rápida.',author:item.manager});persist();}showToast('Registro salvo','A iniciativa e seus indicadores foram atualizados.');if(state.route==='initiative')renderInitiativeDetail(item.id);}});}
    else if(action==='generate-status'){const item=state.initiatives.find(i=>i.id===target.dataset.id);state.detailTab='reports';state.editors.statusReport=null;renderInitiativeDetail(item.id);}
    else if(action==='new-folder'){const parent = target.dataset.parent || (state.repositoryFolder==='Todos' ? 'Raiz' : state.repositoryFolder); openRepositoryFolderModal(parent); return;}
    else if(['preview-file','preview-artifact','repo-file','download-artifact','duplicate-artifact','new-artifact','repo-upload','edit-manager','toggle-manager','new-manager','edit-setting','meeting-ai','use-artifact'].includes(action))openActionScreen(action,target);
    else if(action==='action-cancel')location.hash=state.actionContext?.returnTo||'#/dashboard';
    else if(action==='action-download'){const content=`SISEGP | ${state.actionContext?.title||'Documento'}\nArquivo preparado em ${new Date().toLocaleString('pt-BR')}.`;const blob=new Blob([content],{type:'text/plain;charset=utf-8'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='sisegp-documento.txt';link.click();URL.revokeObjectURL(link.href);showToast('Download iniciado','O arquivo foi preparado para download.');}
    else if(action==='action-complete')showToast('Ação concluída','As informações foram atualizadas.');
    else if(action==='delete-file'){const item=state.initiatives.find(i=>i.id===target.dataset.id);showModal({title:'Excluir arquivo?',tone:'danger',confirm:'Excluir',body:'<div class="callout danger"><strong>Confirme a exclusão do arquivo.</strong><p>O registro será removido do repositório da iniciativa.</p></div>',onConfirm:()=>{item.files.splice(Number(target.dataset.index),1);persist();showToast('Arquivo excluído');renderInitiativeDetail(item.id);}});}
    else if(action==='save-draft')showToast('Rascunho salvo','As informações permanecem neste navegador.');
  });

  document.addEventListener('change',event=>{
    const target=event.target;
    if(target.matches('[data-filter]')){state.filters[target.dataset.filter]=target.value;state.page=1;renderInitiatives();}
    if(target.matches('[data-dashboard-filter]')){state.filters[target.dataset.dashboardFilter]=target.value;state.page=1;location.hash='#/initiatives';}
    if(target.id==='sort-initiatives'){state.sort=target.value;renderInitiatives();}
    if(target.id==='gp-report-select'){state.gpReport=target.value;renderGpReport(state.initiatives.filter(i=>!i.archived));}
    if(target.matches('[data-upload-input]'))handleUpload(target);
    if(target.matches('.pdf-block-toggle')){const block=document.querySelector(`[data-pdf-block="${target.dataset.block}"]`);if(block)block.hidden=!target.checked;}
    if(target.matches('[data-log-filter]')){state.logFilters[target.dataset.logFilter]=target.value;state.logPage=1;renderLogs();}
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='initiative-search'){state.filters.search=event.target.value;state.page=1;clearTimeout(event.target._timer);event.target._timer=setTimeout(renderInitiatives,180);}
    if(event.target.id==='global-search-input')renderGlobalSearch(event.target.value);
    if(event.target.id==='log-search'){state.logFilters.search=event.target.value;state.logPage=1;clearTimeout(event.target._timer);event.target._timer=setTimeout(renderLogs,180);}
  });
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(form.matches('#login-form')){
      event.preventDefault();
      const data = new FormData(form);
      const user = String(data.get('user') || '').trim();
      const password = String(data.get('password') || '').trim();
      if (!user || !password) {
        showToast('Dados obrigatórios','Informe CPF/e-mail e senha para continuar.','danger');
        return;
      }
      authenticateUser();
      return;
    }
    if(form.matches('#evolution-form')){event.preventDefault();addEvolution(form);}
    if(form.matches('#meeting-form')){event.preventDefault();saveMeeting(form);}
    if(form.matches('#status-report-form')){event.preventDefault();saveStatusReport(form);}
    if(form.matches('#activity-form')){event.preventDefault();saveActivity(form);}
    if(form.matches('#action-form')){
      event.preventDefault();
      const formKind = form.dataset.formKind;
      if(formKind === 'new-folder'){
        const name = String(new FormData(form).get('actionName') || '').trim();
        const isSubfolder = form.querySelector('[name="folderIsSubfolder"]')?.checked;
        const parent = String(form.querySelector('[name="actionParent"]')?.value || '').trim();
        if (!name) {
          showToast('Informe o nome da pasta','O nome da pasta é obrigatório.','danger');
          return;
        }
        if (isSubfolder && parent && parent !== 'Raiz') createRepositoryFolder({ name, parent, isSubfolder: true });
        else createRepositoryFolder({ name, parent: '', isSubfolder: false });
        return;
      }
      showToast('Alterações salvas','A operação foi concluída.');setTimeout(()=>{location.hash=state.actionContext?.returnTo||'#/dashboard';},250);
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeOverlay('app-modal');closeOverlay('global-search');closeOverlay('notifications-drawer');document.querySelectorAll('.dropdown').forEach(m=>m.hidden=true);}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openGlobalSearch();}});

  function openGlobalSearch(){const overlay=document.getElementById('global-search');overlay.hidden=false;const input=document.getElementById('global-search-input');input.value='';renderGlobalSearch('');setTimeout(()=>input.focus(),0);}
  function renderGlobalSearch(query){const q=query.trim().toLowerCase();const initiatives=state.initiatives.map(window.MvpViews.project).filter(i=>!i.archived&&(!q||[i.id,i.title,i.manager,i.department].join(' ').toLowerCase().includes(q))).slice(0,7);document.getElementById('global-search-results').innerHTML=`${initiatives.map(i=>`<a class="command-result" href="#/initiative/${i.id}" data-close="global-search">${icon('briefcase')}<span><strong>${i.id} — ${escapeHtml(i.title)}</strong><small>${escapeHtml(shortName(i.manager))} • ${escapeHtml(i.department)}</small></span></a>`).join('')}${!initiatives.length?'<div class="empty-state"><h3>Nenhum resultado</h3><p>Tente pesquisar por ID, nome, GP ou área.</p></div>':''}`;hydrateIcons(document.getElementById('global-search-results'));}
  function legacyRenderNotifications(){const items=[['alert-triangle','danger','3 iniciativas críticas sem atualização','Revisar informações antes da reunião de governança.'],['clock','warning','7 marcos vencem nos próximos 10 dias','Confirme responsáveis e evidências.'],['ban','danger','Novo impedimento registrado','Dependência externa requer escalonamento.'],['calendar','info','Reunião do PMO amanhã às 14h','Pauta e documentos estão disponíveis.'],['check-circle','success','Status report finalizado','Versão pronta para compartilhamento.']];document.getElementById('notification-list').innerHTML=renderList(items.map(([ic,tone,title,copy])=>({icon:ic,tone,title,copy,meta:'Hoje',href:'#'})));hydrateIcons(document.getElementById('notification-list'));}
  document.getElementById('menu-toggle').addEventListener('click',()=>{const sidebar=document.getElementById('sidebar');const open=sidebar.classList.toggle('open');document.getElementById('sidebar-scrim').classList.toggle('open',open);document.getElementById('menu-toggle').setAttribute('aria-expanded',String(open));});
  document.getElementById('sidebar-scrim').addEventListener('click',closeSidebar);
  document.getElementById('global-search-toggle').addEventListener('click',openGlobalSearch);
  document.getElementById('notifications-toggle').addEventListener('click',()=>{renderNotifications();document.getElementById('notifications-drawer').hidden=false;});
  function closeProfileMenu({ restoreFocus = false } = {}) {
    const menu = document.getElementById('profile-menu');
    const wasOpen = !menu.hidden;
    menu.hidden = true;
    document.getElementById('profile-toggle').setAttribute('aria-expanded', 'false');
    if (restoreFocus && wasOpen) document.getElementById('profile-toggle').focus();
  }
  document.getElementById('profile-toggle').addEventListener('click',()=>{
    const menu = document.getElementById('profile-menu');
    menu.hidden = !menu.hidden;
    document.getElementById('profile-toggle').setAttribute('aria-expanded', String(!menu.hidden));
    if (!menu.hidden) menu.querySelector('a').focus();
  });
  document.addEventListener('click',event=>{if(!event.target.closest('.profile-container'))closeProfileMenu();});
  document.addEventListener('focusin',event=>{if(!event.target.closest('.profile-container'))closeProfileMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeProfileMenu({restoreFocus:true});});
  document.getElementById('logout-button').addEventListener('click',()=>{
    sessionStorage.removeItem('sisegp-authenticated');
    sessionStorage.removeItem('sisegp-access-logged');
    state.authenticated = false;
    closeProfileMenu();
    closeSidebar();
    ['app-modal','global-search','notifications-drawer'].forEach(closeOverlay);
    document.getElementById('toast-region').replaceChildren();
    location.hash = '#/login';
    route();
    main.querySelector('input')?.focus();
  });
  document.getElementById('mark-read').addEventListener('click',()=>{document.querySelector('.notification-button b').hidden=true;showToast('Notificações atualizadas','Todas foram marcadas como lidas.');closeOverlay('notifications-drawer');});
  document.getElementById('help-button')?.addEventListener('click',event=>openActionScreen('help',event.currentTarget));
  document.querySelectorAll('.nav-group-toggle').forEach(button=>button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));document.querySelector(`[data-submenu="${button.dataset.group}"]`).hidden=expanded;}));
  window.addEventListener('hashchange',()=>{if(!location.hash)location.hash = state.authenticated ? '#/initiatives' : '#/login'; else route();});

  hydrateIcons(); const initialSaveOk=persist(); route(); if(!initialSaveOk)showToast('Não foi possível gravar os dados','O preenchimento demonstrativo está disponível nesta sessão, mas não foi salvo no navegador.','danger');
})();
