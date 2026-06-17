import dotenv from "dotenv";
import {
  startDailyMenuJob,
  startExpireDailyMenuJob,
} from "./jobs/dailyMenu.job.js";

dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 5000;

connectDB();

startDailyMenuJob();
startExpireDailyMenuJob();

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
