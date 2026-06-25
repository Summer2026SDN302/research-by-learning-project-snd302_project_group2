import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let mongod = null;

export const connect = async () => {
  // Start memory replica set with wiredTiger engine so transactions are supported.
  mongod = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

export const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};

export const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
};
