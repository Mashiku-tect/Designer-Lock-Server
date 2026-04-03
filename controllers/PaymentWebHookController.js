// controllers/paymentWebhookController.js
const axios = require("axios");

// Example destination URLs
const DESIGNERLOCK_WEBHOOK_URL = process.env.DESIGNERLOCK_WEBHOOK_URL;
const CHUMBACONNECT_WEBHOOK_URL = process.env.CHUMBACONNECT_WEBHOOK_URL;

/**
 * Forward payment to DesignerLock
 */
const handleDesignerLockPayment = async (payload) => {
  try {
    await axios.post(DESIGNERLOCK_WEBHOOK_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    console.log("Payment forwarded to DesignerLock");
  } catch (error) {
    console.error(
      "DesignerLock forwarding failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Forward payment to ChumbaConnect
 */
const handleChumbaConnectPayment = async (payload) => {
  try {
    await axios.post(CHUMBACONNECT_WEBHOOK_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000,
    });

    console.log("Payment forwarded to ChumbaConnect");
  } catch (error) {
    console.log("Error in Chumba Connect",error);
    // console.error(
    //   "ChumbaConnect forwarding failed:",
    //   error.response?.data || error.message
    // );
    throw error;
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    //console.log("Received webhook payload:", payload);
    //console.log("Processing webhook for orderReference:", payload.data.orderReference);

    const orderReference = payload.data.orderReference; // DL_XXX or CC_XXX

    if (!orderReference) {
      return res.status(400).json({ error: "orderReference missing" });
    }

    // Extract prefix (DL or CC)
   const prefix = orderReference.slice(0, 2);


    switch (prefix) {
      case "DL":
        await handleDesignerLockPayment(payload);
        break;

      case "CC":
        await handleChumbaConnectPayment(payload);
        break;

      default:
        return res.status(400).json({
          error: "Unknown order reference prefix",
        });
    }

    return res.status(200).json({
      status: "Webhook received and forwarded",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to process webhook",
    });
  }
};
