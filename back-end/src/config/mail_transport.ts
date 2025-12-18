import { config } from './config';
import nodemailer from 'nodemailer'

// 1. Khởi tạo Transporter
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST, // smtp.gmail.com
  port: config.SMTP_PORT, // 465
  secure: true, // true cho port 465, false cho port 587
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS, // Mật khẩu ứng dụng 16 ký tự
  },
});

export default transporter;