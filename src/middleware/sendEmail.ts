import nodemailer from "nodemailer";
import dotenv from "dotenv";

// dotenv.config();
export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vindbaiq@gmail.com",
      pass: "wjmo heav aars pvso",
    },
  });
  await transporter.sendMail({
    from: "vindbaiq@gmail.com",
    to,
    subject,
    text,
  });
};
