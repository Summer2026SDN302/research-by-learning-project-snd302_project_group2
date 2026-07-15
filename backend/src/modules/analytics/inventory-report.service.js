import ExcelJS from "exceljs";
import AppError from "../../shared/exceptions/AppError.js";
import { getMenuByDate } from "../menu/daily-menu/daily-menu.service.js";

export const exportInventoryReport = async (date, type) => {
  let menu;
  try {
    menu = await getMenuByDate(date);
  } catch (err) {
    if (err.code === "DAILY_MENU_NOT_FOUND") {
      throw new AppError("No inventory data found for the selected date", 404, "INVENTORY_NOT_FOUND");
    }
    throw err;
  }
  
  if (!menu || !menu.items || menu.items.length === 0) {
    throw new AppError("No inventory data found for the selected date", 404, "INVENTORY_NOT_FOUND");
  }

  let items = menu.items;

  if (type === "low-stock") {
    items = items.filter(item => item.remainingQuantity <= 3);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SDN System";
  workbook.created = new Date();

  let sheetName = "Báo cáo tồn kho";
  if (type === "low-stock") sheetName = "Sắp hết hàng";
  else if (type === "movement") sheetName = "Lịch sử luân chuyển";

  const sheet = workbook.addWorksheet(sheetName);

  if (type === "movement") {
    sheet.columns = [
      { header: "Tên món", key: "name", width: 35 },
      { header: "Đã chuẩn bị (Nhập)", key: "preparedQuantity", width: 20 },
      { header: "Đã bán (Xuất)", key: "soldQuantity", width: 20 },
    ];
  } else {
    sheet.columns = [
      { header: "Tên món", key: "name", width: 35 },
      { header: "Danh mục", key: "category", width: 20 },
      { header: "Đã chuẩn bị", key: "preparedQuantity", width: 15 },
      { header: "Đã bán", key: "soldQuantity", width: 15 },
      { header: "Tồn kho", key: "remainingQuantity", width: 15 },
      { header: "Trạng thái", key: "status", width: 15 },
    ];
  }

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  items.forEach(item => {
    const rowData = {
      name: item.foodItemId?.name || "N/A",
      category: item.foodItemId?.categoryId?.name || "N/A",
      preparedQuantity: item.preparedQuantity,
      soldQuantity: item.soldQuantity,
      remainingQuantity: item.remainingQuantity,
      status: item.status === "Available" ? "Đang bán" : "Ngưng bán",
    };
    sheet.addRow(rowData);
  });

  return await workbook.xlsx.writeBuffer();
};
