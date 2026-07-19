// import "dotenv/config";
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// // Import Models
// import User from "./src/modules/user/user.model.js";
// import Category from "./src/modules/menu/category/category.model.js";
// import FoodItem from "./src/modules/menu/food_item/food_item.model.js";
// import DailyMenu from "./src/modules/menu/daily-menu/daily-menu.model.js";
// import ScheduledMenu from "./src/modules/menu/scheduled_menu/scheduled_menu.model.js";
// import Order from "./src/modules/order/order.model.js";
// import AiInsight from "./src/modules/ai/ai.model.js";

// const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // Set dates for today and tomorrow relative to the local context
// // Local time in metadata is 2026-06-26
// const TODAY_STR = "2026-06-26";
// const TOMORROW_STR = "2026-06-27";

// async function runSeed() {
//   if (!MONGO_URI) {
//     console.error("Missing MONGO_URI in .env file");
//     process.exit(1);
//   }

//   try {
//     console.log("Connecting to MongoDB...");
//     await mongoose.connect(MONGO_URI);
//     console.log("Database connected successfully.");

//     // ==========================================
//     // 1. Seed / Retrieve Users
//     // ==========================================
//     console.log("\n--- Checking/Seeding Users ---");
//     const salt = await bcrypt.genSalt(12);
//     const passwordHash = await bcrypt.hash("password123", salt);

//     let adminUser = await User.findOne({ role: "Admin" });
//     if (!adminUser) {
//       adminUser = await User.create({
//         username: "admin",
//         fullName: "System Admin",
//         email: "admin@stallbox.local",
//         passwordHash,
//         role: "Admin",
//         isActive: true,
//       });
//       console.log(`Created Admin user: ${adminUser.username}`);
//     } else {
//       console.log(`Found existing Admin user: ${adminUser.username}`);
//     }

//     let managerUser = await User.findOne({ role: "Manager" });
//     if (!managerUser) {
//       managerUser = await User.create({
//         username: "NamNV",
//         fullName: "Nguyen Van Nam",
//         email: "nguyenvannam@gmail.com",
//         passwordHash,
//         role: "Manager",
//         isActive: true,
//       });
//       console.log(`Created Manager user: ${managerUser.username}`);
//     } else {
//       console.log(`Found existing Manager user: ${managerUser.username}`);
//     }

//     let staffUser = await User.findOne({ role: "Staff" });
//     if (!staffUser) {
//       staffUser = await User.create({
//         username: "staff01",
//         fullName: "Le Thuy Duong",
//         email: "lethuyduongc9@gmail.com",
//         passwordHash,
//         role: "Staff",
//         isActive: true,
//       });
//       console.log(`Created Staff user: ${staffUser.username}`);
//     } else {
//       console.log(`Found existing Staff user: ${staffUser.username}`);
//     }

//     // ==========================================
//     // 2. Seed / Retrieve Categories & Food Items
//     // ==========================================
//     console.log("\n--- Checking Categories & Food Items ---");
//     const categoriesMap = {};
//     const defaultCategories = [
//       { name: "Cơm", icon: "rice_bowl", desc: "Các món cơm trưa dinh dưỡng" },
//       { name: "Bún - Phở - Mì", icon: "ramen_dining", desc: "Các món nước hấp dẫn" },
//       { name: "Bánh mì", icon: "breakfast_dining", desc: "Bánh mì Việt Nam truyền thống" },
//       { name: "Ăn vặt", icon: "fastfood", desc: "Các món ăn vặt nhẹ" },
//       { name: "Nước uống", icon: "local_cafe", desc: "Đồ uống giải khát" },
//       { name: "Tráng miệng", icon: "icecream", desc: "Các món ngọt tráng miệng" }
//     ];

//     for (const cat of defaultCategories) {
//       let existingCat = await Category.findOne({ name: cat.name }).collation({ locale: "vi", strength: 2 });
//       if (!existingCat) {
//         existingCat = await Category.create({
//           name: cat.name,
//           icon: cat.icon,
//           description: cat.desc,
//           isActive: true
//         });
//         console.log(`Created Category: ${existingCat.name}`);
//       } else {
//         console.log(`Found existing Category: ${existingCat.name}`);
//       }
//       categoriesMap[cat.name] = existingCat._id;
//     }

