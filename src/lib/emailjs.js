// EmailJS configuration for the contact form.
// NOTE: the public key, service ID and template ID are safe to ship to the
// client — EmailJS authenticates browser sends with the public key by design.
import emailjs from "@emailjs/browser";

export const CONFIG = {
  emailjs: {
    SERVICE_ID: "service_n7bhz2t",
    TEMPLATE_ID: "template_wtvuib8",
    PUBLIC_KEY: "LyvK2fb_NW-Ypj3yJ",
  },
};

// Sends the contact message from the browser via EmailJS.
export async function sendContactEmail({ name, email, subject, message }) {
  const response = await emailjs.send(
    CONFIG.emailjs.SERVICE_ID,
    CONFIG.emailjs.TEMPLATE_ID,
    {
      name,
      email,
      reply_to: email,
      subject,
      message,
      time: new Date().toLocaleString(),
    },
    { publicKey: CONFIG.emailjs.PUBLIC_KEY }
  );

  if (!response || response.status !== 200) {
    throw new Error("EmailJS failed");
  }

  return true;
}
