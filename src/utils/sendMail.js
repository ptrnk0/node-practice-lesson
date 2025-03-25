import nodemailer from "nodemailer";
import { SMTP } from "../constants/index.js";
import { getEnvVar } from "./getEnvVar.js";

const transporter = nodemailer.transporter({
  host: getEnvVar(SMTP.SMTP_HOST),
  port: Number(getEnvVar(SMTP.SMTP_PORT)),
  auth: {
    user: getEnvVar(SMTP.SMTP_USER),
    pass: getEnvVar(SMTP.SMTP_PASSWORD),
  },
});

export async function sendMail(options) {
  return await transporter.sendMail(options);
}
