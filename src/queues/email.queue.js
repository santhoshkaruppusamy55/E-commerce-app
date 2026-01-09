const { Queue } = require("bullmq");
const config = require("../config/queue.config");

const emailQueue = new Queue("email-queue", {
  connection: config.connection
});

module.exports = emailQueue;
