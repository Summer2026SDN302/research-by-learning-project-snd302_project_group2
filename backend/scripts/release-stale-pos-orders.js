import "dotenv/config";
import mongoose from "mongoose";

import DailyMenu from "../src/modules/menu/daily-menu/daily-menu.model.js";
import Order from "../src/modules/order/order.model.js";
import {
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
} from "../src/modules/order/order.constants.js";
import Payment from "../src/modules/payment/payment.model.js";
import { PAYMENT_STATUS } from "../src/modules/payment/payment.constants.js";
import { formatVNDateString } from "../src/shared/helpers/date.helper.js";
import { withTransaction } from "../src/shared/helpers/transaction.helper.js";

const HELP_TEXT = `
Release stale POS orders

Usage:
  node scripts/release-stale-pos-orders.js
  node scripts/release-stale-pos-orders.js --apply

Flags:
  --apply   Persist stock release + cancel stale orders
  --help    Show this help message
`;

const parseArgs = (argv) => ({
  apply: argv.includes("--apply"),
  help: argv.includes("--help"),
});

const getMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI;

const staleOrderFilter = {
  invoiceId: null,
  orderStatus: ORDER_STATUS.PENDING,
  $or: [
    { paymentStatus: { $exists: false } },
    {
      paymentStatus: {
        $in: [ORDER_PAYMENT_STATUS.UNPAID, ORDER_PAYMENT_STATUS.PENDING],
      },
    },
  ],
};

const releaseOrderStock = async (order, session) => {
  const menuDate = formatVNDateString(order.orderDate ?? order.createdAt);

  for (const item of order.items ?? []) {
    const foodItemId = item.foodItemId?._id ?? item.foodItemId;
    const quantity = Number(item.quantity || 0);

    if (!foodItemId || quantity <= 0) {
      continue;
    }

    const result = await DailyMenu.updateOne(
      { date: menuDate },
      {
        $inc: {
          "items.$[item].soldQuantity": -quantity,
          "items.$[item].remainingQuantity": quantity,
        },
      },
      {
        arrayFilters: [
          {
            "item.foodItemId": new mongoose.Types.ObjectId(String(foodItemId)),
            "item.soldQuantity": { $gte: quantity },
          },
        ],
        session,
      },
    );

    if (result.modifiedCount === 0) {
      throw new Error(
        `Unable to release stock for order ${order.orderNumber} on menu ${menuDate}`,
      );
    }
  }
};

const run = async ({ apply }) => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI in environment variables");
  }

  await mongoose.connect(mongoUri);

  try {
    const staleOrders = await Order.find(staleOrderFilter).lean();
    const summary = {
      mode: apply ? "apply" : "dry-run",
      staleOrderCount: staleOrders.length,
      releasedOrders: [],
      failedOrders: [],
    };

    for (const order of staleOrders) {
      if (!apply) {
        summary.releasedOrders.push({
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          itemCount: (order.items ?? []).length,
          menuDate: formatVNDateString(order.orderDate ?? order.createdAt),
        });
        continue;
      }

      try {
        await withTransaction(async (session) => {
          await releaseOrderStock(order, session);

          await Order.updateOne(
            { _id: order._id },
            {
              $set: {
                orderStatus: ORDER_STATUS.CANCELLED,
                paymentStatus: ORDER_PAYMENT_STATUS.UNPAID,
                paymentId: null,
                invoiceId: null,
              },
            },
            { session },
          );

          await Payment.updateMany(
            {
              orderId: order._id,
              paymentStatus: {
                $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.FAILED],
              },
            },
            {
              $set: {
                paymentStatus: PAYMENT_STATUS.FAILED,
                failureReason: "Released by stale POS cleanup",
              },
            },
            { session },
          );
        });

        summary.releasedOrders.push({
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          itemCount: (order.items ?? []).length,
          menuDate: formatVNDateString(order.orderDate ?? order.createdAt),
        });
      } catch (error) {
        summary.failedOrders.push({
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          reason: error.message,
        });
      }
    }

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await mongoose.disconnect();
  }
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(HELP_TEXT.trim());
    return;
  }

  await run(args);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
