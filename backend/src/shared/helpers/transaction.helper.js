import mongoose from "mongoose";
import AppError from "../exceptions/AppError.js";

/**
 * Runs a callback inside a MongoDB transaction session.
 * Rejects with TRANSACTION_NOT_SUPPORTED (503) if MongoDB is running as standalone (no replica set).
 *
 * @param {Function} callback - Async function executing DB queries, receives `session`
 * @returns {Promise<any>} Result of the callback
 */
export const withTransaction = async (callback) => {
  let session;
  try {
    session = await mongoose.startSession();
  } catch (error) {
    if (
      error.message?.includes("sessions") ||
      error.message?.includes("session") ||
      error.message?.includes("replica set") ||
      error.message?.includes("topology")
    ) {
      throw new AppError(
        "Database transactions are not supported on this MongoDB deployment. A replica set is required.",
        503,
        "TRANSACTION_NOT_SUPPORTED"
      );
    }
    throw error;
  }

  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    // Check if error is related to transaction support
    if (
      error.message?.includes("replica set") ||
      error.message?.includes("transaction") ||
      error.message?.includes("Transaction") ||
      error.message?.includes("session") ||
      error.code === 20 ||
      error.codeName?.includes("Transaction")
    ) {
      throw new AppError(
        "Database transactions are not supported on this MongoDB deployment. A replica set is required.",
        503,
        "TRANSACTION_NOT_SUPPORTED"
      );
    }
    throw error;
  } finally {
    session.endSession();
  }
};
