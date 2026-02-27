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
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarkChain - Student Verification</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 20px;
        min-height: 100vh;
      }
      
      .email-wrapper {
        max-width: 650px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        overflow: hidden;
        position: relative;
      }
      
      .header {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: #ffffff;
        padding: 40px 30px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.08)"/></svg>');
        animation: float 6s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      .logo {
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 8px;
        letter-spacing: -1px;
        position: relative;
        z-index: 1;
      }
      
      .logo::after {
        content: '⛓️';
        margin-left: 8px;
        font-size: 28px;
      }
      
      .header-subtitle {
        font-size: 16px;
        opacity: 0.9;
        font-weight: 400;
        position: relative;
        z-index: 1;
      }
      
      .content {
        padding: 50px 40px;
        text-align: center;
        background: #ffffff;
      }
      
      .verification-badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 30px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .greeting {
        font-size: 24px;
        color: #2c3e50;
        margin-bottom: 20px;
        font-weight: 600;
      }
      
      .student-id {
        color: #3498db;
        font-weight: 700;
        background: rgba(52, 152, 219, 0.1);
        padding: 4px 12px;
        border-radius: 6px;
        display: inline-block;
      }
      
      .message {
        font-size: 16px;
        color: #5a6c7d;
        margin: 25px 0;
        line-height: 1.6;
      }
      
      .otp-container {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 16px;
        padding: 35px;
        margin: 35px 0;
        border: 2px dashed #3498db;
        position: relative;
      }
      
      .otp-label {
        font-size: 14px;
        color: #7f8c8d;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 15px;
        font-weight: 600;
      }
      
      .otp-code {
        font-size: 36px;
        font-weight: 800;
        color: #2c3e50;
        letter-spacing: 8px;
        font-family: 'Courier New', monospace;
        background: #ffffff;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        margin: 15px 0;
        display: inline-block;
        border: 2px solid #e3f2fd;
      }
      
      .timer-info {
        background: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
        padding: 15px 25px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        margin: 25px 0;
        border-left: 4px solid #e74c3c;
      }
      
      .security-note {
        background: rgba(46, 204, 113, 0.1);
        color: #27ae60;
        padding: 20px;
        border-radius: 12px;
        font-size: 14px;
        margin: 30px 0;
        border-left: 4px solid #27ae60;
        text-align: left;
      }
      
      .security-note strong {
        display: block;
        margin-bottom: 8px;
        font-size: 16px;
      }
      
      .footer {
        background: #f8f9fa;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e9ecef;
      }
      
      .company-info {
        font-size: 16px;
        color: #2c3e50;
        margin-bottom: 15px;
        font-weight: 600;
      }
      
      .developers {
        font-size: 14px;
        color: #7f8c8d;
        margin-bottom: 20px;
      }
      
      .copyright {
        font-size: 12px;
        color: #95a5a6;
        margin-top: 15px;
      }
      
      .divider {
        height: 2px;
        background: linear-gradient(90deg, transparent 0%, #3498db 50%, transparent 100%);
        margin: 20px 0;
      }
      
      @media only screen and (max-width: 600px) {
        .email-wrapper {
          margin: 10px;
          border-radius: 12px;
        }
        
        .content {
          padding: 30px 25px;
        }
        
        .otp-code {
          font-size: 28px;
          letter-spacing: 4px;
          padding: 15px 20px;
        }
        
        .greeting {
          font-size: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="header">
        <div class="logo">MarkChain</div>
        <div class="header-subtitle">Blockchain-Powered Academic Credentials</div>
      </div>
      
      <div class="content">
        <div class="verification-badge">🔐 Student Verification</div>
        
        <div class="greeting">
          Welcome, <span class="student-id">${studentId}</span>!
        </div>
        
        <div class="message">
          You're one step away from securing your academic profile on the blockchain. 
          Please use the verification code below to complete your registration.
        </div>
        
        <div class="otp-container">
          <div class="otp-label">Your Verification Code</div>
          <div class="otp-code">${otp}</div>
        </div>
        
        <div class="timer-info">
          ⏱️ This code expires in 10 minutes for security purposes
        </div>
        
        <div class="security-note">
          <strong>🛡️ Security Notice:</strong>
          This code is unique to your CHARUSAT email address. Never share this code with anyone. 
          MarkChain will never ask for your verification code via phone or unofficial channels.
        </div>
        
        <div class="divider"></div>
        
        <div style="font-size: 14px; color: #7f8c8d;">
          If you didn't request this verification, please ignore this email or contact our support team.
        </div>
      </div>
      
      <div class="footer">
        <div class="company-info">MarkChain</div>
        <div class="developers">
          Developed by <strong>Kushal Desai</strong> & <strong>Shrey Lakhtaria</strong>
        </div>
        <div class="divider"></div>
        <div class="copyright">
          © 2025 MarkChain. Securing Academic Excellence on Blockchain.<br>
          CHARUSAT University - Computer Science & Engineering
        </div>
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