import nodemailer from "nodemailer";
import logger from "./logger.js";

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

export const sendContactEmail = async (contactData) => {
  const { name, email, message } = contactData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_EMAIL,
    subject: `Portfolio Contact: Message from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;">
              <strong style="color: #555;">From:</strong> ${name}
            </p>
            <p style="margin: 10px 0;">
              <strong style="color: #555;">Email:</strong> <a href="mailto:${email}">${email}</a>
            </p>
          </div>

          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong style="color: #555;">Message:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; border-radius: 4px;">
              <p style="margin: 0; color: #333; line-height: 1.6;">${message}</p>
            </div>
          </div>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              Sent from your portfolio contact form at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `,
    replyTo: email,
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully with ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email Error Details:", error.message);
    console.error("Error Code:", error.code);
    logger.error("Failed to send email", error);
    return { success: false, error: error.message };
  }
};

export default sendContactEmail;
