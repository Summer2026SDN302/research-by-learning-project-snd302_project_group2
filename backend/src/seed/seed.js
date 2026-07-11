/**
 * StallBox — Mock Data Seeder
 * --------------------------------------------------------------------------
 * Tạo dữ liệu mẫu để demo/chụp màn hình 2 feature:
 *   1. Scheduled Menu (Thực đơn theo lịch)
 *   2. Notification (Thông báo)
 *
 * Đồng thời tạo các dữ liệu phụ thuộc (Users, Categories, Food Items,
 * Daily Menu, Orders) để các màn hình có thể hiển thị đầy đủ.
 *
 * CÁCH CHẠY:
 *   npm run seed            -> seed thêm (xoá sạch các collection bị seed rồi tạo lại)
 *   npm run seed -- --keep  -> giữ dữ liệu cũ, chỉ upsert user + thêm mới phần còn lại
 *
 * LƯU Ý: Script này GHI vào database thật cấu hình trong .env (MONGODB_URI).
 *        Mặc định sẽ XOÁ các collection: categories, fooditems, scheduledmenus,
 *        dailymenus, orders, notifications (KHÔNG xoá users — chỉ upsert).
 */
import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../config/database.js";
import { hashPassword } from "../shared/helpers/password.helper.js";

import User from "../modules/user/user.model.js";
import Category from "../modules/menu/category/category.model.js";
import FoodItem from "../modules/menu/food_item/food_item.model.js";
import ScheduledMenu from "../modules/menu/scheduled_menu/scheduled_menu.model.js";
import DailyMenu from "../modules/menu/daily-menu/daily-menu.model.js";
import Order from "../modules/order/order.model.js";
import Notification from "../modules/notification/notification.model.js";

import { USER_ROLES } from "../modules/user/user.constants.js";
import { NOTIFICATION_TYPES } from "../modules/notification/notification.constants.js";
import { DAY_OF_WEEK } from "../modules/menu/scheduled_menu/scheduled_menu.constants.js";

const KEEP = process.argv.includes("--keep");

