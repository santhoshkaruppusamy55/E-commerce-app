const { Worker } = require("bullmq");
const transporter = require("../config/mail.config");
const config = require("../config/queue.config");
const renderTemplate = require("../utils/renderEmailTemplate");

if (process.env.NODE_ENV !== "test") {
new Worker(
  "email-queue",
  async job => {
    console.log("Processing email job:", job.data.type);
    const { type, to, payload } = job.data;

    let subject;
    let html;

    switch (type) {
      case "welcome":
        subject = "Welcome to our platform";
        html = await renderTemplate("welcome", payload);
        break;

      case "reset-password":
        subject = "Reset your password";
        html = await renderTemplate("resetPassword", payload);
        break;

      case "order-confirmation":
        subject = "Order confirmation";
        html = await renderTemplate("orderConfirmation", payload);
        break;

      default:
        throw new Error("Unknown email type");
    }

    await transporter.sendMail({
      from: 'example@gmail.com',
      to,
      subject,
      html
    });
  },
  { connection: config.connection }
)
};
