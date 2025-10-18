// debugPayments.js
require('dotenv').config();

const { sequelize, Payment, Product, User } = require('./models');

(async () => {
  try {
    console.log("🔌 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Connection successful");

    const orderRef = "EPGTD98M"; // 👉 change to the one you want to test

    const payment = await Payment.findOne({
      where: { orderReference: orderRef },
      include: [
        {
          model: Product,
          include: [User],
        },
      ],
    });

    if (!payment) {
      console.log(`❌ No payment found for orderReference: ${orderRef}`);
    } else {
      console.log("📦 Payment details:");
      console.dir(payment.toJSON(), { depth: null });
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ DB error:", err.message);
    process.exit(1);
  }
})();
