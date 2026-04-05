const axios = require("axios");
//const client = require("./ClickPesaClient"); // import your client instance
const ClickPesaPaymentClient = require('./ClickPesaClient');

const client = new ClickPesaPaymentClient({
  apiKey: process.env.CLICKPESA_API_KEY,
  clientId:process.env.CLICKPESA_CLIENT_ID
});

exports.getPlatformBalance = async () => {
  try {
    // 1. Get a valid token from the same client
    const token = await client.getToken();

    // 2. Call the ClickPesa balance endpoint
    const response = await axios.get(
      `${client.baseUrl}/third-parties/account/balance`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
 //console.log("Balance response data:", response.data);
   const balance = Number(
  response.data?.balances?.find(b => b.currency === 'TZS')?.balance ?? 0
);

//console.log("Current ClickPesa balance (TZS):", balance);
    return balance;

  } catch (err) {
    console.error("Balance check error:", err.response?.data || err.message);
    return 0;
  }
};
