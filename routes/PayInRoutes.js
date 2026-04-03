const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PayInController');
const authenticateToken = require('../middleware/authMiddleware');

//router.post('/preview', paymentController.previewPayment);
//router.post('/initiate', paymentController.initiatePayment);
//router.get('/status/:orderReference', paymentController.checkStatus);
router.post('/pay', authenticateToken,paymentController.pay);
// routes/paymentRoutes.js
router.post("/payment/webhook", paymentController.handleWebhook);

//webhook for payout
router.post("/webhook/payoutinitiated", paymentController.handlePayoutWebhook);

module.exports = router;
