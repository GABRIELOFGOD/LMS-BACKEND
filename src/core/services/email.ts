import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor(){
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVICE,
        pass: process.env.GOOGLE_EMAIL_AUTH
      }
    });
  }

  async sendOtp(otp: number, to: string) {
    const htmlPath = path.resolve(__dirname, "../data/otp.html");
    let html = fs.readFileSync(htmlPath, "utf-8");
    html = html.replace("{{OTP}}", otp.toString());

    await this.transporter.sendMail({
      from: process.env.EMAIL_SERVICE,
      to,
      subject: "Your OTP Code",
      html,
    });
  }
  
}