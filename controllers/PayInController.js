const crypto = require('crypto');
const axios = require("axios");


const ClickPesaPaymentClient = require('./services/ClickPesaClient');
const {Payment,Payout,User,Product,Notification,Images} = require('../models');
const payoutQueue = require("./queues/PayoutQueue");


const client = new ClickPesaPaymentClient({
  apiKey: process.env.CLICKPESA_API_KEY,
  clientId:process.env.CLICKPESA_CLIENT_ID
});

const MOBILE_MONEY_FEES = [
  { min: 100, max: 999, fee: 52 },
  { min: 1000, max: 1999, fee: 72 },
  { min: 2000, max: 2999, fee: 104 },
  { min: 3000, max: 3999, fee: 116 },
  { min: 4000, max: 4999, fee: 168 },
  { min: 5000, max: 6999, fee: 234 },
  { min: 7000, max: 7999, fee: 360 },
  { min: 8000, max: 9999, fee: 430 },
  { min: 10000, max: 14999, fee: 642 },
  { min: 15000, max: 19999, fee: 680 },
  { min: 20000, max: 29999, fee: 700 },
  { min: 30000, max: 39999, fee: 980 },
  { min: 40000, max: 49999, fee: 1038 },
  { min: 50000, max: 99999, fee: 1460 },
  { min: 100000, max: 199999, fee: 1868 },
  { min: 200000, max: 299999, fee: 2220 },
  { min: 300000, max: 399999, fee: 3180 },
  { min: 400000, max: 499999, fee: 3764 },
  { min: 500000, max: 599999, fee: 4672 },
  { min: 600000, max: 699999, fee: 5712 },
  { min: 700000, max: 799999, fee: 6560 },
  { min: 800000, max: 899999, fee: 7800 },
  { min: 900000, max: 1000000, fee: 8508 },
  { min: 1000001, max: 3000000, fee: 9346 },
  { min: 3000001, max: 5000000, fee: 9890 }
];


function getFixedFee(amount) {
  const feeObj = MOBILE_MONEY_FEES.find(f => amount >= f.min && amount <= f.max);
  return feeObj ? feeObj.fee : 0;
}

//format phone number
function normalizePhoneNumber(phone) {
  if (!phone) return null;

  // Remove all non-digit characters
  phone = phone.replace(/\D/g, '');

  // If starts with '0', replace it with '255'
  if (phone.startsWith('0')) {
    phone = '255' + phone.slice(1);
  }

  // If starts with '255', leave as is
  // If starts with '255' after removing '+', you're good
  else if (phone.startsWith('255')) {
    // Already in international format
  }

  // If starts with anything else (e.g. missing country code), reject
  else {
    return null;
  }

  // Must be exactly 12 digits after formatting (e.g., 255626779507)
  return phone.length === 12 ? phone : null;
}



const SECRET_KEY = process.env.CHECKSUM_SECRET;

