import { z } from 'zod';
import { DAILY_MENU_ITEM_STATUS } from '../../constants/daily-menu/dailyMenuConstants';

/** Schema for updating a daily menu item (quantity / price / status) */
export const updateItemSchema = z
  .object({
    preparedQuantity: z
      .number({ invalid_type_error: 'SL chuẩn bị phải là số' })
      .int('SL chuẩn bị phải là số nguyên')
      .min(1, 'SL chuẩn bị phải ≥ 1')
      .optional()
      .or(z.literal('')),
    currentPrice: z
      .number({ invalid_type_error: 'Giá phải là số' })
      .positive('Giá phải lớn hơn 0')
      .optional()
      .or(z.literal('')),
    status: z
      .enum(
        [DAILY_MENU_ITEM_STATUS.AVAILABLE, DAILY_MENU_ITEM_STATUS.UNAVAILABLE],
        { errorMap: () => ({ message: 'Trạng thái không hợp lệ' }) },
      )
      .optional(),
    reason: z.string().max(500, 'Lý do tối đa 500 ký tự').optional(),
  })
  .refine(
    (d) =>
      d.preparedQuantity !== undefined ||
      d.currentPrice !== undefined ||
      d.status !== undefined,
    { message: 'Cần nhập ít nhất một trường để cập nhật' },
  );

/** Schema for the generate daily menu date picker */
export const generateMenuSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD')
    .refine(
      (v) => !isNaN(new Date(v).getTime()),
      'Ngày không hợp lệ',
    ),
});
