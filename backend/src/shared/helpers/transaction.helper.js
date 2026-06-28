import mongoose from "mongoose";

const isStandaloneTopology = (helloResult = {}) =>
  !helloResult.setName && helloResult.msg !== "isdbgrid";

let transactionSupportPromise = null;

const detectTransactionSupport = async () => {
  const adminFactory = mongoose.connection?.db?.admin;

  if (typeof adminFactory !== "function") {
    return true;
  }

  const admin = adminFactory.call(mongoose.connection.db);

  try {
    const topology = await admin.command({ hello: 1 });
    return !isStandaloneTopology(topology);
  } catch (helloError) {
    try {
      const topology = await admin.command({ isMaster: 1 });
      return !isStandaloneTopology(topology);
    } catch {
      // If topology detection is unavailable, let the runtime attempt a transaction.
      return true;
    }
  }
};

const getTransactionSupport = async () => {
  if (!transactionSupportPromise) {
    transactionSupportPromise = detectTransactionSupport().catch((error) => {
      transactionSupportPromise = null;
      throw error;
    });
  }

  return transactionSupportPromise;
};

const abortTransactionSafely = async (session) => {
  if (session?.inTransaction?.()) {
    await session.abortTransaction();
  }
};

/**
 * Runs a callback inside a MongoDB transaction when the current deployment
 * supports it. Standalone MongoDB servers fall back to a normal sessionless
 * execution path so local/dev environments can keep working without a replica set.
 *
 * @param {Function} callback - Async function executing DB queries, receives `session`
 * @returns {Promise<any>} Result of the callback
 */
export const withTransaction = async (callback) => {
  const supportsTransactions = await getTransactionSupport();

  if (!supportsTransactions) {
    return callback(undefined);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await abortTransactionSafely(session);
    throw error;
  } finally {
    session.endSession();
  }
};
