import assert from "node:assert/strict";
import test from "node:test";

import request from "supertest";

import app from "../src/app.js";

test("GET /healthz returns backend health payload", async () => {
  const response = await request(app).get("/healthz");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: "ok",
    service: "backend"
  });
});

test("unknown routes return the standardized error payload", async () => {
  const response = await request(app).get("/missing-route");

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, "NOT_FOUND");
  assert.match(response.body.error.message, /was not found\.$/);
  assert.equal(typeof response.body.error.requestId, "string");
  assert.equal(response.body.error.requestId.length > 0, true);
});
