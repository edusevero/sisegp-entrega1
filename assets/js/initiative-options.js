(function () {
  'use strict';
  // Referência: Conteúdo dos SELECTs transcrito no pedido do MVP. Sem pesos implícitos.
  window.InitiativeOptions = {
  "Tipos de Iniciativas": [
    "Crítica/Obrigatória",
    "Estratégica",
    "Tática",
    "Operacional"
  ],
  "DIREÇÃO": [
    "Assessoria de Governança",
    "Assessoria de Projetos",
    "Assessoria de RH",
    "Assessoria de Suporte",
    "Assessoria de Produção",
    "Assessoria de Sistemas",
    "Seção SEGINFO"
  ],
  "DSUP": [
    "Seção de PROV",
    "Seção MICROINF",
    "Seção EXEC PROJ REC",
    "Seção AT SISJUD",
    "Seção AT SISADM",
    "Seção AT INFRA"
  ],
  "DSISADM": [
    "Seção de SISADM",
    "Seção de SISPES",
    "Seção de SISFIN",
    "Seção ERP FIN CONT",
    "Seção ERP INTEGRS E DADOS"
  ],
  "DSISJUD": [
    "Seção GEST CONF TEST",
    "Seção INT AUT E INTEROP",
    "Seção DES TRAM PROC",
    "Seção DES APOIO AUD E SESS",
    "Seção DES SOL FIN JUD",
    "Seção SISJUD AUX"
  ],
  "DPROD": [
    "Seção CONECT",
    "Seção INFRA SIS ARM",
    "Seção CLOUD VM",
    "Seção CENT OBS",
    "Seção OP SEG TIC",
    "Seção ADM BD"
  ],
  "DPROJ": [
    "Seção NP (IA)",
    "Seção PRE DAD",
    "Seção ARQUISIS",
    "Seção SOL EX USU"
  ],
  "Status Administrativo da Iniciativa": [
    "ABERTO",
    "EM PLANEJAMENTO",
    "EM EXECUÇÃO",
    "EM HOMOLOGAÇÃO",
    "EM AJUSTES",
    "FINALIZADO",
    "SUSPENSO",
    "CANCELADO"
  ],
  "Áreas Envolvidas": [
    "DITIC",
    "DILOG",
    "DIGEP",
    "ASSEST",
    "CGJ",
    "DIPRED",
    "DIGEJUR",
    "DIFIN",
    "DICOM",
    "DG",
    "PRESIDENCIA"
  ],
  "Classificação DITIC": [
    "Implementação",
    "Implantado",
    "Aquisição",
    "Pesquisa"
  ],
  "Iniciativa Estratégica": ["SIM", "NÃO"],
  "Biênio — PDTIC": [
    "24-25",
    "26-27",
    "28-29",
    "30-31"
  ],
  "Eixo": [
    "(PESSOAS) Valorização real das pessoas",
    "(PARTICIPAÇÃO) Participação e transparência",
    "(INOVAÇÃO) Inovação com foco em resultados",
    "(DADOS) Gestão de dados para eficiência",
    "(GESTÃO) Eficiência e modernização administrativa"
  ],
  "Ciclo": [
    "SEM CICLO",
    "CICLO 1",
    "CICLO 2",
    "CICLO 3",
    "CICLO 4"
  ],
  "ENTICJUD": [
    "Colaboração e inovação",
    "Governança e Gestão de TIC",
    "Segurança da informação e proteção de dados",
    "Aquisições e contratações",
    "Serviços de infraestrutura e soluções corporativas",
    "Atendimento e satisfação do usuário",
    "Desenvolvimento das competências dos colaboradores",
    "Iniciativas de transformação digital"
  ],
  "Objetivo Estratégico": [
    "FOMENTAR A RESPONSABILIDADE SOCIAL E AMBIENTAL",
    "INCREMENTAR A ACESSIBILIDADE",
    "MANTER O PRESTÍGIO E ESPAÇO",
    "MODERNIZAR A GESTÃO",
    "AUMENTAR A CELERIDADE PROCESSUAL",
    "INCREMENTAR A RESOLUÇÃO DA DEMANDA",
    "ELEVAR A CAPACIDADE DE REALIZAÇÃO DAS PESSOAS",
    "GARANTIR A SEGURANÇA DO JUDICIÁRIO",
    "INCREMENTAR A AUTONOMIA ORÇAMENTÁRIA",
    "QUALIFICAR MEIOS DE INFORMÁTICA",
    "MELHORAR DESEMPENHO DAS ÁREAS MEIO"
  ],
  "Criticidade": [
    "BAIXA",
    "MÉDIA",
    "ALTA"
  ],
  "Complexidade": [
    "BAIXA",
    "MÉDIA",
    "ALTA"
  ],
  "Importância para o TJRS": [
    "BAIXA",
    "ALTA"
  ],
  "Necessidade": [
    "ESSENCIAL",
    "IMPORTANTE",
    "DESEJÁVEL"
  ],
  "Impacto no PE": [
    "BAIXA",
    "MÉDIA",
    "ALTA"
  ],
  "Determinação Legal": [
    "SIM",
    "NÃO"
  ],
  "Prazo": [
    "CONTRATUAL",
    "LIMITADO",
    "LIVRE"
  ],
  "Orçamento": [
    "BAIXA",
    "MÉDIA",
    "ALTA"
  ],
  "Gerentes de Projetos": [
    "Adriana Ferreira de Brito",
    "Alexandre Faccioni Barcellos",
    "Antônio Carlos da Luz Cepa",
    "Carine Vitoria Amaral de Lima",
    "Eduardo de Borba Severo",
    "Katia Cilene Rauber Peil",
    "Marcelo Malaquias Xavier"
  ],
  "Status Report — Tipo de Relatório": [
    "Estratégico",
    "Mudança",
    "Ordinário"
  ],
  "Status Report — Situação da Iniciativa": [
    "Em dia",
    "Atrasado",
    "Em risco"
  ]
};
}());
