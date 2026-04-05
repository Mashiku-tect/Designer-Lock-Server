require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });


const { Worker } = require("bullmq");
const axios = require("axios");
const { Payout } = require("../../models");
const ClickPesaPaymentClient = require("../services/ClickPesaClient");
const { getPlatformBalance } = require("../services/ClickPesaBalance");

const client = new ClickPesaPaymentClient({
  apiKey: process.env.CLICKPESA_API_KEY,
  clientId: process.env.CLICKPESA_CLIENT_ID
});

const payoutWorker = new Worker(
  "payouts",
  async (job) => {
    try {
      const { payoutData } = job.data;
      console.log("Starting payout job for:", payoutData.OrderReference);

      // Don't process already completed payouts
      const existingPayout = await Payout.findOne({
        where: { id: payoutData.PayoutId }
      });

      if (existingPayout?.status === "SUCCESS") {
        console.log(
          `Payout already completed. Skipping: ${payoutData.OrderReference}`
        );
        return;
      }

      console.log(
        `Attempt ${job.attemptsMade + 1}/${job.opts.attempts} —`,
        payoutData.OrderReference
      );

      // 1. Check balance
      const balance = await getPlatformBalance();

      if (balance < payoutData.Amount) {
        console.log("Not enough balance, retrying later...");
        throw new Error("INSUFFICIENT_BALANCE"); // ✅ triggers retry
      }

      console.log("Sufficient balance, proceeding with payout...");

      // 2. Execute payout
      const payoutStatus = await client.processMobilePayout({
        amount: payoutData.Amount,
        phoneNumber: payoutData.Phone,
        currency: payoutData.Currency,
        orderReference: payoutData.OrderReference,
        checksum: payoutData.Checksum,
        exchange: { fromCurrency: "USD", toCurrency: "USD", rate: 1 }
      });

      // 3. Update DB
      await Payout.update(
        {
          status: payoutStatus.status,
          transactionId: payoutStatus.transactionId || null
        },
        { where: { id: payoutData.PayoutId } }
      );

      console.log("Payout completed:", payoutData.OrderReference);

    } catch (error) {
      console.error(
        `Payout failed (${job.attemptsMade + 1}/${job.opts.attempts}) —`,
        error.message
      );

      // VERY IMPORTANT: rethrow so BullMQ retries
      throw error;
    }
  },
  {
    connection: { host: "127.0.0.1", port: 6379 },
     prefix: "designerlock",
    concurrency: 5
  }
);

module.exports = payoutWorker;
