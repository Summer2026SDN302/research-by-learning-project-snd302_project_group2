import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import categoryRoute from "./modules/menu/category/category.route.js";
import foodItemRoute from "./modules/menu/food_item/food_item.route.js";
import scheduledMenuRoute from "./modules/menu/scheduled_menu/scheduled_menu.route.js";
import dailyMenuRoute from "./modules/menu/daily-menu/daily-menu.route.js";
import authRoute from "./modules/auth/auth.route.js";
import profileRoute from "./modules/user/profile.route.js";
import userRoute from "./modules/user/user.route.js";
import orderRoute from "./modules/order/order.route.js";
import paymentRoute from "./modules/payment/payment.route.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "StallBox API running",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/users", userRoute);
app.use("/api/daily-menu", dailyMenuRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/food-items", foodItemRoute);
app.use("/api/scheduled-menu", scheduledMenuRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
