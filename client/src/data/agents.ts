export interface Agent {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export const agents: Agent[] = [
  {
    id: 1,
    icon: 'fas fa-briefcase',
    title: 'Agente Comercial (SDR)',
    description: 'Automatize prospecção e qualificação de leads. Este agente gerencia o funil de vendas, agenda reuniões e mantém interações personalizadas com potenciais clientes.'
  },
  {
    id: 2,
    icon: 'fas fa-hospital',
    title: 'Agente Clínicas',
    description: 'Otimize o gerenciamento de pacientes e consultas. Este agente organiza agendamentos, envia lembretes e facilita a comunicação entre equipe médica e pacientes.'
  },
  {
    id: 7,
    icon: 'fas fa-headset',
    title: 'Agente CS',
    description: 'Eleve o suporte ao cliente a outro nível. Este agente gerencia tickets, oferece respostas rápidas a dúvidas frequentes e ajuda a manter altos níveis de satisfação.'
  },
  {
    id: 8,
    icon: 'fas fa-undo',
    title: 'Agente Recuperador de Vendas',
    description: 'Reduza o abandono de carrinho e recupere clientes. Este agente implementa estratégias personalizadas para reconquistar vendas perdidas e aumentar conversões.'
  },
  {
    id: 9,
    icon: 'fas fa-users',
    title: 'Agente Recrutamento Pessoal (RH)',
    description: 'Simplifique processos de seleção e contratação. Este agente filtra currículos, agenda entrevistas e ajuda a identificar os melhores candidatos para cada posição.'
  },
  {
    id: 12,
    icon: 'fas fa-brain',
    title: 'Agente para Psicólogos',
    description: 'Potencialize a prática psicológica. Este agente facilita a gestão de prontuários, organiza anotações de sessões e ajuda com recursos teóricos específicos para diferentes casos.'
  },
  {
    id: 13,
    icon: 'fas fa-stethoscope',
    title: 'Agente para Médicos',
    description: 'Transforme a gestão do consultório médico. Este agente auxilia no agendamento de consultas, triagem de pacientes, orientações clínicas e comunicação eficiente com pacientes.'
  },
  {
    id: 14,
    icon: 'fas fa-wifi',
    title: 'Agente Provedor de Internet',
    description: 'Automatize o suporte e atendimento do seu provedor. Este agente gerencia chamados técnicos, suporte a clientes, informações de planos e acompanhamento de contratos.'
  }
];
