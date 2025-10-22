import { Injectable } from '@nestjs/common';
import * as nodemailer from "nodemailer";
import { otpHtml } from 'src/core/data/mailHtmls';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,          // e.g. mail.thebrainbuilders.org
      port: Number(process.env.SMTP_PORT),  // 465 or 587
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendOtp(otp: string, to: string) {
    const html = otpHtml(otp);

    return this.transporter.sendMail({
      from: `"Fact-check Africa Learning Hub" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: "Your OTP Code",
      html,
    });
  }

  async forgotPassword(link: string, to: string) {
    const html = `
      <p>You requested to reset your password.<br/>
      Click the link below to reset:</p>
      <a href="${link}" target="_blank">Reset Password</a>
    `;

    return this.transporter.sendMail({
      from: `"Fact-check Africa Learning Hub" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: "Password Reset Request",
      html,
    });
  }
}