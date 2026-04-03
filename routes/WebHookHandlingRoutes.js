// routes/paymentWebhook.js
const express = require("express");
const router = express.Router();
const paymentWebhookController = require("../controllers/PaymentWebHookController");

router.post("/clickpesa/webhook", paymentWebhookController.handleWebhook);

module.exports = router;
