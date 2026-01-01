import emailjs from "@emailjs/browser";

const SERVICE_ID = "YOUR_SERVICE_ID";
const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

/**
 * Reusable email sender
 */
export const sendEmail = async ({
  toEmail,
  toName,
  subject,
  message,
}) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name: toName,
        subject,
        message,
      },
      PUBLIC_KEY
    );

    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("EmailJS error:", error);
    return false;
  }
};

