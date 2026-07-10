import "dotenv/config";
import mongoose from "mongoose";

import Invoice from "../src/modules/invoice/invoice.model.js";
import Order from "../src/modules/order/order.model.js";
import Payment from "../src/modules/payment/payment.model.js";
import {
  buildInvoiceBackfillUpdate,
  buildOrderBackfillUpdate,
  buildPaymentBackfillUpdate,
} from "../src/modules/payment/payment.backfill.js";
import { PAYMENT_STATUS } from "../src/modules/payment/payment.constants.js";

const HELP_TEXT = `
Payment/Billing backfill utility

Usage:
  node scripts/backfill-payment-billing.js
  node scripts/backfill-payment-billing.js --apply

Flags:
  --apply   Persist the generated backfill updates
  --help    Show this help message
`;

const parseArgs = (argv) => ({
  apply: argv.includes("--apply"),
  help: argv.includes("--help"),
});

const getMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI;

const toId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return String(value._id);
  }

  return String(value);
};

const compareDatesDesc = (left, right) =>
  new Date(right?.updatedAt ?? right?.createdAt ?? 0).getTime() -
  new Date(left?.updatedAt ?? left?.createdAt ?? 0).getTime();

const paymentStatusPriority = (status) => {
  switch (status) {
    case PAYMENT_STATUS.PAID:
      return 0;
    case PAYMENT_STATUS.PENDING:
      return 1;
    case PAYMENT_STATUS.REFUNDED:
      return 2;
    case PAYMENT_STATUS.FAILED:
      return 3;
    default:
      return 9;
  }
};

const selectPrimaryPaymentForOrder = (payments) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return null;
  }

  return [...payments].sort((left, right) => {
    const priorityDelta =
      paymentStatusPriority(left.paymentStatus) -
      paymentStatusPriority(right.paymentStatus);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return compareDatesDesc(left, right);
  })[0];
};

const buildSummaryBucket = (totalScanned) => ({
  totalScanned,
  updateCount: 0,
  changedFields: {},
  samples: [],
});

const recordUpdate = (bucket, documentId, updates) => {
  bucket.updateCount += 1;

  Object.keys(updates).forEach((fieldName) => {
    bucket.changedFields[fieldName] = (bucket.changedFields[fieldName] ?? 0) + 1;
  });

  if (bucket.samples.length < 10) {
    bucket.samples.push({
      id: toId(documentId),
      fields: Object.keys(updates),
    });
  }
};

const buildInvoiceLookupByOrderId = (invoices) => {
  const map = new Map();

  invoices.forEach((invoice) => {
    const orderId = toId(invoice.orderId);

    if (!orderId) {
      return;
    }

    const current = map.get(orderId) ?? [];
    current.push(invoice);
    map.set(orderId, current);
  });

  return map;
};

const buildPaymentLookupByOrderId = (payments) => {
  const map = new Map();

  payments.forEach((payment) => {
    const orderId = toId(payment.orderId);

    if (!orderId) {
      return;
    }

    const current = map.get(orderId) ?? [];
    current.push(payment);
    map.set(orderId, current);
  });

  return map;
};

const buildOperations = ({ payments, invoices, orders }) => {
  const invoiceById = new Map(invoices.map((invoice) => [toId(invoice._id), invoice]));
  const invoiceByPaymentId = new Map(
    invoices
      .filter((invoice) => invoice.paymentId)
      .map((invoice) => [toId(invoice.paymentId), invoice]),
  );
  const invoicesByOrderId = buildInvoiceLookupByOrderId(invoices);
  const paymentById = new Map(payments.map((payment) => [toId(payment._id), payment]));
  const paymentsByOrderId = buildPaymentLookupByOrderId(payments);

  const paymentSummary = buildSummaryBucket(payments.length);
  const invoiceSummary = buildSummaryBucket(invoices.length);
  const orderSummary = buildSummaryBucket(orders.length);

  const paymentOps = payments.flatMap((payment) => {
    const linkedInvoice =
      invoiceById.get(toId(payment.invoiceId)) ??
      invoiceByPaymentId.get(toId(payment._id)) ??
      null;
    const updates = buildPaymentBackfillUpdate(payment, linkedInvoice);

    if (Object.keys(updates).length === 0) {
      return [];
    }

    recordUpdate(paymentSummary, payment._id, updates);

    return [
      {
        updateOne: {
          filter: { _id: payment._id },
          update: { $set: updates },
        },
      },
    ];
  });

  const invoiceOps = invoices.flatMap((invoice) => {
    const updates = buildInvoiceBackfillUpdate(invoice);

    if (Object.keys(updates).length === 0) {
      return [];
    }

    recordUpdate(invoiceSummary, invoice._id, updates);

    return [
      {
        updateOne: {
          filter: { _id: invoice._id },
          update: { $set: updates },
        },
      },
    ];
  });

  const orderOps = orders.flatMap((order) => {
    const explicitPayment = paymentById.get(toId(order.paymentId)) ?? null;
    const inferredPayment =
      explicitPayment ??
      selectPrimaryPaymentForOrder(paymentsByOrderId.get(toId(order._id)) ?? []);
    const linkedInvoice =
      invoiceById.get(toId(order.invoiceId)) ??
      invoiceByPaymentId.get(toId(inferredPayment?._id)) ??
      (invoicesByOrderId.get(toId(order._id)) ?? []).sort(compareDatesDesc)[0] ??
      null;
    const updates = buildOrderBackfillUpdate(order, inferredPayment, linkedInvoice);

    if (Object.keys(updates).length === 0) {
      return [];
    }

    recordUpdate(orderSummary, order._id, updates);

    return [
      {
        updateOne: {
          filter: { _id: order._id },
          update: { $set: updates },
        },
      },
    ];
  });

  return {
    paymentOps,
    invoiceOps,
    orderOps,
    summary: {
      payments: paymentSummary,
      invoices: invoiceSummary,
      orders: orderSummary,
    },
  };
};

const run = async ({ apply }) => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI in environment variables");
  }

  await mongoose.connect(mongoUri);

  try {
    const [payments, invoices, orders] = await Promise.all([
      Payment.find({}).lean(),
      Invoice.find({}).lean(),
      Order.find({}).lean(),
    ]);

    const { paymentOps, invoiceOps, orderOps, summary } = buildOperations({
      payments,
      invoices,
      orders,
    });

    if (apply) {
      if (paymentOps.length > 0) {
        await Payment.bulkWrite(paymentOps, { ordered: false });
      }

      if (invoiceOps.length > 0) {
        await Invoice.bulkWrite(invoiceOps, { ordered: false });
      }

      if (orderOps.length > 0) {
        await Order.bulkWrite(orderOps, { ordered: false });
      }
    }

    console.log(
      JSON.stringify(
        {
          mode: apply ? "apply" : "dry-run",
          summary,
        },
        null,
        2,
      ),
    );
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
