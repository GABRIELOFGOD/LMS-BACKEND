import { Injectable } from '@nestjs/common';
import * as nodemailer from "nodemailer";
import { otpHtml } from 'src/core/data/mailHtmls';


@Injectable()
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
  
    async sendOtp(otp: string, to: string) {
      const html = otpHtml(otp);
  
      await this.transporter.sendMail({
        from: process.env.EMAIL_SERVICE,
        to,
        subject: "Your OTP Code",
        html,
      });
    }
    
}