/** Ngày hôm nay theo giờ Việt Nam, định dạng YYYY-MM-DD (dùng cho DailyMenu.date) */
const todayVNDateString = () => {
  const now = new Date();
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const yyyy = vn.getUTCFullYear();
  const mm = String(vn.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(vn.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000);

/* -------------------------------------------------------------------------- */
/* 1. USERS                                                                    */
/* -------------------------------------------------------------------------- */
async function seedUsers() {
  const password = await hashPassword("Stallbox@123");

  const userDefs = [
    {
      username: "admin",
      fullName: "Nguyễn Văn Admin",
      email: "admin@stallbox.com",
      phone: "0900000001",
      role: USER_ROLES.ADMIN,
      isActive: true,
    },
    {
      username: "manager",
      fullName: "Trần Thị Quản Lý",
      email: "manager@stallbox.com",
      phone: "0900000002",
      role: USER_ROLES.MANAGER,
      isActive: true,
    },
    {
      username: "staff01",
      fullName: "Lê Văn Nhân Viên",
      email: "staff01@stallbox.com",
      phone: "0900000003",
      role: USER_ROLES.STAFF,
      isActive: true,
    },
    {
      username: "staff02",
      fullName: "Phạm Thị Thu Ngân",
      email: "staff02@stallbox.com",
      phone: "0900000004",
      role: USER_ROLES.STAFF,
      isActive: true,
    },
    {
      username: "manager_off",
      fullName: "Hoàng Văn Nghỉ Việc",
      email: "manager_off@stallbox.com",
      phone: "0900000005",
      role: USER_ROLES.MANAGER,
      isActive: false, // tài khoản bị khoá -> KHÔNG nhận notification
    },
  ];

  const users = {};
  for (const def of userDefs) {
    let user = await User.findOne({
      $or: [{ username: def.username }, { email: def.email }],
    });

    if (user) {
      Object.assign(user, def, { passwordHash: password });
      await user.save();
    } else {
      user = await User.create({ ...def, passwordHash: password });
    }

    users[def.username] = user;
  }

  console.log(`✓ Users: ${Object.keys(users).length} (upsert theo username/email)`);
  return users;
}

/* -------------------------------------------------------------------------- */
/* 2. CATEGORIES                                                               */
/* -------------------------------------------------------------------------- */
async function seedCategories() {
  const defs = [
    { name: "Món chính", icon: "lunch_dining", description: "Các món ăn no" },
    { name: "Món nước", icon: "ramen_dining", description: "Phở, bún, mì..." },
    { name: "Đồ uống", icon: "local_cafe", description: "Nước giải khát" },
    { name: "Tráng miệng", icon: "icecream", description: "Chè, bánh ngọt" },
  ];

  const categories = {};
  for (const def of defs) {
    const cat = await Category.create(def);
    categories[def.name] = cat;
  }

  console.log(`✓ Categories: ${defs.length}`);
  return categories;
}

/* -------------------------------------------------------------------------- */
/* 3. FOOD ITEMS                                                               */
/* -------------------------------------------------------------------------- */
async function seedFoodItems(categories) {
  const defs = [
    { name: "Phở bò", cat: "Món nước", basePrice: 45000, cost: 25000 },
    { name: "Bún bò Huế", cat: "Món nước", basePrice: 48000, cost: 27000 },
    { name: "Mì Quảng", cat: "Món nước", basePrice: 42000, cost: 23000 },
    { name: "Cơm gà", cat: "Món chính", basePrice: 40000, cost: 22000 },
    { name: "Cơm sườn", cat: "Món chính", basePrice: 38000, cost: 21000 },
    { name: "Cơm tấm bì chả", cat: "Món chính", basePrice: 35000, cost: 19000 },
    { name: "Trà đá", cat: "Đồ uống", basePrice: 5000, cost: 1000 },
    { name: "Cà phê sữa", cat: "Đồ uống", basePrice: 20000, cost: 8000 },
    { name: "Nước cam", cat: "Đồ uống", basePrice: 25000, cost: 10000 },
    { name: "Chè đậu xanh", cat: "Tráng miệng", basePrice: 15000, cost: 6000 },
    { name: "Bánh flan", cat: "Tráng miệng", basePrice: 12000, cost: 5000 },
  ];

  const foods = {};
  for (const def of defs) {
    const food = await FoodItem.create({
      name: def.name,
      categoryId: categories[def.cat]._id,
      basePrice: def.basePrice,
      cost: def.cost,
      description: `${def.name} - món ăn mẫu`,
      isArchived: false,
    });
    foods[def.name] = food;
  }

  console.log(`✓ Food items: ${defs.length}`);
  return foods;
}

/* -------------------------------------------------------------------------- */
/* 4. SCHEDULED MENU (7 ngày trong tuần)                                       */
/* -------------------------------------------------------------------------- */
async function seedScheduledMenu(foods, users) {
  const f = (name) => ({ foodItemId: foods[name]._id });

  const weekly = {
    Monday: ["Phở bò", "Cơm gà", "Trà đá", "Chè đậu xanh"],
    Tuesday: ["Bún bò Huế", "Cơm sườn", "Cà phê sữa"],
    Wednesday: ["Mì Quảng", "Cơm tấm bì chả", "Nước cam", "Bánh flan"],
    Thursday: ["Phở bò", "Cơm gà", "Cơm sườn", "Trà đá"],
    Friday: ["Bún bò Huế", "Cơm tấm bì chả", "Cà phê sữa", "Chè đậu xanh"],
    Saturday: ["Mì Quảng", "Cơm gà", "Nước cam"],
    Sunday: [], // ngày trống -> minh hoạ EmptyState "Chưa có món"
  };

  let count = 0;
  for (const day of DAY_OF_WEEK) {
    const items = weekly[day] || [];
    if (items.length === 0 && day === "Sunday") {
      // Cố tình bỏ trống Sunday (không tạo document) để demo fallback DTO
      continue;
    }
    await ScheduledMenu.create({
      dayOfWeek: day,
      menuItems: items.map(f),
      createdBy: users.admin._id,
      updatedBy: users.admin._id,
    });
    count += 1;
  }

  console.log(`✓ Scheduled menu: ${count} ngày (Sunday để trống)`);
}

/* -------------------------------------------------------------------------- */
/* 5. DAILY MENU (hôm nay) — có item sắp hết hàng + chưa cấu hình xong         */
/* -------------------------------------------------------------------------- */
async function seedDailyMenu(foods, users) {
  const date = todayVNDateString();

  const mkItem = (name, prepared, sold, status = "Available") => {
    const price = foods[name].basePrice;
    return {
      foodItemId: foods[name]._id,
      originalPrice: price,
      currentPrice: price,
      preparedQuantity: prepared,
      soldQuantity: sold,
      remainingQuantity: prepared - sold,
      status,
      priceHistory: [],
    };
  };

  await DailyMenu.create({
    date,
    isConfigured: false, // chưa công bố -> kích hoạt Menu Reminder
    createdBy: users.admin._id,
    items: [
      mkItem("Phở bò", 50, 48), // còn 2 -> Low Stock
      mkItem("Cơm gà", 40, 38), // còn 2 -> Low Stock
      mkItem("Bún bò Huế", 30, 10), // còn 20 -> bình thường
      mkItem("Trà đá", 100, 35),
      mkItem("Cà phê sữa", 25, 25, "Unavailable"), // hết, đánh dấu Unavailable
    ],
  });

  console.log(`✓ Daily menu: ngày ${date} (isConfigured=false, 2 món Low Stock)`);
  return date;
}

/* -------------------------------------------------------------------------- */
/* 6. ORDERS                                                                   */
/* -------------------------------------------------------------------------- */
async function seedOrders(foods, users) {
  const TAX = 0.08;
  const mkOrder = (orderNumber, staff, lines, status, minsAgo) => {
    const items = lines.map(([name, qty]) => {
      const unitPrice = foods[name].basePrice;
      return {
        foodItemId: foods[name]._id,
        name,
        unitPrice,
        quantity: qty,
        lineTotal: unitPrice * qty,
      };
    });
    const subTotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const taxAmount = Math.round(subTotal * TAX);
    return {
      orderNumber,
      staffId: staff._id,
      items,
      subTotal,
      discountAmount: 0,
      taxAmount,
      totalAmount: subTotal + taxAmount,
      orderStatus: status,
      orderDate: minutesAgo(minsAgo),
    };
  };

  const orders = [
    mkOrder("ORD-1001", users.staff01, [["Phở bò", 2], ["Trà đá", 2]], "Completed", 180),
    mkOrder("ORD-1002", users.staff01, [["Cơm gà", 1], ["Cà phê sữa", 1]], "Confirmed", 90),
    mkOrder("ORD-1003", users.staff02, [["Bún bò Huế", 3]], "Pending", 30),
    mkOrder("ORD-1004", users.staff02, [["Cơm sườn", 2], ["Nước cam", 2]], "Cancelled", 200),
  ];

  await Order.insertMany(orders);
  console.log(`✓ Orders: ${orders.length}`);
}

/* -------------------------------------------------------------------------- */
/* 7. NOTIFICATIONS                                                            */
/* -------------------------------------------------------------------------- */
async function seedNotifications(users, foods, menuDate) {
  // Người nhận: Admin + Manager (active). Mỗi notification 1 bản ghi / user.
  const recipients = [users.admin, users.manager];
  const docs = [];

  const push = (type, title, content, dedupSuffix, isRead, minsAgo, metadata = {}) => {
    recipients.forEach((u) => {
      docs.push({
        userId: u._id,
        title,
        content,
        type,
        isRead,
        createdAt: minutesAgo(minsAgo),
        metadata: {
          dedupKey: `${dedupSuffix}:${u._id}`,
          actionType: metadata.actionType || null,
          actionPayload: metadata.actionPayload || null,
        },
      });
    });
  };

  // System_Log - Low Stock
  push(
    NOTIFICATION_TYPES.SYSTEM_LOG,
    "Sắp hết hàng",
    "Phở bò còn 2 phần.",
    `low_stock:${menuDate}:${foods["Phở bò"]._id}:bucket`,
    false,
    5,
  );
  push(
    NOTIFICATION_TYPES.SYSTEM_LOG,
    "Sắp hết hàng",
    "Cơm gà còn 2 phần.",
    `low_stock:${menuDate}:${foods["Cơm gà"]._id}:bucket`,
    false,
    12,
  );

  // System_Log - Menu Reminder
  push(
    NOTIFICATION_TYPES.SYSTEM_LOG,
    "Nhắc nhở thực đơn",
    `Thực đơn ngày ${menuDate} chưa được công bố.`,
    `menu_reminder:${menuDate}:06:00`,
    false,
    45,
  );

  // Order_Update
  push(
    NOTIFICATION_TYPES.ORDER_UPDATE,
    "Cập nhật đơn hàng",
    "Đơn #ORD-1001 đã chuyển sang trạng thái: Completed.",
    "order_status:ORD-1001:Completed",
    true,
    120,
  );
  push(
    NOTIFICATION_TYPES.ORDER_UPDATE,
    "Cập nhật đơn hàng",
    "Đơn #ORD-1004 đã chuyển sang trạng thái: Cancelled.",
    "order_status:ORD-1004:Cancelled",
    true,
    200,
  );

  // AI_Alert
  push(
    NOTIFICATION_TYPES.AI_ALERT,
    "Đề xuất từ AI",
    "AI đề xuất chuẩn bị 60 phần Phở bò cho ngày mai.",
    `ai_quantity:${menuDate}:${foods["Phở bò"]._id}`,
    false,
    20,
  );
  push(
    NOTIFICATION_TYPES.AI_ALERT,
    "Đề xuất từ AI",
    "AI đề xuất giảm giá Bún bò Huế 15% từ 14:00.",
    `ai_price:${menuDate}:${foods["Bún bò Huế"]._id}`,
    true,
    300,
  );

  await Notification.insertMany(docs);
  console.log(
    `✓ Notifications: ${docs.length} bản ghi (cho Admin + Manager, đủ 3 loại, có cả đọc/chưa đọc)`,
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN                                                                        */
/* -------------------------------------------------------------------------- */
async function clearCollections() {
  await Promise.all([
    Category.deleteMany({}),
    FoodItem.deleteMany({}),
    ScheduledMenu.deleteMany({}),
    DailyMenu.deleteMany({}),
    Order.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log("✓ Đã xoá sạch: categories, fooditems, scheduledmenus, dailymenus, orders, notifications");
}

async function main() {
  console.log("=== StallBox Mock Data Seeder ===");
  await connectDB();

  try {
    if (!KEEP) {
      await clearCollections();
    } else {
      console.log("⚠ Chế độ --keep: giữ dữ liệu cũ, có thể gây trùng key.");
    }

    const users = await seedUsers();
    const categories = await seedCategories();
    const foods = await seedFoodItems(categories);
    await seedScheduledMenu(foods, users);
    const menuDate = await seedDailyMenu(foods, users);
    await seedOrders(foods, users);
    await seedNotifications(users, foods, menuDate);

    console.log("\n=== HOÀN TẤT ===");
    console.log("Tài khoản đăng nhập (mật khẩu chung: Stallbox@123):");
    console.log("  - admin@stallbox.com        (Admin)");
    console.log("  - manager@stallbox.com      (Manager)");
    console.log("  - staff01@stallbox.com      (Staff)");
    console.log("  - staff02@stallbox.com      (Staff)");
    console.log("  - manager_off@stallbox.com  (Manager - INACTIVE, để test)");
  } catch (error) {
    console.error("✗ Seed thất bại:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("Đã đóng kết nối MongoDB.");
  }
}

main();
