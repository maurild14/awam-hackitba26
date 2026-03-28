import assert from "node:assert/strict";
import test from "node:test";

import {
  BOT_STATUSES,
  PAYMENT_STATUSES,
  ROLES,
  SESSION_STATUSES,
  sanitizeForLog
} from "../src/index.js";

test("sanitizeForLog redacts sensitive headers", () => {
  const payload = {
    authorization: "Bearer secret",
    nested: {
      cookie: "session=secret",
      "x-api-key": "abc123",
      keep: "visible"
    },
    list: [
      {
        "proxy-authorization": "proxy secret"
      }
    ]
  };

  assert.deepEqual(sanitizeForLog(payload), {
    authorization: "[REDACTED]",
    nested: {
      cookie: "[REDACTED]",
      "x-api-key": "[REDACTED]",
      keep: "visible"
    },
    list: [
      {
        "proxy-authorization": "[REDACTED]"
      }
    ]
  });
});

test("shared constants expose documented roles and statuses", () => {
  assert.equal(ROLES.BUYER, "buyer");
  assert.equal(ROLES.SELLER, "seller");
  assert.equal(ROLES.ADMIN, "admin");
  assert.equal(BOT_STATUSES.PENDING_REVIEW, "pending_review");
  assert.equal(SESSION_STATUSES.TIMED_OUT, "timed_out");
  assert.equal(PAYMENT_STATUSES.APPROVED, "approved");
});
