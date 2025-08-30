import nodemailer from "nodemailer";
import User from "../models/User.js";

export const sendEmail = async (userIdOrEmail, subject, text) => {
  try {
    let to = userIdOrEmail;
    if (!String(userIdOrEmail).includes("@")) {
      const user = await User.findById(userIdOrEmail).lean();
      if (!user) return;
      to = user.email;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS   
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
  } catch (err) {
    console.error("sendEmail error:", err.message);
  }
};
