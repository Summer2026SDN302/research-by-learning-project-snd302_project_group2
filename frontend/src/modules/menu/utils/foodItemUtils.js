export const normalizeFoodItemPayload = (data) => ({
  categoryId: data.categoryId,
  name: data.name.trim(),
  description: data.description?.trim() || undefined,
  basePrice: Number(data.basePrice),
  cost: Number(data.cost),
});

export const mapApiValidationErrors = (details = []) =>
  details.reduce((accumulator, detail) => {
    const field =
      detail?.field ?? detail?.path?.[0] ?? detail?.name ?? detail?.key;
    const message = detail?.message ?? "Dữ liệu không hợp lệ";

    if (field && !accumulator[field]) {
      accumulator[field] = message;
    }

    return accumulator;
  }, {});
