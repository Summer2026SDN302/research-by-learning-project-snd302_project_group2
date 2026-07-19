import "dotenv/config";
import mongoose from "mongoose";

import Payment from "../src/modules/payment/payment.model.js";
import {
  PAYMENT_TRANSACTION_CODE_LOCKED_STATUSES,
} from "../src/modules/payment/payment.constants.js";

const INDEX_NAME = "transactionCode_paid_unique";

const getMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI;

const main = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI in environment variables");
  }

  await mongoose.connect(mongoUri);

  try {
    const collection = Payment.collection;
    const duplicates = await collection
      .aggregate([
        {
          $match: {
            transactionCode: { $type: "string" },
            paymentStatus: { $in: PAYMENT_TRANSACTION_CODE_LOCKED_STATUSES },
          },
        },
        {
          $group: {
            _id: "$transactionCode",
            count: { $sum: 1 },
            paymentIds: { $push: "$_id" },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
        { $limit: 10 },
      ])
      .toArray();

    if (duplicates.length > 0) {
      throw new Error(
        `Cannot rebuild transactionCode index because duplicate finalized transaction codes still exist: ${JSON.stringify(duplicates)}`,
      );
    }

    const indexes = await collection.indexes();
    const transactionCodeIndexes = indexes.filter(
      (index) => index.name !== "_id_" && index.key?.transactionCode === 1,
    );

    for (const index of transactionCodeIndexes) {
      await collection.dropIndex(index.name);
      console.log(`Dropped index: ${index.name}`);
    }

    await collection.createIndex(
      { transactionCode: 1 },
      {
        name: INDEX_NAME,
        unique: true,
        partialFilterExpression: {
          transactionCode: { $type: "string" },
          paymentStatus: { $in: PAYMENT_TRANSACTION_CODE_LOCKED_STATUSES },
        },
      },
    );

    console.log(`Created index: ${INDEX_NAME}`);
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
