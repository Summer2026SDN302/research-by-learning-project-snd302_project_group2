import nodemailer from "nodemailer";
import AppError from "../exceptions/AppError.js";

const requiredEnv = (key) => {
  const value = process.env[key];

  if (!value || String(value).trim().length === 0) {
    throw new AppError(
      `Missing ${key} in environment variables`,
      500,
      "SERVER_CONFIGURATION_ERROR",
    );
  }

  return value;
};

const createTransporter = () => {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");
  const secure = String(process.env.SMTP_SECURE || "false") === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const getMailFrom = () => {
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.MAIL_FROM_NAME || "StallBox";

  if (!fromEmail) {
    throw new AppError(
      "Missing MAIL_FROM_EMAIL or SMTP_USER in environment variables",
      500,
      "SERVER_CONFIGURATION_ERROR",
    );
  }

  return `"${fromName}" <${fromEmail}>`;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: getMailFrom(),
    to,
    subject,
    text,
    html,
  });
};