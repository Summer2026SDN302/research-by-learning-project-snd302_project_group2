import mongoose from "mongoose";

export const toObjectId = (id) => {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }

  return new mongoose.Types.ObjectId(id);
};
