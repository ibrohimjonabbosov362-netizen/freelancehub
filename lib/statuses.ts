export const PROJECT_STATUSES = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "COMPLETED",
  "PAUSED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const projectStatusLabels: Record<ProjectStatus, string> = {
  BACKLOG: "Rejada",
  TODO: "Boshlanadi",
  IN_PROGRESS: "Jarayonda",
  UNDER_REVIEW: "Ko'rikda",
  COMPLETED: "Tugallangan",
  PAUSED: "To'xtatilgan",
};

export const projectStatusBadges: Record<ProjectStatus, string> = {
  BACKLOG: "badge-neutral",
  TODO: "badge-neutral",
  IN_PROGRESS: "badge-accent",
  UNDER_REVIEW: "badge-warning",
  COMPLETED: "badge-success",
  PAUSED: "badge-neutral",
};

/** Doskada ko'rinadigan ustunlar. To'xtatilganlar alohida ajratiladi. */
export const BOARD_COLUMNS: ProjectStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "COMPLETED",
];

export const PROPOSAL_STATUSES = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  DRAFT: "Qoralama",
  SENT: "Yuborilgan",
  ACCEPTED: "Qabul qilingan",
  REJECTED: "Rad etilgan",
};

export const proposalStatusBadges: Record<ProposalStatus, string> = {
  DRAFT: "badge-neutral",
  SENT: "badge-warning",
  ACCEPTED: "badge-success",
  REJECTED: "badge-danger",
};

export const PAYMENT_STATUSES = ["PENDING", "PAID", "OVERDUE"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Kutilmoqda",
  PAID: "To'langan",
  OVERDUE: "Muddati o'tgan",
};

export const paymentStatusBadges: Record<PaymentStatus, string> = {
  PENDING: "badge-warning",
  PAID: "badge-success",
  OVERDUE: "badge-danger",
};
