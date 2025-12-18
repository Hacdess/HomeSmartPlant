import transporter from "../config/mail_transport";

export const MailServices = {
  sendAlert: async (toEmail: string, content: string) => {
    try {
      await transporter.sendMail({
        from: '"HomeSmart System" <no-reply@homesmart.com>',
        to: toEmail, 
        subject: "🚨 HOMESMART WARNING",
        html: `<h3>WARNING:</h3><p>${content}</p>`,
      });
      console.log("✅ Email sent successfully");
    } catch (error) {
      console.error("❌ Email sending failed:", error);
    }
  }
};