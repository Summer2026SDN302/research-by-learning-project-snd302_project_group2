export const formatShortId = (id) => {
  if (!id) return '—';
  return String(id).slice(-6).toUpperCase();
};

export const formatCurrency = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return '—';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(number);
};

export const normalizeFoodItemPayload = (data) => ({
  categoryId: data.categoryId,
  name: data.name.trim(),
  description: data.description?.trim() || undefined,
  basePrice: Number(data.basePrice),
  cost: Number(data.cost),
  isArchived: Boolean(data.isArchived),
});

export const mapApiValidationErrors = (details = []) =>
  details.reduce((accumulator, detail) => {
    const field = detail?.field ?? detail?.path?.[0] ?? detail?.name ?? detail?.key;
    const message = detail?.message ?? 'Dữ liệu không hợp lệ';

    if (field && !accumulator[field]) {
      accumulator[field] = message;
    }

    return accumulator;
  }, {});