// import "dotenv/config";
// import mongoose from "mongoose";

// const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// async function probe() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     const db = mongoose.connection.db;

//     const scheduledMenus = await db.collection("scheduledmenus").find({}).toArray();
//     console.log("\n--- Scheduled Menus ---");
//     for (const menu of scheduledMenus) {
//       const items = [];
//       for (const item of menu.menuItems) {
//         const food = await db.collection("fooditems").findOne({ _id: item.foodItemId });
//         items.push(food?.name || item.foodItemId.toString());
//       }
//       console.log(`Day: ${menu.dayOfWeek}, CreatedBy: ${menu.createdBy}, Items: ${items.join(", ")}`);
//     }
//   } catch (error) {
//     console.error(error);
//   } finally {
//     await mongoose.disconnect();
//   }
// }

// probe();
