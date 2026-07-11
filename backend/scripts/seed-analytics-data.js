/**
 * Seed sample orders + payments for analytics development.
 *
 * Usage (from backend/):
 *   node scripts/seed-analytics-data.js
 *
 * Requires MONGODB_URI in .env (loaded via dotenv from backend root).
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import Order from "../src/modules/order/order.model.js";
import Payment from "../src/modules/payment/payment.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SEED_PREFIX = "SEED-";
const FOOD_ITEMS = [
  {
    foodItemId: new mongoose.Types.ObjectId("6a0000000000000000000001"),
    name: "Phở Bò Tái Nạm",
    unitPrice: 45000,
  },
  {
    foodItemId: new mongoose.Types.ObjectId("6a0000000000000000000002"),
    name: "Cơm Gà Xối Mỡ",
    unitPrice: 40000,
  },
  {
    foodItemId: new mongoose.Types.ObjectId("6a0000000000000000000003"),
    name: "Bún Thịt Nướng",
    unitPrice: 35000,
  },
];

const PAYMENT_METHODS = ["Cash", "Momo", "VNPay"];
const STAFF_ID = new mongoose.Types.ObjectId("507f1f77bcf86cd799439099");

const subtractDays = (dateStr, days) => {
  const date = new Date(`${dateStr}T12:00:00+07:00`);
  date.setDate(date.getDate() - days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
};

const getTodayVN = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());

const buildOrderItems = (dayIndex) => {
  const itemCount = 3 + (dayIndex % 3);
  const items = [];

  for (let i = 0; i < itemCount; i += 1) {
    const food = FOOD_ITEMS[i % FOOD_ITEMS.length];
    const quantity = 1 + ((dayIndex + i) % 5);
    items.push({
      foodItemId: food.foodItemId,
      name: food.name,
      unitPrice: food.unitPrice,
      quantity,
    });
  }

  return items;
};

const calcTotal = (items) =>
  items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

const seed = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI/MONGO_URI is not defined in backend/.env");
  }

  await mongoose.connect(mongoUri);

  await Promise.all([
    Order.deleteMany({ orderNumber: { $regex: `^${SEED_PREFIX}` } }),
    Payment.deleteMany({ paymentNumber: { $regex: `^${SEED_PREFIX}` } }),
  ]);

  const today = getTodayVN();
  const orders = [];
  const payments = [];

  for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
    const orderDate = subtractDays(today, dayOffset);
    const ordersPerDay = 1;

    for (let i = 0; i < ordersPerDay; i += 1) {
      const items = buildOrderItems(dayOffset + i);
      const totalAmount = calcTotal(items);
      const orderNumber = `${SEED_PREFIX}ORD-${orderDate}-${i}`;
      const paymentNumber = `${SEED_PREFIX}TXN-${orderDate}-${i}`;
      const orderId = new mongoose.Types.ObjectId();
      const createdAt = new Date(`${orderDate}T${String(10 + (i % 8)).padStart(2, "0")}:30:00+07:00`);

      const seq = dayOffset + i;
      let orderStatus = "Completed";
      let paymentStatus = "Paid";
      if (seq % 7 === 0) {
        orderStatus = "Cancelled";
        paymentStatus = "Failed";
      } else if (seq % 11 === 0) {
        orderStatus = "Returned";
        paymentStatus = "Refunded";
      }
      const isPaid = paymentStatus === "Paid";

      orders.push({
        _id: orderId,
        orderNumber,
        staffId: STAFF_ID,
        items,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount,
        orderStatus,
        orderDate,
        createdAt,
        updatedAt: createdAt,
      });

      payments.push({
        paymentNumber,
        orderId,
        finalAmount: totalAmount,
        paymentMethod: PAYMENT_METHODS[i % PAYMENT_METHODS.length],
        amountReceived: isPaid ? totalAmount : 0,
        changeReturned: 0,
        transactionCode: `${SEED_PREFIX}TC-${orderDate}-${i}`,
        paymentStatus,
        refundedAt: paymentStatus === "Refunded" ? createdAt : null,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  await Order.insertMany(orders);
  await Payment.insertMany(payments);

  console.log(
    `Seeded ${orders.length} orders and ${payments.length} payments for analytics.`,
  );
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