// Generate checksum function
function generateChecksum({ orderReference, amount, phoneNumber }) {
  const dataString = `${orderReference}${amount}${phoneNumber}${SECRET_KEY}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
}



//validate phone number operator
function validatePhoneNumber(phoneNumber) {
  // Ensure it's digits only
  if (!/^\d+$/.test(phoneNumber)) {
    return { valid: false, message: "Phone number must contain only digits" };
  }

  // Must start with country code 255 and be 12 digits long
  if (!phoneNumber.startsWith("255") || phoneNumber.length !== 12) {
    return { valid: false, message: "Invalid phone number format" };
  }

  return { valid: true };
}


// Pay (called from React Native app)
exports.pay = async (req, res) => {
  try {
    const { productid, amount, phoneNumber } = req.body;
    if(amount<500){
      return res.status(400).json({success:false,message:"Minimum payment amount is TZS 500"});
    }

    const product = await Product.findOne({ where: { product_id: productid } });
    if(!product){
      return  res.status(404).json({success:false,message:"Product Not Found"});
    }
    if(product.orderTpe==='designFeed'){
      return res.status(400).json({success:false,message:"Payments are not required for Design Feed Orders"});
    }
    
    const user_id = req.user.id;
    //console.log("Body",req.body);
    const { valid, message} = validatePhoneNumber(phoneNumber);

    if (!valid) {
      return res.status(400).json({success:false, message });
    }
    const stringrandom = Math.random().toString(36).substring(2, 10).toUpperCase();
    const orderReference = `DL${stringrandom}`;
    //console.log("Generated Order Reference:", orderReference);

    const checksum = generateChecksum({ orderReference, amount, phoneNumber });

    const paymentData = {
      orderReference,
      amount,
      currency: "TZS",
      phoneNumber,
      fetchSenderDetails: false,
      checksum
    };

    // Optional: preview (can remove if you want)
   const previewresult= await client.previewUSSDPushRequest(paymentData);
  // console.log("preview result",previewresult);

    //remove fetchDetails key
    const paymentDataB = { ...paymentData };
delete paymentDataB.fetchSenderDetails;

    // Initiate payment
    const result = await client.initiateUSSDPushRequest(paymentDataB);
    //console.log("Payment Channel",result.channel);

    //Save to DB
    await Payment.create({
        user_id,
      orderReference,
      product_id: productid,
      amount,
      phone:phoneNumber,
      channel:result.channel,
      status: 'PROCESSING'
    });
    // console.log("Passed Payment Creation");
    res.status(200).json({ success: true, orderReference, data: result,message:"Your Payment is Processed You will be redirected Shortly" });
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ success: false, message:'Something Went Wrong,Try Again Later' });
  }
};

// Check status
exports.checkStatus = async (req, res) => {
  try {
    const { orderReference } = req.params;
    const result = await client.checkUSSDPushTransactionStatus(orderReference);

    const payment = await Payment.findOne({ where: { orderReference } });
    if (payment) {
      payment.status = result.transactionStatus; // SUCCESS / FAILED / PENDING
      await payment.save();
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.handleWebhook = async (req, res) => {
  try {
    
   //console.log("Received Webhook for the second time:", req.body);

    const { event, eventType, data } = req.body;
    const eventName = event || eventType;

    if (!data || !data.orderReference) {
      return res.status(400).json({ success: false, message: "Invalid webhook payload" });
    }

    // Payment success
    if (eventName === "PAYMENT RECEIVED") {
      const {
        paymentId,
        orderReference,
        collectedAmount,
        collectedCurrency,
        status,
        clientId,
        customer = {},
      } = data;

      // Pull payment with product + user (designer) relation
      const payment = await Payment.findOne({
        where: { orderReference },
        include: {
          model: Product,
          include: [User],
        },
      });

      if (!payment) {
        console.warn(`Payment not found for orderReference: ${orderReference}`);
        return res.status(200).json({ success: true });
      }

      // Update payment
      await Payment.update(
        {
          status,
          clientId,
        },
        { where: { orderReference } }
      );

      //Update The Payment Status in the Product Model
      await Product.update(
        { status: "Completed" },
        { where: { product_id: payment.product_id } }
      );

      //find all the images related to that product 
      const productImages = await Images.findAll({ where: { productId: payment.product_id } });
      //append the server URL to each image path
      const products = productImages.map(img => ({
  id: img.id,
  fileType: img.fileType,
  price: payment.amount,
  image: {
    uri: `${process.env.SERVER_URL}/${img.path}`
  }
}));

const notificationData = {
  orderReference:productImages[0]?.id,
  products
};

//store the notification in notification table
await Notification.create({
  userId: payment.user_id, // the one paying
  title: "Payment Received",
  message: `Your payment for product ${payment.product_id} has been received successfully.`,
  type: "PAYMENT_RECEIVED",
  data: notificationData
});


//PUSH THE NOTIFICATION 
// 🔹 PUSH NOTIFICATION TO THE CLIENT 
  const client = await User.findByPk(payment.user_id);
  const expoToken = client?.expoPushToken;

  if (expoToken) {
    const pushMessage = {
      to: expoToken,
      sound: "default",
      title: "Payment Received",
      body: `Your payment for product ${payment.product_id} has been received successfully.`,
      data: {
        params:notificationData,
        screen: "Product",
      },
    };

    try {
      await axios.post("https://exp.host/--/api/v2/push/send", pushMessage, {
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error(
        "Push Notification Error (expired request):",
        err.response?.data || err.message
      );
    }
  }
 

//push notification to designer about the  payment for his product
const designerexpopushtoken = payment.Product?.User?.expoPushToken;
  if (designerexpopushtoken) {
    const pushMessage = {
      to: designerexpopushtoken,
      sound: "default",
      title: "Payment Made For Your Product",
      body: `Your Client Has Made Payment  for product ${payment.Product?.designtitle} `,
      data: {
        
        screen: "Dashboard",
      },
    };

    try {
      await axios.post("https://exp.host/--/api/v2/push/send", pushMessage, {
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error(
        "Push Notification Error (expired request):",
        err.response?.data || err.message
      );
    }
  }


      // Designer phone
      let designerPhone = payment.Product?.User?.phonenumber;
      if (!designerPhone) {
        console.error(`No phone found for designer of product ${payment.product_id}`);
        return res.status(200).json({ success: true });
      }

      //get designers ID to know that the payout is for which designer
      const designerId = payment.Product?.User?.user_id;
      //get the ID of the product to be used in the payout notes
      const productId = payment.Product?.product_id;


      // Normalize phone number to format: 255XXXXXXXXX
designerPhone = normalizePhoneNumber(designerPhone);

if (!designerPhone) {
  console.error(`Invalid phone format for designer of product ${payment.product_id}`);
  return res.status(200).json({ success: true });
}

      //console.log("Designers Phone Number Is",designerPhone);

      // Calculate payout amount
      const fixedFee = getFixedFee(Number(collectedAmount));
      const platformFee = Number(collectedAmount) * 0.02; // 2%
      const payoutAmount = Number(collectedAmount) - fixedFee - platformFee;

      //console.log(`💰 Collected: ${collectedAmount}, Fee: ${fixedFee}, 2%: ${platformFee}, Payout: ${payoutAmount}`);

      // ✅ Correct checksum
      const checksum = generateChecksum({
        orderReference,
        amount: collectedAmount,
        phoneNumber: designerPhone,
      });

      // Trigger payout
      // const payoutData = {
      //   amount: payoutAmount,
      //   phoneNumber: designerPhone,
      //   currency: collectedCurrency,
      //   orderReference: `PO${orderReference}`,
      //   exchange: { fromCurrency: 'USD', toCurrency: 'USD', rate: 1, amount: collectedAmount },
      //   checksum,
      // };


 

      try {
        //const payoutStatus = await client.processPayout(payoutData);
       // const payoutStatus = await client.processMobilePayout(payoutData)


  const payoutRecord = await Payout.create({
          orderReference: orderReference,
          paymentReference: orderReference,
          amount: payoutAmount,
          currency: collectedCurrency,
          phone: designerPhone,
          status:"QUEUED",
          transactionId:  null,
          failureReason:  null,
          designerid: designerId,
          product_id: productId,
        });


        console.log(`✅ Payout record created: ${payoutRecord.orderReference} for designer ${designerPhone}`);
       
                // SCHEDULE JOB
await payoutQueue.add("payout_job", {
  payoutData: {
    PayoutId: payoutRecord.id,
    OrderReference: payoutRecord.orderReference,
    Amount: payoutAmount,
    Currency: collectedCurrency,
    Phone: designerPhone,
    Checksum: checksum
  }
});
   
console.log(`🚀 Payout job scheduled for designer ${designerPhone}`);

        //console.log(`💸 Payout initiated for designer ${designerPhone}`);
      } catch (err) {
        
        console.error("❌ Failed to process payout:", err);

      }
    }

    // ❌ Payment failed
    else if (eventName === "PAYMENT FAILED") {
      const { orderReference, status, message, id, clientId } = data;

      await Payment.update(
        {
          status,
         
          clientId,
        },
        { where: { orderReference } }
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false });
  }
};



//Payout webhook handler (if needed)
exports.handlePayoutWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    // We only care about payout events
    if (event === 'PAYOUT INITIATED') {
      const {
        orderReference,
        status,
        amount,
        currency,
        channel,
        channelProvider,
        notes
      } = data;

      // Find the payout record by orderReference
      const payout = await Payout.findOne({ where: { orderReference } });

      if (!payout) {
        
        return res.status(200).json({ message: 'Payout record not found, no action taken' });
      } else {
        // Update existing payout
        payout.status = status;
        
        await payout.save();
        //console.log(`✅ Payout updated: ${orderReference} → ${status}`);
      }
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('❌ Error processing ClickPesa webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
