import { Router } from "express";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.json({
    status: "ok",
    service: "proxy"
  });
});

export default router;
