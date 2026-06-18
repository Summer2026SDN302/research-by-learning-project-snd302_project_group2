import { z } from 'zod';

const requiredMoney = (message) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return Number.NaN;
      return value;
    },
    z.number({ invalid_type_error: message }).min(0, message),
  );

export const foodItemFormSchema = z.object({
  categoryId: z.string().min(1, 'Chọn danh mục'),
  name: z
    .string()
    .trim()
    .min(1, 'Tên món cần ít nhất 1 ký tự')
    .max(150, 'Tên món không được vượt quá 150 ký tự'),
  description: z
    .string()
    .trim()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .optional()
    .or(z.literal('')),
  basePrice: requiredMoney('Giá bán không hợp lệ'),
  cost: requiredMoney('Giá vốn không hợp lệ'),
});