export const ROLES = Object.freeze({
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin"
});

export const BOT_STATUSES = Object.freeze({
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  PUBLISHED: "published",
  SUSPENDED: "suspended"
});

export const SESSION_STATUSES = Object.freeze({
  INITIALIZING: "initializing",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  STOPPED: "stopped",
  TIMED_OUT: "timed_out"
});

export const PAYMENT_STATUSES = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REFUNDED: "refunded"
});
