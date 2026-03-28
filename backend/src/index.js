import app from "./app.js";
import config from "./config/env.js";
import { createLogger } from "./lib/logger.js";

const logger = createLogger("backend");

app.listen(config.port, () => {
  logger.info("Backend listening.", {
    nodeEnv: config.nodeEnv,
    port: config.port
  });
});