//     // Ensure we have a set of baseline food items matching typical canteen menu
//     const defaultFoodItems = [
//       { name: "Cơm Gà Xối Mỡ", category: "Cơm", basePrice: 40000, cost: 22000 },
//       { name: "Cơm Gà Nướng Mật Ong", category: "Cơm", basePrice: 45000, cost: 25000 },
//       { name: "Cơm Sườn Nướng", category: "Cơm", basePrice: 40000, cost: 22000 },
//       { name: "Cơm Thịt Kho Trứng", category: "Cơm", basePrice: 35000, cost: 18000 },
//       { name: "Cơm Chiên Dương Châu", category: "Cơm", basePrice: 38000, cost: 20000 },
//       { name: "Phở Bò Tái", category: "Bún - Phở - Mì", basePrice: 35000, cost: 19000 },
//       { name: "Bún Bò Huế", category: "Bún - Phở - Mì", basePrice: 40000, cost: 22000 },
//       { name: "Mì Quảng Gà", category: "Bún - Phở - Mì", basePrice: 35000, cost: 18000 },
//       { name: "Bún Thịt Nướng", category: "Bún - Phở - Mì", basePrice: 35000, cost: 18000 },
//       { name: "Bánh Mì Xíu Mại", category: "Bánh mì", basePrice: 28000, cost: 14000 },
//       { name: "Bánh Mì Trứng Ốp La", category: "Bánh mì", basePrice: 20000, cost: 9000 },
//       { name: "Bánh Mì Thịt Nướng", category: "Bánh mì", basePrice: 25000, cost: 12000 },
//       { name: "Cơm Cuộn Rong Biển", category: "Ăn vặt", basePrice: 20000, cost: 10000 },
//       { name: "Xúc Xích Đức Nướng", category: "Ăn vặt", basePrice: 12000, cost: 6000 },
//       { name: "Khoai Lang Lắc", category: "Ăn vặt", basePrice: 15000, cost: 7000 },
//       { name: "Bánh Bao Trứng Cút", category: "Ăn vặt", basePrice: 15000, cost: 8000 },
//       { name: "Cà Phê Sữa Đá", category: "Nước uống", basePrice: 20000, cost: 8000 },
//       { name: "Trà Đào Cam Sả", category: "Nước uống", basePrice: 25000, cost: 10000 },
//       { name: "Nước Suối Aquafina", category: "Nước uống", basePrice: 10000, cost: 4000 },
//       { name: "Sữa Đậu Nành", category: "Nước uống", basePrice: 10000, cost: 4500 },
//       { name: "Bánh Flan", category: "Tráng miệng", basePrice: 10000, cost: 4500 },
//       { name: "Chè Khúc Bạch", category: "Tráng miệng", basePrice: 25000, cost: 12000 }
//     ];

//     const foodItemsMap = {};
//     for (const item of defaultFoodItems) {
//       let existingFood = await FoodItem.findOne({ name: item.name }).collation({ locale: "vi", strength: 2 });
//       if (!existingFood) {
//         existingFood = await FoodItem.create({
//           name: item.name,
//           categoryId: categoriesMap[item.category],
//           basePrice: item.basePrice,
//           cost: item.cost,
//           description: `Món ăn ${item.name} thơm ngon nóng hổi`,
//           isArchived: false
//         });
//         console.log(`Created Food Item: ${existingFood.name}`);
//       } else {
//         console.log(`Found existing Food Item: ${existingFood.name}`);
//       }
//       foodItemsMap[item.name] = existingFood;
//     }

