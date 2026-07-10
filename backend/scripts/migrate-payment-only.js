import "dotenv/config";
import mongoose from "mongoose";

const HELP_TEXT = `
Payment-only migration utility

Usage:
  node scripts/migrate-payment-only.js
  node scripts/migrate-payment-only.js --apply

Flags:
  --apply   Persist the generated updates
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

const buildSummaryBucket = (totalScanned) => ({
  totalScanned,
  updateCount: 0,
  changedFields: {},
  samples: [],
});

const recordUpdate = (bucket, documentId, setFields = {}, unsetFields = {}) => {
  const changedKeys = [
    ...Object.keys(setFields),
    ...Object.keys(unsetFields).map((field) => `unset:${field}`),
  ];

  if (changedKeys.length === 0) {
    return;
  }

  bucket.updateCount += 1;

  changedKeys.forEach((fieldName) => {
    bucket.changedFields[fieldName] = (bucket.changedFields[fieldName] ?? 0) + 1;
  });

  if (bucket.samples.length < 10) {
    bucket.samples.push({
      id: toId(documentId),
      fields: changedKeys,
    });
  }
};

const PAYMENT_FIELDS_TO_UNSET = [
  "invoiceId",
  "subtotalAmount",
  "discountAmount",
  "taxRate",
  "taxAmount",
  "providerName",
  "initiatedBy",
  "confirmedBy",
  "paidAt",
  "failureReason",
  "printCount",
  "lastPrintedAt",
  "lastPrintedBy",
  "auditTrail",
];

const ORDER_FIELDS_TO_UNSET = [
  "invoiceId",
  "paymentId",
  "paymentStatus",
];

const buildPaymentUpdate = (payment) => {
  const set = {};
  const unset = {};

  PAYMENT_FIELDS_TO_UNSET.forEach((fieldName) => {
    if (Object.prototype.hasOwnProperty.call(payment, fieldName)) {
      unset[fieldName] = "";
    }
  });

  return { set, unset };
};

const buildOrderUpdate = (order) => {
  const set = {};
  const unset = {};

  ORDER_FIELDS_TO_UNSET.forEach((fieldName) => {
    if (Object.prototype.hasOwnProperty.call(order, fieldName)) {
      unset[fieldName] = "";
    }
  });

  return { set, unset };
};

const buildOperations = ({ payments, orders }) => {
  const paymentSummary = buildSummaryBucket(payments.length);
  const orderSummary = buildSummaryBucket(orders.length);

  const paymentOps = payments.flatMap((payment) => {
    const { set, unset } = buildPaymentUpdate(payment);

    if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
      return [];
    }

    recordUpdate(paymentSummary, payment._id, set, unset);

    const update = {};

    if (Object.keys(set).length > 0) {
      update.$set = set;
    }

    if (Object.keys(unset).length > 0) {
      update.$unset = unset;
    }

    return [
      {
        updateOne: {
          filter: { _id: payment._id },
          update,
        },
      },
    ];
  });

  const orderOps = orders.flatMap((order) => {
    const { set, unset } = buildOrderUpdate(order);

    if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
      return [];
    }

    recordUpdate(orderSummary, order._id, set, unset);

    const update = {};

    if (Object.keys(set).length > 0) {
      update.$set = set;
    }

    if (Object.keys(unset).length > 0) {
      update.$unset = unset;
    }

    return [
      {
        updateOne: {
          filter: { _id: order._id },
          update,
        },
      },
    ];
  });

  return {
    paymentOps,
    orderOps,
    summary: {
      payments: paymentSummary,
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
    const db = mongoose.connection.db;
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const collectionNames = new Set(collections.map((item) => item.name));

    const paymentsCollection = db.collection("payments");
    const ordersCollection = db.collection("orders");
    const invoicesCollection = db.collection("invoices");

    const [payments, orders, invoices] = await Promise.all([
      paymentsCollection.find({}).toArray(),
      ordersCollection.find({}).toArray(),
      collectionNames.has("invoices") ? invoicesCollection.find({}).toArray() : [],
    ]);

    const { paymentOps, orderOps, summary } = buildOperations({
      payments,
      orders,
    });

    if (apply) {
      if (paymentOps.length > 0) {
        await paymentsCollection.bulkWrite(paymentOps, { ordered: false });
      }

      if (orderOps.length > 0) {
        await ordersCollection.bulkWrite(orderOps, { ordered: false });
      }
    }

    const invoiceCount = collectionNames.has("invoices")
      ? await invoicesCollection.countDocuments()
      : 0;
    const paymentTransactionCount = collectionNames.has("payment_transactions")
      ? await db.collection("payment_transactions").countDocuments()
      : 0;

    console.log(
      JSON.stringify(
        {
          mode: apply ? "apply" : "dry-run",
          legacyCollections: {
            invoices: invoiceCount,
            payment_transactions: paymentTransactionCount,
          },
          summary,
          nextStep:
            "Verify the application on payment-based receipts before archiving legacy collections.",
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
