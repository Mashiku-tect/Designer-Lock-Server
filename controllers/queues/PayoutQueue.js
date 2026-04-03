const { Queue } = require("bullmq");

const payoutQueue = new Queue("payouts", {
  connection: {
    host: "127.0.0.1",
    port: 6379
  },
  prefix:"designerlock",
  defaultJobOptions: {
    attempts: 20,
    backoff: {
      type: "exponential",
      delay: 60_000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

module.exports = payoutQueue;
