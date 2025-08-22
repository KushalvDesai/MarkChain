import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to your preferred email service
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendOTP(email: string, otp: string, studentId: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: email,
        subject: 'MarkChain - Email Verification OTP',
        html: `
          <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">  
  <title>MarkChain OTP Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: #2d89ef;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
      text-align: center;
      color: #333333;
    }
    .content p {
      font-size: 16px;
      margin: 10px 0;
    }
    .otp {
      font-size: 28px;
      font-weight: bold;
      margin: 20px 0;
      color: #000;
    }
    .footer {
      font-size: 13px;
      color: #777;
      text-align: center;
      padding: 15px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      MarkChain OTP Verification
    </div>
    <div class="content">
      <p>Welcome to MarkChain <strong>${studentId}</strong>,</p>
      <p>Your OTP for profile verification is:</p>
      <h2 class="otp">${otp}</h2>
      <p>Please use this OTP to verify your student profile. This OTP will expire in 10 minutes.</p>
    </div>
    <div class="footer">
      made by Kushal Desai &amp; Shrey Lakhtaria
    </div>
  </div>
</body>
</html>

        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return false;
    }
  }

  async verifyEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration verification failed:', error);
      return false;
    }
  }
}