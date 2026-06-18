import { z } from "zod";
import { CATEGORY_ICONS } from "../constants/categoryConstants";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(100, "Tên danh mục không được vượt quá 100 ký tự"),
  description: z
    .string()
    .trim()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  icon: z
    .string()
    .refine((val) => CATEGORY_ICONS.includes(val), {
      message: "Biểu tượng không hợp lệ",
    })
    .optional(),
});
