(function () {
  'use strict';

  const managers = [
    { name: 'Adriana Ferreira de Brito', short: 'Adriana Brito', role: 'GP', email: 'adriana.brito@tjrs.jus.br', active: true, areas: ['Judiciária', 'Administrativa'] },
    { name: 'Alexandre Faccioni Barcellos', short: 'Alexandre Barcellos', role: 'GP', email: 'alexandre.barcellos@tjrs.jus.br', active: true, areas: ['Infraestrutura', 'Segurança'] },
    { name: 'Antônio Carlos da Luz Cepa', short: 'Antônio Cepa', role: 'GP e chefe', email: 'antonio.cepa@tjrs.jus.br', active: true, areas: ['Governança', 'DITIC'] },
    { name: 'Carine Vitoria Amaral de Lima', short: 'Carine Lima', role: 'GP', email: 'carine.lima@tjrs.jus.br', active: true, areas: ['Judiciária', 'Inovação'] },
    { name: 'Eduardo de Borba Severo', short: 'Eduardo Severo', role: 'GP', email: 'eduardo.severo@tjrs.jus.br', active: true, areas: ['DITIC', 'Dados'] },
    { name: 'Fernanda Silveira Loureiro Martins', short: 'Fernanda Martins', role: 'GP', email: 'fernanda.martins@tjrs.jus.br', active: true, areas: ['Pessoas', 'Administrativa'] },
    { name: 'Katia Cilene Rauber Peil', short: 'Katia Peil', role: 'GP', email: 'katia.peil@tjrs.jus.br', active: true, areas: ['Governança', 'Contratações'] },
    { name: 'Marcelo Malaquias Xavier', short: 'Marcelo Xavier', role: 'GP', email: 'marcelo.xavier@tjrs.jus.br', active: true, areas: ['Infraestrutura', 'Judiciária'] },
    { name: 'Milton Luis Granja Rodrigues', short: 'Milton Rodrigues', role: 'Chefe', email: 'milton.rodrigues@tjrs.jus.br', active: true, areas: ['Governança', 'Estratégia'] }
  ];

  const areas = ['DITIC', 'Direção-Geral', 'Corregedoria-Geral da Justiça', 'Departamento de Compras', 'Gestão de Pessoas', 'Governança Judiciária', 'Infraestrutura', 'Inovação e Projetos', 'Segurança Institucional', 'Serviços Judiciários'];
  const cycles = ['2024', '2025', '2026', '2026–2027', 'Contínuo'];
  const statuses = ['Aberta', 'Em planejamento', 'Em execução', 'Em execução', 'Em execução', 'Suspensa', 'Atrasada', 'Cancelada', 'Concluída', 'Concluída'];
  const riskLevels = ['Baixo', 'Baixo', 'Médio', 'Médio', 'Alto', 'Crítico'];
  const criticalities = ['Baixa', 'Média', 'Média', 'Alta', 'Crítica'];
  const classifications = ['Sustentação', 'Evolução', 'Inovação', 'Obrigação legal', 'Segurança', 'Transformação digital'];
  const axes = ['Sociedade', 'Processos internos', 'Pessoas e aprendizado', 'Tecnologia e dados', 'Governança'];
  const riskCategories = ['Tecnologia', 'Prazo', 'Pessoas', 'Contratação', 'Escopo', 'Governança'];
  const nameA = ['Modernização', 'Implantação', 'Evolução', 'Digitalização', 'Integração', 'Reestruturação', 'Automação', 'Aprimoramento', 'Expansão', 'Consolidação'];
  const nameB = ['do atendimento jurisdicional', 'da gestão documental', 'do processo eletrônico', 'da segurança da informação', 'da infraestrutura de dados', 'dos serviços ao cidadão', 'da governança de TIC', 'da gestão de pessoas', 'do portal institucional', 'da inteligência analítica', 'das audiências digitais', 'do acervo judicial', 'do fluxo de contratações', 'da comunicação institucional', 'da gestão de precedentes', 'do trabalho remoto', 'da acessibilidade digital', 'da plataforma de integrações', 'do acompanhamento estratégico', 'da experiência do usuário'];

  function pad(value) { return String(value).padStart(2, '0'); }
  function iso(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
  function addDays(date, days) { const copy = new Date(date); copy.setDate(copy.getDate() + days); return copy; }
  function seeded(index, salt, max) {
    let value = Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b);
    value ^= value >>> 16;
    value = Math.imul(value, 0x7feb352d);
    value ^= value >>> 15;
    return (value >>> 0) % max;
  }
  function initials(name) { return name.split(' ').filter((_, i, arr) => i === 0 || i === arr.length - 1).map(v => v[0]).join('').toUpperCase(); }

  function generateInitiative(index) {
    const id = `INI-${String(index + 1).padStart(3, '0')}`;
    const status = statuses[seeded(index, 2, statuses.length)];
    const manager = managers[seeded(index, 3, managers.length - 1)].name;
    const area = areas[seeded(index, 5, areas.length)];
    const cycle = cycles[seeded(index, 7, cycles.length)];
    const risk = riskLevels[seeded(index, 11, riskLevels.length)];
    const criticality = criticalities[seeded(index, 13, criticalities.length)];
    const strategic = seeded(index, 17, 10) < 6;
    const impediment = !['Concluída', 'Cancelada'].includes(status) && seeded(index, 19, 7) === 0;
    const start = addDays(new Date(2024, 0, 8), seeded(index, 23, 820));
    const duration = 110 + seeded(index, 29, 520);
    const end = addDays(start, duration);
    let progress = seeded(index, 31, 101);
    if (status === 'Concluída') progress = 100;
    if (status === 'Cancelada') progress = Math.min(progress, 65);
    if (status === 'Aberta') progress = Math.min(progress, 10);
    if (status === 'Em planejamento') progress = Math.min(progress, 25);
    const updated = addDays(new Date(2026, 7, 28), -seeded(index, 37, 75));
    const title = `${nameA[index % nameA.length]} ${nameB[seeded(index, 41, nameB.length)]}`;
    const riskScore = riskLevels.indexOf(risk) + 1;
    const probability = 1 + seeded(index, 43, 5);
    const impact = 1 + seeded(index, 47, 5);

    const milestones = [0, 1, 2, 3].map((step) => {
      const planned = addDays(start, Math.round(duration * ((step + 1) / 5)));
      const done = progress >= (step + 1) * 20;
      return {
        name: ['Plano aprovado', 'Entrega intermediária', 'Homologação', 'Entrada em produção'][step],
        description: ['Validação do planejamento e escopo', 'Conclusão do primeiro pacote de entregas', 'Aceite das áreas de negócio', 'Disponibilização da solução aos usuários'][step],
        owner: managers[seeded(index + step, 53, managers.length - 1)].short,
        planned: iso(planned), actual: done ? iso(addDays(planned, seeded(index, step, 15) - 6)) : '',
        status: done ? 'Concluído' : (planned < new Date() ? 'Atrasado' : 'Planejado'),
        evidence: done ? `Evidência_${id}_${step + 1}.pdf` : ''
      };
    });

    const activities = ['Planejamento e mobilização', 'Levantamento de requisitos', 'Desenvolvimento e execução', 'Homologação com usuários', 'Implantação e encerramento'].map((name, step) => ({
      name, owner: managers[seeded(index + step, 59, managers.length - 1)].short,
      start: iso(addDays(start, Math.round(duration * step / 6))), end: iso(addDays(start, Math.round(duration * (step + 1.3) / 6))),
      progress: Math.max(0, Math.min(100, progress - step * 18 + 18)), status: progress > (step + 1) * 18 ? 'Concluída' : (progress > step * 18 ? 'Em andamento' : 'Planejada')
    }));

    const hasRisk = !['Concluída', 'Cancelada'].includes(status) && seeded(index, 61, 4) !== 0;
    const risks = hasRisk ? [{
      category: riskCategories[seeded(index, 67, riskCategories.length)], level: risk, probability, impact,
      description: ['Indisponibilidade de equipe especializada para as entregas prioritárias.', 'Dependência de contratação externa com prazo crítico.', 'Integração com sistema legado pode exigir adequações adicionais.', 'Mudança de escopo por nova demanda normativa.'][seeded(index, 71, 4)],
      cause: 'Dependências externas e capacidade limitada da equipe.', consequence: 'Possível impacto no prazo e na qualidade da entrega.', response: 'Acompanhamento semanal, reserva de capacidade e escalonamento preventivo.', owner: manager, due: iso(addDays(new Date(), 25 + seeded(index, 73, 80))), residual: riskScore > 3 ? 'Médio' : 'Baixo'
    }] : [];

    const evolutions = [
      { date: iso(updated), time: '14:30', type: 'Sistema', title: `Progresso atualizado para ${progress}%`, note: 'Alteração registrada automaticamente após atualização realizada pelo GP.', author: manager, automatic: true, source: 'system' },
      { date: iso(addDays(updated, -6)), time: '11:20', type: 'Sistema', title: 'Status report inserido', note: 'Novo status report incluído pelo GP.', author: manager, automatic: true, source: 'system' },
      { date: iso(addDays(updated, -12)), time: '10:15', type: 'Sistema', title: 'Item do cronograma atualizado', note: milestones.find(m => m.status === 'Concluído')?.name || 'Planejamento revisado', author: manager, automatic: true, source: 'system' },
      { date: iso(addDays(updated, -28)), time: '16:00', type: 'Decisão', title: 'Priorização validada com a área demandante', note: 'Encaminhamentos registrados para acompanhamento.', author: manager, automatic: false, source: 'manual' },
      { date: iso(start), time: '09:00', type: 'Sistema', title: 'Iniciativa criada', note: 'Cadastro inicial realizado pelo gerente de projetos.', author: manager, automatic: true, source: 'system' }
    ];

    const meetings = [
      { title: 'Acompanhamento executivo', type: 'Acompanhamento', date: iso(addDays(new Date(), 4 + seeded(index, 79, 35))), time: '14:00', participants: [manager, 'Área demandante', 'Equipe técnica'], agenda: 'Evolução, riscos, impedimentos e próximos marcos.', objectives: 'Validar o andamento e definir encaminhamentos para o próximo ciclo.', documents: [], minutes: '', decisions: 'Priorizar as entregas do próximo ciclo.', actions: 'Atualizar cronograma e evidências.', next: iso(addDays(new Date(), 40)) },
      { title: 'Revisão do planejamento', type: 'Planejamento', date: iso(addDays(updated, -20)), time: '10:00', participants: [manager, 'Patrocinador'], agenda: 'Revisão do escopo e prazo.', objectives: 'Confirmar escopo, prazo e responsabilidades.', documents: [{ name: `Ata_planejamento_${id}.pdf`, type: 'application/pdf', size: 182400 }], minutes: 'Escopo validado e cronograma revisado.', decisions: 'Manter data de referência.', actions: 'Comunicar partes interessadas.', next: iso(addDays(new Date(), 7)) }
    ];

    return {
      id, title, description: `Iniciativa prioritária para ${nameB[seeded(index, 83, nameB.length)]}, com foco em eficiência, integração e melhoria da experiência institucional.`,
      objective: 'Elevar a eficiência operacional, padronizar processos e ampliar a qualidade dos serviços prestados pelo TJRS.',
      justification: 'Demanda priorizada a partir do planejamento institucional e de oportunidades de melhoria identificadas pelas áreas envolvidas.',
      problem: 'Processos fragmentados, controles paralelos e baixa visibilidade gerencial.',
      scope: 'Mapeamento do processo, desenho da solução, implantação assistida, capacitação e acompanhamento dos resultados.',
      outOfScope: 'Substituição integral de sistemas estruturantes não relacionados diretamente ao fluxo priorizado.',
      expectedResults: 'Redução de retrabalho, maior transparência e dados consistentes para tomada de decisão.',
      deliveries: 'Processo redesenhado; solução configurada; usuários capacitados; indicadores implantados.',
      benefits: 'Agilidade, rastreabilidade, padronização e melhor experiência para usuários internos e externos.',
      motivation: 'Aderência ao planejamento estratégico e oportunidade de transformação digital.',
      status, progress, start: iso(start), originalEnd: iso(addDays(end, -15)), end: iso(end), cycle,
      sei: `8.2026.${String(100000 + index).slice(-6)}-${seeded(index, 89, 9)}`, strategic, priority: criticality === 'Crítica' ? 'Muito alta' : criticality === 'Alta' ? 'Alta' : 'Média',
      requesterArea: areas[seeded(index, 91, areas.length)], area, unit: `${area} — Unidade ${1 + seeded(index, 97, 5)}`,
      stakeholders: 'Área demandante, DITIC, unidades-piloto e governança.', dependencies: 'Disponibilidade da equipe técnica e validação das áreas envolvidas.', notes: 'Acompanhamento realizado conforme a metodologia do EGP.',
      manager, technicalLead: `Responsável técnico ${String.fromCharCode(65 + index % 18)}`, sponsor: 'Patrocinador institucional', requester: 'Gestor da área demandante', chief: 'Antônio Carlos da Luz Cepa',
      team: ['Analista de negócio', 'Especialista técnico', 'Representante da área usuária'], contacts: 'equipe.projeto@tjrs.jus.br', availability: 'Parcial — 20h semanais',
      classification: classifications[seeded(index, 101, classifications.length)], strategicObjective: `Objetivo ${1 + seeded(index, 103, 8)} — ${axes[seeded(index, 107, axes.length)]}`, axis: axes[seeded(index, 109, axes.length)], pdtic: strategic || seeded(index, 113, 3) > 0,
      prioritizationCycle: `Priorização ${cycle}`, importance: 1 + seeded(index, 127, 5), strategicImpact: 1 + seeded(index, 131, 5), urgency: 1 + seeded(index, 137, 5), complexity: 1 + seeded(index, 139, 5), effort: 80 + seeded(index, 149, 820),
      priorityScore: 40 + seeded(index, 151, 61), riskScore: probability * impact, criticality, risk, impediment,
      impedimentText: impediment ? ['Aguardando definição da área demandante.', 'Indisponibilidade temporária de recurso técnico.', 'Contratação em análise pela unidade responsável.', 'Dependência externa sem data confirmada.'][seeded(index, 157, 4)] : '',
      impedimentCategory: impediment ? riskCategories[seeded(index, 163, riskCategories.length)] : '', impedimentSince: impediment ? iso(addDays(new Date(), -(5 + seeded(index, 167, 90)))) : '',
      updated: iso(updated), nextMilestone: milestones.find(m => m.status !== 'Concluído')?.name || 'Encerramento formal',
      archived: false, risks, milestones, activities, evolutions, meetings,
      files: [
        { name: `TAP_${id}.pdf`, category: 'Planejamento', owner: manager, date: iso(start), version: '1.2', tags: ['TAP', 'Aprovado'] },
        { name: `Cronograma_${id}.xlsx`, category: 'Cronograma', owner: manager, date: iso(updated), version: '2.1', tags: ['Cronograma'] }
      ],
      raci: [
        ['Definir escopo', 'A', 'R', 'C', 'I'], ['Validar entregas', 'A', 'C', 'R', 'I'], ['Executar atividades', 'I', 'A', 'C', 'R'], ['Comunicar resultados', 'R', 'C', 'A', 'I']
      ],
      statusReports: [{ version: '1.0', date: iso(updated), achievements: 'Entregas prioritárias revisadas e avanço consolidado com as equipes responsáveis.', impediments: impediment ? 'Há impedimento ativo que requer acompanhamento da equipe responsável.' : 'Nenhum impedimento relevante no período.', nextSteps: 'Concluir as atividades em andamento, atualizar evidências e validar o próximo marco.' }]
    };
  }

  function generateInitiatives() { return Array.from({ length: 200 }, (_, index) => generateInitiative(index)); }

  const artifactModels = [
    ['TAP — Termo de Abertura', 'Documento de autorização e definição inicial da iniciativa.', 'Planejamento', 'DOCX'],
    ['TEP — Termo de Encerramento', 'Registro do aceite, resultados e encerramento formal.', 'Encerramento', 'DOCX'],
    ['Matriz RACI', 'Papéis e responsabilidades pelas principais entregas.', 'Planejamento', 'XLSX'],
    ['Status Report Executivo', 'Síntese periódica de progresso, saúde, riscos e decisões.', 'Monitoramento', 'PDF'],
    ['Ata de reunião', 'Pauta, participantes, decisões e encaminhamentos.', 'Reunião', 'DOCX'],
    ['Relatório para reunião do PMO', 'Visão executiva panorâmica da iniciativa.', 'Governança', 'PDF'],
    ['Registro de riscos', 'Catálogo de riscos e plano de respostas.', 'Riscos', 'XLSX'],
    ['Plano de ação', 'Ações, responsáveis, prazos e acompanhamento.', 'Execução', 'XLSX'],
    ['Cronograma resumido', 'Marcos e entregas consolidados para comunicação.', 'Execução', 'PDF'],
    ['Lições aprendidas', 'Registro estruturado de aprendizados e recomendações.', 'Encerramento', 'DOCX'],
    ['Relatório executivo', 'Consolidação de indicadores para a alta gestão.', 'Governança', 'PDF'],
    ['Checklist de encerramento', 'Verificação de pendências para conclusão.', 'Encerramento', 'PDF']
  ].map((item, index) => ({ id: `ART-${pad(index + 1)}`, name: item[0], description: item[1], category: item[2], format: item[3], updated: `2${index % 8 + 1}/08/2026`, owner: index % 3 === 0 ? 'Escritório de Gestão de Projetos' : managers[index % managers.length].short, favorite: index < 3 }));

  const repositoryFolders = ['Metodologia', 'Modelos', 'Governança', 'Relatórios', 'Planejamento', 'Atas do PMO', 'Materiais de capacitação', 'Normativos', 'Lições aprendidas'];
  const repositoryFiles = Array.from({ length: 32 }, (_, index) => ({
    id: `DOC-${pad(index + 1)}`, folder: repositoryFolders[index % repositoryFolders.length],
    name: ['Manual de Gestão de Projetos', 'Guia de Indicadores', 'Modelo de apresentação executiva', 'Relatório mensal do portfólio', 'Ata de reunião do PMO', 'Plano de capacitação', 'Normativo de governança', 'Catálogo de lições aprendidas'][index % 8] + ` ${index + 1}`,
    format: ['PDF', 'DOCX', 'XLSX', 'PPTX'][index % 4], owner: managers[index % managers.length].short,
    date: `${pad(1 + (index * 3) % 28)}/08/2026`, version: `${1 + index % 3}.${index % 5}`, favorite: index % 7 === 0, shared: index % 4 === 0, size: `${120 + index * 37} KB`
  }));

  window.DemoData = {
    key: 'sisegp-data-v2', managers, areas, cycles, statuses: [...new Set(statuses)], riskLevels: [...new Set(riskLevels)], criticalities: [...new Set(criticalities)], classifications, axes, riskCategories, artifactModels, repositoryFolders, repositoryFiles,
    generateInitiatives, initials,
    load() {
      try {
        const saved = localStorage.getItem(this.key);
        if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length) return parsed; }
      } catch (error) { console.warn('Não foi possível ler os dados locais.', error); }
      return generateInitiatives();
    },
    save(initiatives) {
      try { localStorage.setItem(this.key, JSON.stringify(initiatives)); return true; }
      catch (error) { console.warn('Não foi possível persistir os dados locais.', error); return false; }
    },
    reset() { try { localStorage.removeItem(this.key); } catch (_) {} return generateInitiatives(); },
    addDays, iso
  };
})();
