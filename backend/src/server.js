import "dotenv/config";
import {
  startDailyMenuJob,
  startExpireDailyMenuJob,
} from "./jobs/dailyMenu.job.js";

import { startAiPricingScheduler } from "./jobs/ai-pricing.job.js";

import http from "http";
import { initSocket } from "./sockets/socket.js";
import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 5000;

connectDB();

startDailyMenuJob();
startExpireDailyMenuJob();
startAiPricingScheduler();

const server = http.createServer(app);
initSocket(server, process.env.CLIENT_URL);

server.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
