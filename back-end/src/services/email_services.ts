import transporter from "../config/mail_transport";

export const MailServices = {
  sendAlert: async (toEmail: string, content: string) => {
    try {
      await transporter.sendMail({
        from: '"HomeSmart System" <no-reply@homesmart.com>',
        to: toEmail, 
        subject: "SMART PLANT",
        html: `<h3>${content}</h3>`,
      });
      console.log("✅ Email đã gửi thành công");
    } catch (error) {
      console.error("❌ Gửi email thất bại:", error);
    }
  }
};