//     // ==========================================
//     // 3. Sync Scheduled Menus
//     // ==========================================
//     console.log("\n--- Syncing Weekly Scheduled Menus ---");
//     const weeklySchedule = {
//       Monday: [
//         "Cơm Sườn Nướng", "Bún Bò Huế", "Bánh Mì Trứng Ốp La", "Bánh Mì Thịt Nướng",
//         "Cơm Cuộn Rong Biển", "Xúc Xích Đức Nướng", "Sữa Đậu Nành", "Cà Phê Sữa Đá",
//         "Bánh Flan", "Nước Suối Aquafina", "Trà Đào Cam Sả"
//       ],
//       Tuesday: [
//         "Cơm Chiên Dương Châu", "Cơm Thịt Kho Trứng", "Mì Quảng Gà", "Khoai Lang Lắc",
//         "Bánh Bao Trứng Cút", "Chè Khúc Bạch", "Bún Thịt Nướng", "Trà Đào Cam Sả",
//         "Nước Suối Aquafina", "Sữa Đậu Nành", "Cà Phê Sữa Đá"
//       ],
//       Wednesday: [
//         "Cơm Gà Xối Mỡ", "Cơm Sườn Nướng", "Mì Quảng Gà", "Phở Bò Tái",
//         "Bánh Mì Trứng Ốp La", "Xúc Xích Đức Nướng", "Cơm Cuộn Rong Biển",
//         "Nước Suối Aquafina", "Sữa Đậu Nành", "Cà Phê Sữa Đá", "Trà Đào Cam Sả"
//       ],
//       Thursday: [
//         "Cơm Gà Xối Mỡ", "Bún Bò Huế", "Bánh Bao Trứng Cút", "Khoai Lang Lắc",
//         "Sữa Đậu Nành", "Cà Phê Sữa Đá", "Nước Suối Aquafina", "Chè Khúc Bạch",
//         "Trà Đào Cam Sả", "Bánh Mì Thịt Nướng"
//       ],
//       Friday: [
//         "Cơm Chiên Dương Châu", "Cơm Thịt Kho Trứng", "Phở Bò Tái", "Bún Thịt Nướng",
//         "Bánh Mì Xíu Mại", "Cơm Cuộn Rong Biển", "Xúc Xích Đức Nướng", "Nước Suối Aquafina",
//         "Sữa Đậu Nành", "Cà Phê Sữa Đá", "Trà Đào Cam Sả", "Bánh Flan"
//       ],
//       Saturday: [
//         "Cơm Gà Nướng Mật Ong", "Phở Bò Tái", "Bún Bò Huế", "Bánh Mì Xíu Mại",
//         "Cơm Cuộn Rong Biển", "Xúc Xích Đức Nướng", "Nước Suối Aquafina",
//         "Sữa Đậu Nành", "Cà Phê Sữa Đá", "Trà Đào Cam Sả"
//       ],
//       Sunday: [
//         "Cơm Gà Xối Mỡ", "Phở Bò Tái", "Cà Phê Sữa Đá", "Nước Suối Aquafina", "Trà Đào Cam Sả"
//       ]
//     };

//     for (const [day, itemNames] of Object.entries(weeklySchedule)) {
//       const menuItems = itemNames
//         .map(name => foodItemsMap[name])
//         .filter(Boolean)
//         .map(item => ({ foodItemId: item._id }));

//       await ScheduledMenu.findOneAndUpdate(
//         { dayOfWeek: day },
//         {
//           dayOfWeek: day,
//           menuItems,
//           createdBy: adminUser._id,
//         },
//         { upsert: true, new: true }
//       );
//       console.log(`Updated scheduled menu for ${day} with ${menuItems.length} items`);
//     }

//     // ==========================================
//     // 4. Seed Completed Orders (Past 90 Days)
//     // ==========================================
//     console.log("\n--- Checking/Seeding Transactional Order History ---");
//     const orderCount = await Order.countDocuments({});
//     // NOTE: Bỏ chạy phần seed order do hệ thống đã có order thật từ user
//     if (false && orderCount < 100) {
//       console.log(`Only ${orderCount} orders found. Generating ~200 orders for historical sales data...`);
//       const daysOfHistory = 90;
//       const startDate = new Date(TODAY_STR);
//       startDate.setDate(startDate.getDate() - daysOfHistory);

//       const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//       const ordersToInsert = [];
//       let transactionCounter = 1;

//       for (let i = 0; i < daysOfHistory; i++) {
//         const currentDate = new Date(startDate);
//         currentDate.setDate(startDate.getDate() + i);

//         // Skip current date and tomorrow to avoid conflicting with active menus
//         const dateStr = currentDate.toISOString().substring(0, 10);
//         if (dateStr === TODAY_STR || dateStr === TOMORROW_STR) continue;

//         const dayName = dayNames[currentDate.getDay()];
//         const scheduledItems = weeklySchedule[dayName]
//           .map(name => foodItemsMap[name])
//           .filter(Boolean);

//         if (scheduledItems.length === 0) continue;

//         // Generate 2-5 orders per day
//         const dailyOrdersCount = Math.floor(Math.random() * 4) + 2;

//         for (let o = 0; o < dailyOrdersCount; o++) {
//           // Select 1-3 random items from scheduled items
//           const itemsCount = Math.floor(Math.random() * 3) + 1;
//           const shuffled = [...scheduledItems].sort(() => 0.5 - Math.random());
//           const selected = shuffled.slice(0, itemsCount);

//           const orderItems = selected.map(item => {
//             const qty = Math.floor(Math.random() * 3) + 1;
//             return {
//               foodItemId: item._id,
//               name: item.name,
//               unitPrice: item.basePrice,
//               quantity: qty
//             };
//           });

