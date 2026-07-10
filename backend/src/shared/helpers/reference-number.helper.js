import crypto from "crypto";

const padTwoDigits = (value) => String(value).padStart(2, "0");
const padThreeDigits = (value) => String(value).padStart(3, "0");

export const generateReferenceNumber = (prefix, date = new Date()) => {
  const datePart = [
    date.getUTCFullYear(),
    padTwoDigits(date.getUTCMonth() + 1),
    padTwoDigits(date.getUTCDate()),
  ].join("");
  const timePart = [
    padTwoDigits(date.getUTCHours()),
    padTwoDigits(date.getUTCMinutes()),
    padTwoDigits(date.getUTCSeconds()),
    padThreeDigits(date.getUTCMilliseconds()),
  ].join("");
  const entropy = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `${prefix}-${datePart}-${timePart}${entropy}`;
};
