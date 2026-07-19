import ExcelJS from "exceljs";
import AppError from "../../shared/exceptions/AppError.js";
import Order from "../order/order.model.js";
import { getTodayVNDateString } from "../../shared/helpers/date.helper.js";
import { toStartOfDayVN, toEndOfDayVN } from "../../shared/helpers/analytics.helper.js";

const normalizeFilters = (query) => {
  return {
    status: query.status || undefined, // "All", "Completed", "Cancelled"
    from: query.from || undefined,
    to: query.to || undefined,
  };
};

export const exportOrderReport = async (query = {}) => {
  const filters = normalizeFilters(query);
  
  if (filters.from && filters.to && filters.from > filters.to) {
    throw new AppError("from must be before or equal to to", 400, "VALIDATION_ERROR");
  }

  const match = {};
  if (filters.from || filters.to) {
    match.orderDate = {};
    if (filters.from) match.orderDate.$gte = toStartOfDayVN(filters.from);
    if (filters.to) match.orderDate.$lte = toEndOfDayVN(filters.to);
  }

  if (filters.status && filters.status !== "All") {
    match.orderStatus = filters.status;
  }

  const rows = await Order.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "orderId",
        as: "payments"
      }
    },
    {
      $addFields: {
        payment: { $arrayElemAt: ["$payments", 0] }
      }
    },
    { $sort: { orderDate: -1 } },
    {
      $project: {
        orderNumber: 1,
        orderDate: 1,
        orderStatus: 1,
        totalAmount: 1,
        note: 1,
        "payment.paymentMethod": 1,
        "payment.paymentStatus": 1,
        "payment.transactionCode": 1,
        items: 1
      }
    }
  ]);

  if (rows.length > 10000) {
    throw new AppError("Export too large, please narrow down your filters", 413, "EXPORT_TOO_LARGE");
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SDN System";
  workbook.created = new Date();

  const sheetName = filters.status && filters.status !== "All" ? `Đơn ${filters.status}` : "Tất cả đơn hàng";
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    { header: "Mã đơn hàng", key: "orderNumber", width: 15 },
    { header: "Thời gian tạo", key: "orderDate", width: 25 },
    { header: "Trạng thái đơn", key: "orderStatus", width: 20 },
    { header: "Phương thức thanh toán", key: "paymentMethod", width: 25 },
    { header: "Trạng thái thanh toán", key: "paymentStatus", width: 25 },
    { header: "Mã giao dịch", key: "transactionCode", width: 20 },
    { header: "Số món (Loại)", key: "itemsCount", width: 15 },
    { header: "Tổng tiền (VND)", key: "totalAmount", width: 20 },
    { header: "Ghi chú", key: "note", width: 30 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  rows.forEach((row) => {
    sheet.addRow({
      orderNumber: row.orderNumber,
      orderDate: row.orderDate ? new Date(row.orderDate).toLocaleString('vi-VN') : "N/A",
      orderStatus: row.orderStatus,
      paymentMethod: row.payment?.paymentMethod || "Chưa có",
      paymentStatus: row.payment?.paymentStatus || "Chưa có",
      transactionCode: row.payment?.transactionCode || "",
      itemsCount: row.items ? row.items.length : 0,
      totalAmount: row.totalAmount,
      note: row.note || "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
