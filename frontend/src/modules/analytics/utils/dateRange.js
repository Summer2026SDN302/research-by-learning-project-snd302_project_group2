import dayjs from "dayjs";

import { DATE_PRESETS } from "../constants/analyticsConstants";

export const getDateRangeFromPreset = (preset) => {
  const today = dayjs();

  if (preset === DATE_PRESETS.TODAY) {
    const value = today.format("YYYY-MM-DD");
    return { from: value, to: value };
  }

  if (preset === DATE_PRESETS.LAST_7_DAYS) {
    return {
      from: today.subtract(6, "day").format("YYYY-MM-DD"),
      to: today.format("YYYY-MM-DD"),
    };
  }

  if (preset === DATE_PRESETS.THIS_MONTH) {
    return {
      from: today.startOf("month").format("YYYY-MM-DD"),
      to: today.format("YYYY-MM-DD"),
    };
  }

  return { from: "", to: "" };
};
