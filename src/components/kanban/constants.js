export const COLUMN_TO_STAGE = {
  opportunity: 'Opportunity',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost',
  invoiced: 'Invoiced',
  paid: 'Paid',
};

export const KANBAN_COLUMNS = [
  { id: 'opportunity', title: 'Opportunity', stage: 'Opportunity', useFiltered: true },
  { id: 'proposal', title: 'Proposal', stage: 'Proposal', useFiltered: true },
  { id: 'negotiation', title: 'Negotiation', stage: 'Negotiation', useFiltered: true },
  { id: 'closed-won', title: 'Closed Won', stage: 'Closed Won', useFiltered: true },
  { id: 'closed-lost', title: 'Closed Lost', stage: 'Closed Lost', useFiltered: true },
  { id: 'invoiced', title: 'Invoiced', stage: 'Invoiced', useFiltered: false },
  { id: 'paid', title: 'Paid', stage: 'Paid', useFiltered: true },
];
