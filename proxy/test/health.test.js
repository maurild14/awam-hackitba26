import assert from "node:assert/strict";
import test from "node:test";

import request from "supertest";

import app from "../src/app.js";

test("GET /healthz returns proxy health payload", async () => {
  const response = await request(app).get("/healthz");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: "ok",
    service: "proxy"
  });
});