//           const totalAmount = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

//           // Random hours between 8 AM and 7 PM
//           const hour = Math.floor(Math.random() * 12) + 8;
//           const min = Math.floor(Math.random() * 60);
//           const orderTimestamp = new Date(currentDate);
//           orderTimestamp.setHours(hour, min, 0, 0);

//           ordersToInsert.push({
//             orderNumber: `ORD-${dateStr.replace(/-/g, "")}-${String(transactionCounter++).padStart(4, "0")}`,
//             staffId: staffUser._id,
//             items: orderItems,
//             discountAmount: 0,
//             taxAmount: 0,
//             totalAmount,
//             orderStatus: "Completed",
//             orderDate: dateStr,
//             createdAt: orderTimestamp,
//             updatedAt: orderTimestamp
//           });
//         }
//       }

//       await Order.insertMany(ordersToInsert);
//       console.log(`Successfully inserted ${ordersToInsert.length} historical orders.`);
//     } else {
//       console.log(`Found existing ${orderCount} orders. Skipping order generation.`);
//     }

//     // ==========================================
//     // 5. Seed Daily Menus (Today & Tomorrow)
//     // ==========================================
//     console.log("\n--- Seeding Daily Menus ---");

//     // Today's Daily Menu (2026-06-26 - Friday)
//     // We recreate it so it has rich Prepared, Sold, and Remaining amounts
//     const todayFoodItems = weeklySchedule.Friday
//       .map(name => foodItemsMap[name])
//       .filter(Boolean);

//     // Hardcode some realistic quantities to simulate an active canteen
//     // e.g. Sold quantity close to Prepared quantity, leaving small remainings for dynamic pricing
//     const todayItemsPayload = todayFoodItems.map((item, idx) => {
//       // Different levels of remaining stock
//       let prepared = 40 + (idx * 5);
//       let sold = prepared - (3 + (idx % 4)); // leaves between 3 and 6 items
//       if (item.name.includes("Aquafina") || item.name.includes("Sữa Đậu Nành")) {
//         prepared = 80;
//         sold = 72; // leaves 8
//       }
//       return {
//         foodItemId: item._id,
//         originalPrice: item.basePrice,
//         currentPrice: item.basePrice,
//         preparedQuantity: prepared,
//         soldQuantity: sold,
//         remainingQuantity: prepared - sold,
//         status: "Available",
//         priceHistory: []
//       };
//     });

//     await DailyMenu.deleteOne({ date: TODAY_STR });
//     await DailyMenu.create({
//       date: TODAY_STR,
//       isConfigured: true,
//       items: todayItemsPayload,
//       createdBy: managerUser._id
//     });
//     console.log(`Seeded configured Daily Menu for Today (${TODAY_STR}) with ${todayItemsPayload.length} items.`);

//     // Tomorrow's Daily Menu (2026-06-27 - Saturday)
//     // Tomorrow should be configured but with prepared=0, sold=0, remaining=0
//     // so managers can click "Apply" to see it populated from AI recommendations.
//     const tomorrowFoodItems = weeklySchedule.Saturday
//       .map(name => foodItemsMap[name])
//       .filter(Boolean);

//     const tomorrowItemsPayload = tomorrowFoodItems.map(item => ({
//       foodItemId: item._id,
//       originalPrice: item.basePrice,
//       currentPrice: item.basePrice,
//       preparedQuantity: 0,
//       soldQuantity: 0,
//       remainingQuantity: 0,
//       status: "Available",
//       priceHistory: []
//     }));

//     await DailyMenu.deleteOne({ date: TOMORROW_STR });
//     await DailyMenu.create({
//       date: TOMORROW_STR,
//       isConfigured: true,
//       items: tomorrowItemsPayload,
//       createdBy: managerUser._id
//     });
//     console.log(`Seeded initial Daily Menu for Tomorrow (${TOMORROW_STR}) with ${tomorrowItemsPayload.length} items (Prepared set to 0).`);

//     // ==========================================
//     // 6. Seed AI Insights (Today & Tomorrow)
//     // ==========================================
//     console.log("\n--- Seeding AI Insights ---");

//     // Clear existing insights for today & tomorrow
//     const todayStart = new Date(TODAY_STR);
//     todayStart.setUTCHours(0, 0, 0, 0);
//     const todayEnd = new Date(TODAY_STR);
//     todayEnd.setUTCHours(23, 59, 59, 999);

