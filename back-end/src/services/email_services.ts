import transporter from "../config/mail_transport";

export const MailServices = {
  sendAlert: async (toEmail: string, content: string) => {
    try {
      await transporter.sendMail({
        from: '"HomeSmart System" <no-reply@homesmart.com>',
        to: toEmail, 
        subject: "🚨 SMART PLANT",
        html: `<h3>${content}</h3>`,
      });
      console.log("✅ Email sent successfully");
    } catch (error) {
      console.error("❌ Email sending failed:", error);
    }
  }
};