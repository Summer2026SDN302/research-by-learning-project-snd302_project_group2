export const FORECAST_STATUS = {
  PENDING: "Pending",
  APPLIED: "Applied",
  REJECTED: "Rejected",
};

export const FORECAST_STATUS_VALUES = Object.values(FORECAST_STATUS);

/** Hour (0-23, local canteen time) at which the canteen closes. Used for pricing discount rules. */
export const CANTEEN_CLOSING_HOUR = 21;