//     const tomorrowStart = new Date(TOMORROW_STR);
//     tomorrowStart.setUTCHours(0, 0, 0, 0);
//     const tomorrowEnd = new Date(TOMORROW_STR);
//     tomorrowEnd.setUTCHours(23, 59, 59, 999);

//     await AiInsight.deleteMany({
//       $or: [
//         { targetDate: { $gte: todayStart, $lte: todayEnd } },
//         { targetDate: { $gte: tomorrowStart, $lte: tomorrowEnd } }
//       ]
//     });

//     // 6A. Seed Today's Insight (2026-06-26)
//     // Includes forecasts (already applied) and pricing recommendations (Pending)
//     const todayForecasts = todayFoodItems.map(item => {
//       // Pick random demand forecast
//       const demand = 35 + Math.floor(Math.random() * 20);
//       const recommended = Math.ceil(demand / 5) * 5; // round up to multiple of 5
//       return {
//         foodItemId: item._id,
//         name: item.name,
//         predictedDemand: demand,
//         recommendedQuantity: recommended,
//         status: "Applied",
//         appliedBy: managerUser._id,
//         appliedAt: new Date(TODAY_STR)
//       };
//     });

//     // Filter items with remaining > 0 for pricing recommendations
//     const todayPricingRecs = [];
//     const todayMenu = await DailyMenu.findOne({ date: TODAY_STR });

//     // Pick 5 menu items to give discounts
//     const discountReasons = [
//       { pct: 20, reason: "Tồn dư nhỏ, sát giờ đóng quầy" },
//       { pct: 30, reason: "Tồn dư vừa, sắp đóng quầy" },
//       { pct: 50, reason: "Tồn dư cao, xả hàng cuối ngày" }
//     ];

//     let recCount = 0;
//     for (const mItem of todayMenu.items) {
//       if (mItem.remainingQuantity > 0 && recCount < 5) {
//         const food = todayFoodItems.find(f => f._id.toString() === mItem.foodItemId.toString());
//         const originalPrice = mItem.originalPrice;
//         const discCfg = discountReasons[recCount % discountReasons.length];
//         const recommendedPrice = originalPrice * (1 - discCfg.pct / 100);

//         todayPricingRecs.push({
//           foodItemId: mItem.foodItemId,
//           name: food.name,
//           currentRemaining: mItem.remainingQuantity,
//           originalPrice,
//           recommendedPrice,
//           recommendedDiscountPercentage: discCfg.pct,
//           reason: discCfg.reason,
//           status: "Pending",
//           appliedBy: null,
//           appliedAt: null
//         });
//         recCount++;
//       }
//     }

//     await AiInsight.create({
//       targetDate: new Date(TODAY_STR),
//       version: 1,
//       forecasts: todayForecasts,
//       pricingRecommendations: todayPricingRecs,
//       generatedAt: new Date(),
//       isActive: true
//     });
//     console.log(`Seeded AI Insight for Today (${TODAY_STR}) with ${todayForecasts.length} forecasts (Applied) and ${todayPricingRecs.length} pricing recommendations (Pending).`);

//     // 6B. Seed Tomorrow's Insight (2026-06-27)
//     // Includes forecasts (Pending) and no pricing recommendations
//     const tomorrowForecasts = tomorrowFoodItems.map(item => {
//       const demand = 40 + Math.floor(Math.random() * 20);
//       const recommended = Math.ceil(demand / 5) * 5;
//       return {
//         foodItemId: item._id,
//         name: item.name,
//         predictedDemand: demand,
//         recommendedQuantity: recommended,
//         status: "Pending",
//         appliedBy: null,
//         appliedAt: null
//       };
//     });

//     await AiInsight.create({
//       targetDate: new Date(TOMORROW_STR),
//       version: 1,
//       forecasts: tomorrowForecasts,
//       pricingRecommendations: [],
//       generatedAt: new Date(),
//       isActive: true
//     });
//     console.log(`Seeded AI Insight for Tomorrow (${TOMORROW_STR}) with ${tomorrowForecasts.length} forecasts (Pending) and 0 pricing recommendations.`);

//     console.log("\n==========================================");
//     console.log("SEEDED ALL AI DATA SUCCESSFULLY!");
//     console.log("==========================================");

//   } catch (error) {
//     console.error("Error seeding AI data:", error);
//   } finally {
//     await mongoose.disconnect();
//     console.log("Database connection closed.");
//   }
// }

// runSeed();
