// import "dotenv/config";
// import mongoose from "mongoose";

// const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// async function verify() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     const db = mongoose.connection.db;

//     console.log("--- Daily Menus In DB ---");
//     const menus = await db.collection("dailymenus").find({ date: { $in: ["2026-06-26", "2026-06-27"] } }).toArray();
//     menus.forEach(m => {
//       console.log(`Date: ${m.date}, Items Count: ${m.items?.length}, Configured: ${m.isConfigured}`);
//     });

//     console.log("\n--- AI Insights In DB ---");
//     const insights = await db.collection("aiinsights").find({}).toArray();
//     insights.forEach(i => {
//       console.log(`ID: ${i._id}`);
//       console.log(`TargetDate: ${i.targetDate}`);
//       console.log(`Forecasts Count: ${i.forecasts?.length}`);
//       console.log(`PricingRecs Count: ${i.pricingRecommendations?.length}`);
//       if (i.pricingRecommendations && i.pricingRecommendations.length > 0) {
//         console.log("Pricing items:");
//         i.pricingRecommendations.forEach(p => {
//           console.log(`  - Item: ${p.name}, Stock: ${p.currentRemaining}, Original: ${p.originalPrice}, Recommended: ${p.recommendedPrice} (-${p.recommendedDiscountPercentage}%), Reason: ${p.reason}`);
//         });
//       }
//     });

//   } catch (err) {
//     console.error(err);
//   } finally {
//     await mongoose.disconnect();
//   }
// }

// verify();
