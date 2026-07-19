const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? vndFormatter.format(number) : "-";
};

export const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

/**
 * Chuyển chuỗi tiếng Việt có dấu → không dấu (ASCII-safe).
 * Dùng cho hóa đơn in nhiệt không hỗ trợ Unicode.
 */
export const removeAccents = (str) =>
  String(str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

